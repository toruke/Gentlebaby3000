// Babyphone Récepteur (Côté Parent) + Découverte
// Reçoit les paquets audio via Wi-Fi (UDP) et les joue avec PWMAudio (GP16)
// S'annonce sur le réseau tant qu'il n'est pas associé.

#include <WiFi.h>
#include <WiFiUdp.h>
#include <PWMAudio.h>

// --- Configuration Wi-Fi ---
const char *ssid = "ssid";
const char *password = "password";
// ---------------------------

// --- NOUVEAU : GESTION DÉCOUVERTE ---
bool isPaired = false; 
const int DISCOVERY_PORT = 12345;
unsigned long lastDiscoveryTime = 0;

// Configuration du Récepteur
unsigned int udpPort = 4200;
WiFiUDP Udp;
PWMAudio pwm(16);

// --- PARAMÈTRES AUDIO ---
const int sampleRate = 8000;
const int packetSizeSamples = 256; 

// --- TAMPON CIRCULAIRE ---
const int RING_BUFFER_SIZE = 4096;
volatile int16_t ringBuffer[RING_BUFFER_SIZE];
volatile int head = 0; 
volatile int tail = 0; 

// Variables de traitement audio
int32_t smoothOffset = 0;
const float alpha = 0.99f;
const int gain = 4; 

// --- FONCTIONS ---

// NOUVEAU : Fonction de publicité UDP
void broadcastPresence() {
  if (millis() - lastDiscoveryTime > 2000) { // Toutes les 2 secondes
    IPAddress broadcastIp(255, 255, 255, 255);
    
    // Utilisation d'une instance UDP locale pour ne pas perturber l'écoute audio
    WiFiUDP UdpDiscovery; 
    UdpDiscovery.beginPacket(broadcastIp, DISCOVERY_PORT);
    
    // Format: BABYPHONE|RECEIVER|MAC
    String msg = "BABYPHONE|RECEIVER|" + WiFi.macAddress();
    
    UdpDiscovery.print(msg);
    UdpDiscovery.endPacket();
    
    lastDiscoveryTime = millis();
  }
}

void writeToBuffer(uint16_t* data, int length) {
  for (int i = 0; i < length; i++) {
    int nextHead = (head + 1) % RING_BUFFER_SIZE;
    if (nextHead != tail) { 
      uint16_t raw = data[i];
      smoothOffset = (int32_t)(alpha * smoothOffset + (1.0f - alpha) * raw);
      int16_t sample = (int16_t)((raw - smoothOffset) * gain);
      ringBuffer[head] = sample;
      head = nextHead;
    }
  }
}

void audioCallback() {
  while (pwm.availableForWrite()) {
    if (head != tail) {
      pwm.write(ringBuffer[tail]);
      tail = (tail + 1) % RING_BUFFER_SIZE;
    } else {
      pwm.write(0);
    }
  }
}

void setup() {
  Serial.begin(115200);
  WiFi.noLowPowerMode();

  for(int i=0; i<RING_BUFFER_SIZE; i++) ringBuffer[i] = 0;

  pwm.onTransmit(audioCallback);
  pwm.begin(sampleRate);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  Serial.println("Recepteur pret. IP: " + WiFi.localIP().toString());
  Serial.println("Mac: " + WiFi.macAddress());

  Udp.begin(udpPort);
}

uint16_t packetBuffer[packetSizeSamples];

void loop() {
  // 1. GESTION DECOUVERTE (Si pas encore associé)
  if (!isPaired) {
    broadcastPresence();
  }

  // 2. GESTION AUDIO (Réception)
  int packetSize = Udp.parsePacket();
  
  if (packetSize) {
    if (packetSize == packetSizeSamples * 2) {
      Udp.read((char*)packetBuffer, packetSize);
      writeToBuffer(packetBuffer, packetSizeSamples);
    } else {
      Udp.flush();
    }
  }
}