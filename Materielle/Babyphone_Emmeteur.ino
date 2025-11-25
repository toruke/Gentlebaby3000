// Babyphone Emetteur (Côté Bébé)
// Lit l'audio analogique (GP26) et l'envoie via Wi-Fi (UDP)

#include <WiFi.h>
#include <WiFiUdp.h>
#include <hardware/adc.h>

// --- Configuration Wi-Fi ---
// REMPLACER AVEC VOS PROPRES INFORMATIONS
const char *ssid = "SSID";
const char *password = "MOTDEPASSE";
// ---------------------------

// ADRESSE IP CRITIQUE : REMPLACER ICI AVEC L'IP QUE VOUS VENEZ DE NOTER !
// Exemple: si le Récepteur a affiché 192.168.1.105, mettez (192, 168, 1, 105)
IPAddress receiverIp(192,168,129,191); 
unsigned int udpPort = 4200;

WiFiUDP Udp;

const int micPin = 26; 
const int sampleRate = 8000; 

// MODIFICATION : Paquets plus petits (32ms d'audio) pour éviter les gros lags
const int bufferSize = 256; 
uint16_t audioBuffer[bufferSize];
unsigned long lastSampleTime = 0;

void setup() {
  Serial.begin(115200);
  
  // OPTIMISATION CRITIQUE : Désactive le mode éco du WiFi pour réduire le bruit électrique
  WiFi.noLowPowerMode(); 

  adc_init();
  adc_gpio_init(micPin); 
  adc_select_input(0);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  Udp.begin(udpPort);
}

void loop() {
  unsigned long samplePeriod = 1000000UL / sampleRate; 

  for (int i = 0; i < bufferSize; i++) {
    unsigned long now = micros();
    if (now < lastSampleTime + samplePeriod) {
      delayMicroseconds((lastSampleTime + samplePeriod) - now);
    }
    audioBuffer[i] = adc_read(); 
    lastSampleTime = micros();
  }

  Udp.beginPacket(receiverIp, udpPort);
  Udp.write((const uint8_t*)audioBuffer, bufferSize * 2); 
  Udp.endPacket();
}