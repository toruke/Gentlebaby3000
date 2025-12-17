// --- BABYPHONE ÉMETTEUR : SESSION TCP + CONFIG BLE ROBUSTE ---
// 1. Démarre, tente de se connecter au WiFi (via EEPROM).
// 2. Si échec -> Mode Config BLE.
// 3. Si succès -> Se connecte au SERVEUR PC (TCP) et stream le micro.

#include <WiFi.h>
#include <WiFiClient.h> // Pour le TCP
#include <EEPROM.h>
#include <BTstackLib.h>
#include <SPI.h>
#include <hardware/adc.h> // Pour le micro du Pico W

// ==========================================
// 1. CONFIGURATION
// ==========================================

// ⚠️⚠️ À MODIFIER AVEC L'IP DE VOTRE PC (SERVEUR PYTHON) ⚠️⚠️
const char* SERVER_IP = "192.168.129.45"; 
const int SERVER_PORT = 5000;

// Config Micro
const int micPin = 26; 
const int sampleRate = 8000; 
const int bufferSize = 256; // Doit correspondre au serveur (taille des paquets)
uint16_t audioBuffer[bufferSize];

// Config BLE
#define APP_SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define APP_CONFIG_UUID  "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define APP_SCAN_UUID    "86d38e23-747e-461b-94c6-4e5f726715d2"

#define LED_PIN LED_BUILTIN

// Structures & Variables Globales
struct WifiCredentials {
  char ssid[32];
  char password[64];
  bool configured; 
};

bool isInConfigMode = false;
String cachedWifiList = ""; 
String bleBuffer = "";
WiFiClient tcpClient; // Client TCP pour envoyer l'audio
unsigned long lastSampleTime = 0;

// ==========================================
// 2. GESTION WIFI & BLE (Votre code Robuste)
// ==========================================

void setupWifi() {
  EEPROM.begin(512);
  WifiCredentials creds;
  EEPROM.get(0, creds);

  pinMode(LED_PIN, OUTPUT);
  
  // Attente moniteur série
  digitalWrite(LED_BUILTIN, HIGH); 
  while (!Serial) { delay(100); }
  digitalWrite(LED_BUILTIN, LOW); 
  delay(500);

  Serial.println("\n\n--------------------------------");
  Serial.println("--- DÉMARRAGE ÉMETTEUR (TCP) ---");
  Serial.println("--------------------------------");
  Serial.print("MAC Address: "); Serial.println(WiFi.macAddress());

  bool connectionSuccess = false;

  if (creds.configured && String(creds.ssid).length() > 0) {
     Serial.print(">> Config trouvée. Connexion à: ["); 
     Serial.print(creds.ssid);
     Serial.println("]");
     
     WiFi.disconnect(true);
     delay(100);
     WiFi.mode(WIFI_STA);
     
     String hostname = "Babyphone-Emetteur-" + String(WiFi.macAddress());
     hostname.replace(":", "");
     WiFi.setHostname(hostname.c_str());
     
     WiFi.begin(creds.ssid, creds.password);

     unsigned long start = millis();
     while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) { 
       digitalWrite(LED_PIN, !digitalRead(LED_PIN)); 
       delay(250); 
       Serial.print(".");
     }
     
     if (WiFi.status() == WL_CONNECTED) connectionSuccess = true;
  } else {
     Serial.println(">> Aucune config valide en mémoire.");
  }

  if (connectionSuccess) {
    Serial.println("\n\n--- WIFI CONNECTÉ ---");
    Serial.print("IP: "); Serial.println(WiFi.localIP());
    digitalWrite(LED_PIN, LOW); 
    isInConfigMode = false;
  } else {
    Serial.println("\n\n--- ECHEC WIFI -> MODE BLE ---");
    digitalWrite(LED_PIN, HIGH); // LED Fixe = Mode BLE
    isInConfigMode = true;
    
    Serial.println("Scan WiFi...");
    int n = WiFi.scanNetworks();
    cachedWifiList = "";
    int max = (n > 10) ? 10 : n;
    for (int i = 0; i < max; ++i) {
       if(String(WiFi.SSID(i)).length() > 0) {
           cachedWifiList += String(WiFi.SSID(i));
           if (i < max - 1) cachedWifiList += "|";
       }
    }
    Serial.println(">> Publicité BLE démarrée.");
  }
}

// --- CALLBACKS BLE ---

