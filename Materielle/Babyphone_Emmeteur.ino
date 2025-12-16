// --- BABYPHONE ÉMETTEUR : TEST CONNECTIVITÉ (VERSION ROBUSTE - FIX COMPILATION) ---
// Objectif : Valider le flux BLE -> WiFi sans erreur de librairie.

#include <WiFi.h>
#include <WiFiUdp.h>
#include <EEPROM.h>
#include <BTstackLib.h>
#include <SPI.h>

// ==========================================
// 1. CONFIGURATION
// ==========================================

#define APP_SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define APP_CONFIG_UUID  "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define APP_SCAN_UUID    "86d38e23-747e-461b-94c6-4e5f726715d2"

#define LED_PIN LED_BUILTIN

struct WifiCredentials {
  char ssid[32];
  char password[64];
  bool configured; 
};

bool isInConfigMode = false;
String cachedWifiList = ""; 
String bleBuffer = "";
WiFiUDP UdpDiscovery;
const int DISCOVERY_PORT = 12345;
unsigned long lastDiscoveryTime = 0;

// ==========================================
// 2. GESTION WIFI & BLE
// ==========================================

void setupWifi() {
  EEPROM.begin(512);
  WifiCredentials creds;
  EEPROM.get(0, creds);

  pinMode(LED_PIN, OUTPUT);
  
  // 🟢 AJOUT CRITIQUE : On attend que tu ouvres le moniteur
  digitalWrite(LED_BUILTIN, HIGH); 
  while (!Serial) {
    delay(100); 
  }
  digitalWrite(LED_BUILTIN, LOW); 
  delay(500);

  Serial.println("\n\n--------------------------------");
  Serial.println("--- DÉMARRAGE TEST ÉMETTEUR ---");
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
     Serial.println(">> Aucune config valide en mémoire (EEPROM vide ou effacée).");
  }

  if (connectionSuccess) {
    Serial.println("\n\n--- WIFI CONNECTÉ ---");
    Serial.print("IP: "); Serial.println(WiFi.localIP());
    digitalWrite(LED_PIN, LOW); 
    isInConfigMode = false;
    UdpDiscovery.begin(DISCOVERY_PORT);
  } else {
    Serial.println("\n\n--- ECHEC WIFI OU PAS DE CONFIG -> MODE BLE ---");
    digitalWrite(LED_PIN, HIGH); // LED Fixe = Mode BLE
    isInConfigMode = true;
    
    Serial.println("Lancement du Scan WiFi pour le BLE...");
    int n = WiFi.scanNetworks();
    cachedWifiList = "";
    int max = (n > 10) ? 10 : n;
    for (int i = 0; i < max; ++i) {
       if(String(WiFi.SSID(i)).length() > 0) {
           cachedWifiList += String(WiFi.SSID(i));
           if (i < max - 1) cachedWifiList += "|";
       }
    }
    Serial.println(">> Liste WiFi prête. Publicité BLE démarrée.");
  }
}

// --- CALLBACKS BLE ---

int appWriteCallback(uint16_t value_handle, uint8_t *buffer, uint16_t size) {
  if (isInConfigMode) {
    for (int i=0; i<size; i++) bleBuffer += (char)buffer[i];
    
    if (bleBuffer.indexOf('\n') > 0) {
       Serial.print("Reçu BLE brut: "); Serial.println(bleBuffer);
       bleBuffer.trim();

       if (bleBuffer == "ERASE") {
           Serial.println("Commande ERASE reçue !");
           WifiCredentials empty; 
           empty.configured = false;
           memset(empty.ssid, 0, 32);
           memset(empty.password, 0, 64);
           
           EEPROM.put(0, empty); 
           EEPROM.commit();
           Serial.println("EEPROM effacée. Reboot...");
           delay(1000);
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
          
          Serial.print("Sauvegarde SSID: "); Serial.println(newCreds.ssid);
          
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
// 3. MAIN
// ==========================================

void setup() {
  Serial.begin(115200);
  setupWifi();

  // Setup BLE
  BTstack.setGATTCharacteristicRead(gattReadCallback);
  BTstack.setGATTCharacteristicWrite(appWriteCallback);

  if (isInConfigMode) {
    BTstack.addGATTService(new UUID(APP_SERVICE_UUID));
    BTstack.addGATTCharacteristicDynamic(new UUID(APP_CONFIG_UUID), ATT_PROPERTY_WRITE, 0);
    BTstack.addGATTCharacteristicDynamic(new UUID(APP_SCAN_UUID), ATT_PROPERTY_READ, 0);
  }
  
  // 🔴 LIGNE SUPPRIMÉE : BTstack.setDeviceName("BabyphoneConfig"); 
  // La librairie n'a pas cette fonction.

  BTstack.setup();
  BTstack.startAdvertising();
}

void loop() {
  BTstack.loop();

  if (!isInConfigMode) {
      if (millis() - lastDiscoveryTime > 2000) {
          IPAddress broadcastIp(255, 255, 255, 255);
          UdpDiscovery.beginPacket(broadcastIp, DISCOVERY_PORT);
          String msg = "BABYPHONE|EMITTER|" + WiFi.macAddress();
          UdpDiscovery.print(msg);
          UdpDiscovery.endPacket();
          
          lastDiscoveryTime = millis();
          
          Serial.print("Ping UDP envoyé à 255.255.255.255 : ");
          Serial.println(msg);
      }
  }
}