// Babyphone Récepteur (Côté Parent)
// Reçoit les paquets audio via Wi-Fi (UDP) et les joue avec PWMAudio (GP16)

#include <WiFi.h>
#include <WiFiUdp.h>
#include <PWMAudio.h>

// --- Configuration Wi-Fi ---
const char *ssid = "SSID";
const char *password = "MOTDEPASSE";
// ---------------------------

// Configuration du Récepteur
unsigned int udpPort = 4200;
WiFiUDP Udp;
PWMAudio pwm(16);

// --- PARAMÈTRES AUDIO ---
const int sampleRate = 8000;
// Doit correspondre à l'émetteur
const int packetSizeSamples = 256; 

// --- TAMPON CIRCULAIRE (Le Réservoir) ---
// On prévoit un réservoir assez grand (4096 échantillons = ~0.5 seconde d'audio)
// Cela permet d'absorber les retards du WiFi.
const int RING_BUFFER_SIZE = 4096;
volatile int16_t ringBuffer[RING_BUFFER_SIZE];
volatile int head = 0; // Là où on écrit (WiFi)
volatile int tail = 0; // Là où on lit (Audio)

// Variables de traitement audio
int32_t smoothOffset = 0;
const float alpha = 0.99f;
const int gain = 4; // Gain modéré pour éviter saturation

// Fonction pour ajouter des données dans le réservoir
void writeToBuffer(uint16_t* data, int length) {
  for (int i = 0; i < length; i++) {
    int nextHead = (head + 1) % RING_BUFFER_SIZE;
    if (nextHead != tail) { // Si le réservoir n'est pas plein
      // Conversion immédiate et filtrage DC à l'entrée
      uint16_t raw = data[i];
      smoothOffset = (int32_t)(alpha * smoothOffset + (1.0f - alpha) * raw);
      int16_t sample = (int16_t)((raw - smoothOffset) * gain);
      
      ringBuffer[head] = sample;
      head = nextHead;
    }
  }
}

// --- CALLBACK AUDIO (Interruption) ---
// C'est le cœur du système. Il tourne tout seul.
void audioCallback() {
  while (pwm.availableForWrite()) {
    if (head != tail) {
      // CAS 1 : Il y a de l'audio dans le réservoir
      pwm.write(ringBuffer[tail]);
      tail = (tail + 1) % RING_BUFFER_SIZE;
    } else {
      // CAS 2 : Le réservoir est vide (retard WiFi)
      // SOLUTION AU "TIC" : On écrit 0 (silence) au lieu de s'arrêter ou de répéter
      pwm.write(0);
    }
  }
}

void setup() {
  Serial.begin(115200);
  
  // OPTIMISATION CRITIQUE : WiFi haute performance
  WiFi.noLowPowerMode();

  // Initialisation tampon
  for(int i=0; i<RING_BUFFER_SIZE; i++) ringBuffer[i] = 0;

  pwm.onTransmit(audioCallback);
  pwm.begin(sampleRate);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  Serial.println(WiFi.localIP());

  Udp.begin(udpPort);
}

// Tampon temporaire pour la réception UDP
uint16_t packetBuffer[packetSizeSamples];

void loop() {
  int packetSize = Udp.parsePacket();
  
  if (packetSize) {
    // Si on reçoit des données
    if (packetSize == packetSizeSamples * 2) {
      Udp.read((char*)packetBuffer, packetSize);
      // On verse l'eau dans le grand réservoir
      writeToBuffer(packetBuffer, packetSizeSamples);
    } else {
      // Purge en cas de mauvaise taille
      Udp.flush();
    }
  }
}