int appWriteCallback(uint16_t value_handle, uint8_t *buffer, uint16_t size) {
  if (isInConfigMode) {
    for (int i=0; i<size; i++) bleBuffer += (char)buffer[i];
    
    if (bleBuffer.indexOf('\n') > 0) {
       bleBuffer.trim();

       if (bleBuffer == "ERASE") {
           Serial.println("Commande ERASE !");
           WifiCredentials empty; 
           empty.configured = false;
           EEPROM.put(0, empty); EEPROM.commit();
           rp2040.reboot();
           return 0;
       }
       
       int sep = bleBuffer.indexOf('|');
       if (sep > 0) {
          WifiCredentials newCreds;
          String s = bleBuffer.substring(0, sep);
          String p = bleBuffer.substring(sep + 1);
          s.trim(); p.trim(); 
          
          s.toCharArray(newCreds.ssid, 32);
          p.toCharArray(newCreds.password, 64);
          newCreds.configured = true;
          
          EEPROM.put(0, newCreds);
          if (EEPROM.commit()) {
             Serial.println("Config sauvegardée ! Reboot...");
             delay(1000);
             rp2040.reboot();
          }
       }
       bleBuffer = ""; 
    }
  }
  return 0;
}

uint16_t gattReadCallback(uint16_t value_handle, uint8_t * buffer, uint16_t buffer_size) {
  if (isInConfigMode) {
    if (buffer) {
       int len = cachedWifiList.length();
       if (len > buffer_size) len = buffer_size;
       memcpy(buffer, cachedWifiList.c_str(), len);
       return len;
    }
    return cachedWifiList.length();
  }
  return 0;
}

// ==========================================
// 3. MAIN SETUP
// ==========================================

void setup() {
  Serial.begin(115200);

  // 1. Initialisation Micro (ADC)
  adc_init();
  adc_gpio_init(micPin);
  adc_select_input(0); // Le micro est sur GP26 (ADC0)

  // 2. Initialisation WiFi (Votre fonction)
  setupWifi();

  // 3. Initialisation BLE
  BTstack.setGATTCharacteristicRead(gattReadCallback);
  BTstack.setGATTCharacteristicWrite(appWriteCallback);

  if (isInConfigMode) {
    BTstack.addGATTService(new UUID(APP_SERVICE_UUID));
    BTstack.addGATTCharacteristicDynamic(new UUID(APP_CONFIG_UUID), ATT_PROPERTY_WRITE, 0);
    BTstack.addGATTCharacteristicDynamic(new UUID(APP_SCAN_UUID), ATT_PROPERTY_READ, 0);
  }
  
  BTstack.setup();
  BTstack.startAdvertising();
}

// ==========================================
// 4. MAIN LOOP (AUDIO STREAMING)
// ==========================================

void loop() {
  // Gestion BLE permanente
  BTstack.loop();

  // Si on est en mode configuration, on ne fait rien d'autre
  if (isInConfigMode) {
     return;
  }

  // --- LOGIQUE SESSION / STREAMING ---
  
  // 1. Gestion de la connexion au serveur PC
  if (!tcpClient.connected()) {
    // Si on n'est pas connecté, on essaie de joindre le serveur
    // La LED est éteinte si pas de session active
    digitalWrite(LED_PIN, LOW); 
    
    // Tentative de connexion (timeout implicite)
    if (tcpClient.connect(SERVER_IP, SERVER_PORT)) {
      Serial.println("✅ Connecté au serveur PC ! Session active.");
      digitalWrite(LED_PIN, HIGH); // LED allumée = Session active & Audio en cours
    } else {
      // Petite pause pour ne pas spammer le réseau si le serveur est éteint
      // On continue BTstack.loop() pour garder le BLE actif si besoin, mais ici le wifi est prio
      delay(500); 
      return; 
    }
  }

  // 2. Acquisition Audio (Uniquement si connecté au serveur)
  unsigned long samplePeriod = 1000000UL / sampleRate;
  
  for (int i = 0; i < bufferSize; i++) {
    unsigned long now = micros();
    if (now >= lastSampleTime + samplePeriod) {
       // Lecture ADC (Valeur brute 12-bits : 0-4095)
       audioBuffer[i] = adc_read(); 
       lastSampleTime = micros();
    } else {
       // Si on est en avance, on attend un tout petit peu
       // (Boucle vide pour la précision temporelle)
    }
    // Sécurité pour garder le rythme
    while(micros() < lastSampleTime + samplePeriod);
  }

  // 3. Envoi au serveur (TCP)
  // On envoie le paquet brut. Le serveur Python s'occupe de filtrer le silence.
  tcpClient.write((const uint8_t*)audioBuffer, bufferSize * 2);
}