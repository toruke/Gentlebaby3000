// Babyphone Emetteur (Côté Bébé) + Calibration + Anti-Pic + Découverte
// Envoie l'audio UDP, enregistre sur PC via TCP, et s'annonce sur le réseau

#include <WiFi.h>
#include <WiFiUdp.h>
#include <WiFiClient.h> 
#include <hardware/adc.h>

// --- Configuration Wi-Fi ---
const char *ssid = "ssid";
const char *password = "password";
// ---------------------------

// --- NOUVEAU : GESTION DÉCOUVERTE ---
// Mettre à true si l'appareil est déjà associé (plus tard via mémoire interne)
bool isPaired = false; 
const int DISCOVERY_PORT = 12345;
unsigned long lastDiscoveryTime = 0;

// --- CONFIGURATION RÉSEAU ---
IPAddress receiverIp(xxx,xxx,xxx,xxx); // IP Babyphone Parent
unsigned int udpPort = 4200;

IPAddress fileReceiverIp(xxx,xxx,xxx,xxx); // IP de votre PC
const int fileReceiverPort = 5000;

WiFiUDP Udp;          
WiFiClient tcpClient; 

// --- Audio ---
const int micPin = 26; 
const int sampleRate = 8000; 
const int bufferSize = 256; 
uint16_t audioBuffer[bufferSize];
unsigned long lastSampleTime = 0;

// --- SEUILS VAD ---
const float QUIET_THRESHOLD_RMS = 1050.0;  
const float NOISE_THRESHOLD_RMS = 1200.0; 
const float MAX_NOISE_THRESHOLD = 2000.0; 
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

// NOUVEAU : Fonction de publicité UDP
void broadcastPresence() {
  if (millis() - lastDiscoveryTime > 2000) { // Toutes les 2 secondes
    IPAddress broadcastIp(255, 255, 255, 255);
    WiFiUDP UdpDiscovery; // Instance temporaire pour ne pas bloquer le flux audio
    UdpDiscovery.beginPacket(broadcastIp, DISCOVERY_PORT);
    
    // Format: BABYPHONE|EMITTER|MAC
    String msg = "BABYPHONE|EMITTER|" + WiFi.macAddress();
    
    UdpDiscovery.print(msg);
    UdpDiscovery.endPacket();
    
    lastDiscoveryTime = millis();
    // Serial.println("Broadcast sent: " + msg); 
  }
}

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

void stopRecording(bool isError = false) {
    if (isRecording && tcpClient.connected()) {
        if (!isError) {
             uint8_t finalHeader[44];
             createFinalWavHeader(finalHeader, dataSize);
             tcpClient.write(finalHeader, 44); 
             Serial.println(" -> Fin normale.");
        } else {
             Serial.println(" -> COUPURE D'URGENCE.");
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
  
  Serial.println("Emetteur pret. IP: " + WiFi.localIP().toString());
  Serial.println("Mac: " + WiFi.macAddress());
}

void loop() {
  // 1. GESTION DECOUVERTE (Si pas encore associé)
  if (!isPaired) {
    broadcastPresence();
  }

  // 2. Acquisition Audio
  unsigned long samplePeriod = 1000000UL / sampleRate; 
  for (int i = 0; i < bufferSize; i++) {
    unsigned long now = micros();
    if (now < lastSampleTime + samplePeriod) {
      delayMicroseconds((lastSampleTime + samplePeriod) - now);
    }
    audioBuffer[i] = adc_read(); 
    lastSampleTime = micros();
  }

  // 3. Diffusion UDP (Toujours actif pour le récepteur)
  Udp.beginPacket(receiverIp, udpPort);
  Udp.write((const uint8_t*)audioBuffer, bufferSize * 2); 
  Udp.endPacket();

  // 4. Calcul RMS & Enregistrement PC
  float rms = calculateRMS(audioBuffer, bufferSize);
  
  // Traceur série (décommenter si besoin de recalibrer)
  // Serial.print(rms); Serial.print(","); Serial.print(NOISE_THRESHOLD_RMS); Serial.println(...);

  // Sécurité anti-pic
  if (rms > MAX_NOISE_THRESHOLD) {
      if (isRecording) stopRecording(true);
      return; 
  }

  if (!isRecording) {
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
              stopRecording(false); 
          }
      } else {
          isRecording = false; 
      }
  }
}