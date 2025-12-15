// Babyphone Emetteur (Côté Bébé) + Calibration + Anti-Pic
// Envoie l'audio UDP et enregistre sur PC via TCP

#include <WiFi.h>
#include <WiFiUdp.h>
#include <WiFiClient.h> 
#include <hardware/adc.h>

// --- Configuration Wi-Fi ---
const char *ssid = "ssid";
const char *password = "mdp";
// ---------------------------

// --- CONFIGURATION RÉSEAU ---
IPAddress receiverIp(192,168,129,191); // IP Babyphone Parent
unsigned int udpPort = 4200;

IPAddress fileReceiverIp(192, 168, 1, 10); // IP de votre PC
const int fileReceiverPort = 5000;

WiFiUDP Udp;          
WiFiClient tcpClient; 

// --- Audio ---
const int micPin = 26; 
const int sampleRate = 8000; 
const int bufferSize = 256; 
uint16_t audioBuffer[bufferSize];
unsigned long lastSampleTime = 0;

// ===============================================
// --- RÉGLAGES DES SEUILS (A AJUSTER AVEC LE TRACEUR) ---
// ===============================================

// 1. Seuil BAS (Silence) : En dessous, on arrête l'enregistrement après un délai
const float QUIET_THRESHOLD_RMS = 40.0;  

// 2. Seuil MOYEN (Déclenchement) : Au dessus, on commence à enregistrer
const float NOISE_THRESHOLD_RMS = 80.0; 

// 3. Seuil HAUT (Plafond Anti-Artefact) : 
// Si le bruit dépasse ça, c'est probablement un bug/tic -> ON COUPE !
const float MAX_NOISE_THRESHOLD = 500.0; 

const long MIN_RECORDING_DURATION_MS = 2000; 

// Variables d'état
bool isRecording = false;
unsigned long recordingStartTime = 0;
uint32_t dataSize = 0; 

// --- Structure WAV ---
struct WavHeader {
  char riff[4] = {'R', 'I', 'F', 'F'};
  uint32_t chunkSize; 
  char wave[4] = {'W', 'A', 'V', 'E'};
  char fmt[4] = {'f', 'm', 't', ' '};
  uint32_t subchunk1Size = 16;
  uint16_t audioFormat = 1; 
  uint16_t numChannels = 1; 
  uint32_t sampleRate = 8000; 
  uint32_t byteRate = 16000; 
  uint16_t blockAlign = 2; 
  uint16_t bitsPerSample = 16; 
  char data[4] = {'d', 'a', 't', 'a'};
  uint32_t subchunk2Size; 
};

// --- FONCTIONS ---

float calculateRMS(const uint16_t* data, int length) {
  long sum = 0;
  for (int i = 0; i < length; i++) {
    int32_t sample = (int32_t)data[i] - 2048; 
    sum += sample * sample;
  }
  return sqrt((float)sum / length);
}

void writeWavHeader(WiFiClient& client) {
  WavHeader header;
  client.write((const uint8_t*)&header, sizeof(header));
}

void createFinalWavHeader(uint8_t* headerBuffer, uint32_t finalDataSize) {
    WavHeader header; 
    header.chunkSize = finalDataSize + 44 - 8;
    header.subchunk2Size = finalDataSize;
    memcpy(headerBuffer, (const uint8_t*)&header, sizeof(WavHeader));
}

// Fonction pour arrêter proprement l'enregistrement
void stopRecording(bool isError = false) {
    if (isRecording && tcpClient.connected()) {
        if (!isError) {
             uint8_t finalHeader[44];
             createFinalWavHeader(finalHeader, dataSize);
             tcpClient.write(finalHeader, 44); 
             Serial.println(" -> Fin normale.");
        } else {
             Serial.println(" -> COUPURE D'URGENCE (Bruit trop fort/Erreur).");
        }
    }
    tcpClient.stop();
    isRecording = false;
}

void setup() {
  Serial.begin(115200);
  WiFi.noLowPowerMode(); 
  adc_init();
  adc_gpio_init(micPin); 
  adc_select_input(0);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); }
  Udp.begin(udpPort);
  
  // En-têtes pour le Traceur Série (Légende)
  Serial.println("RMS_Actuel,Seuil_Silence,Seuil_Declenchement,Seuil_Max_Plafond");
}

void loop() {
  // 1. Acquisition
  unsigned long samplePeriod = 1000000UL / sampleRate; 
  for (int i = 0; i < bufferSize; i++) {
    unsigned long now = micros();
    if (now < lastSampleTime + samplePeriod) {
      delayMicroseconds((lastSampleTime + samplePeriod) - now);
    }
    audioBuffer[i] = adc_read(); 
    lastSampleTime = micros();
  }

  // 2. Diffusion UDP
  Udp.beginPacket(receiverIp, udpPort);
  Udp.write((const uint8_t*)audioBuffer, bufferSize * 2); 
  Udp.endPacket();

  // 3. Calcul RMS
  float rms = calculateRMS(audioBuffer, bufferSize);

  // 4. --- AFFICHAGE POUR CALIBRATION (TRACEUR SERIE) ---
  // Affichez ceci dans Outils > Traceur Série
  Serial.print(rms);
  Serial.print(",");
  Serial.print(QUIET_THRESHOLD_RMS);
  Serial.print(",");
  Serial.print(NOISE_THRESHOLD_RMS);
  Serial.print(",");
  Serial.println(MAX_NOISE_THRESHOLD);

  // 5. Logique d'enregistrement
  
  // Sécurité anti-pic : Si le bruit est TROP fort (artefact), on coupe tout de suite
  if (rms > MAX_NOISE_THRESHOLD) {
      if (isRecording) {
          stopRecording(true); // true = arrêt d'urgence
      }
      return; // On ne fait rien d'autre sur ce cycle
  }

  if (!isRecording) {
      // Démarrage : Bruit > Seuil ET Bruit < Plafond
      if (rms > NOISE_THRESHOLD_RMS) {
          if (tcpClient.connect(fileReceiverIp, fileReceiverPort)) {
              writeWavHeader(tcpClient);
              isRecording = true;
              recordingStartTime = millis();
              dataSize = 0;
          }
      }
  } 
  
  if (isRecording) {
      if (tcpClient.connected()) {
          size_t written = tcpClient.write((const uint8_t*)audioBuffer, bufferSize * 2);
          dataSize += written;
          
          bool isQuiet = (rms < QUIET_THRESHOLD_RMS); 
          bool minDurationMet = (millis() - recordingStartTime) > MIN_RECORDING_DURATION_MS;

          if (isQuiet && minDurationMet) {
              stopRecording(false); // Fin normale
          }
      } else {
          isRecording = false; // Perte connexion
      }
  }
}