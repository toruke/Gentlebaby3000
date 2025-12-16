// --- BABYPHONE RÉCEPTEUR ULTIME ---
// 1. Config via Bluetooth (Harmonisé avec l'Émetteur)
// 2. Reçoit Audio UDP (Broadcast) et joue sur Speaker
// 3. Annonce sa présence à l'App

#include <WiFi.h>
#include <WiFiUdp.h>
#include <PWMAudio.h> 
#include <EEPROM.h>
#include <BTstackLib.h>
#include <SPI.h>

// ==========================================
// 1. CONFIGURATION
// ==========================================

#define APP_SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define APP_CONFIG_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8" // Espace corrigé ici
#define APP_SCAN_UUID "86d38e23-747e-461b-94c6-4e5f726715d2"   // Espace corrigé ici

#define SPEAKER_PIN 16
#define LED_PIN LED_BUILTIN

struct WifiCredentials { 
    char ssid[32]; 
    char password[64]; 
    bool configured; 
};

bool isInConfigMode = false;
String cachedWifiList = "";
WifiCredentials creds; // Garde cette variable globale pour le BLE Write Callback
String bleBuffer = "";

// Audio & Réseau
WiFiUDP UdpAudio;
WiFiUDP UdpDiscovery;
unsigned int udpPort = 4200;
const int DISCOVERY_PORT = 12345;
IPAddress broadcastIp(255, 255, 255, 255);

PWMAudio pwm(SPEAKER_PIN);
const int packetSizeSamples = 256;
uint16_t packetBuffer[packetSizeSamples];

// Buffer Circulaire
const int RING_BUFFER_SIZE = 4096;
volatile int16_t ringBuffer[RING_BUFFER_SIZE];
volatile int head = 0;
volatile int tail = 0;
int32_t smoothOffset = 0;
const float alpha = 0.99f;
const int gain = 4;
unsigned long lastDiscoveryTime = 0;


// ==========================================
// 2. GESTION WIFI & BLE
// ==========================================

void setupWifi() {
    EEPROM.begin(512);
    // Utilise la variable globale 'creds' ici
    EEPROM.get(0, creds); 

    pinMode(LED_PIN, OUTPUT);

    // Attente du moniteur série et clignotement
    digitalWrite(LED_BUILTIN, HIGH); 
    while (!Serial) { delay(100); }
    digitalWrite(LED_BUILTIN, LOW); 
    delay(500);

    Serial.println("\n\n--------------------------------");
    Serial.println("--- DÉMARRAGE TEST RÉCEPTEUR ---");
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
        
        // Nom d'hôte dynamique (Harmonisation)
        String hostname = "Babyphone-Recepteur-" + String(WiFi.macAddress());
        hostname.replace(":", "");
        WiFi.setHostname(hostname.c_str());
        
        WiFi.begin(creds.ssid, creds.password);

        unsigned long start = millis();
        // Timeout de 15s (Harmonisation)
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

// --- Callbacks BLE ---
int appWriteCallback(uint16_t value_handle, uint8_t *buffer, uint16_t size) {
    if (isInConfigMode) {
        for (int i=0; i<size; i++) bleBuffer += (char)buffer[i];
        if (bleBuffer.indexOf('\n') > 0) {
            bleBuffer.trim();
            if (bleBuffer == "ERASE") {
                WifiCredentials empty; empty.configured = false;
                EEPROM.put(0, empty); EEPROM.commit();
                rp2040.reboot();
            }
            int sep = bleBuffer.indexOf('|');
            if (sep > 0) {
                String s = bleBuffer.substring(0, sep);
                String p = bleBuffer.substring(sep + 1);
                s.trim(); p.trim();
                
                // Utilisation de la variable globale 'creds' ici
                s.toCharArray(creds.ssid, 32);
                p.toCharArray(creds.password, 64);
                creds.configured = true;
                
                EEPROM.put(0, creds);
                EEPROM.commit();
                rp2040.reboot();
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
// 3. AUDIO LOGIC & UDP DISCOVERY
// ==========================================

void broadcastPresence() {
    if (millis() - lastDiscoveryTime > 2000) { 
        UdpDiscovery.beginPacket(broadcastIp, DISCOVERY_PORT);
        // FORMAT: BABYPHONE|RECEIVER|MAC_ADDRESS
        String msg = "BABYPHONE|RECEIVER|" + WiFi.macAddress();
        UdpDiscovery.print(msg);
        UdpDiscovery.endPacket();
        lastDiscoveryTime = millis();
        
        Serial.print("Ping UDP (RECEIVER) envoyé : ");
        Serial.println(msg);
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
            pwm.write(0); // Silence si le buffer est vide
        }
    }
}

// ==========================================
// 4. MAIN SETUP & LOOP
// ==========================================

void setup() {
    Serial.begin(115200);
    for(int i=0; i<RING_BUFFER_SIZE; i++) ringBuffer[i] = 0;
    pwm.onTransmit(audioCallback);
    pwm.begin(8000);

    setupWifi();

    // Setup BLE
    BTstack.setGATTCharacteristicRead(gattReadCallback);
    BTstack.setGATTCharacteristicWrite(appWriteCallback);

    // Les services BLE sont ajoutés UNIQUEMENT en mode configuration (Harmonisation)
    if (isInConfigMode) { 
        BTstack.addGATTService(new UUID(APP_SERVICE_UUID));
        BTstack.addGATTCharacteristicDynamic(new UUID(APP_CONFIG_UUID), ATT_PROPERTY_WRITE, 0);
        BTstack.addGATTCharacteristicDynamic(new UUID(APP_SCAN_UUID), ATT_PROPERTY_READ, 0);
    }

    BTstack.setup();
    BTstack.startAdvertising();

    if (!isInConfigMode) {
        UdpAudio.begin(udpPort);
        UdpDiscovery.begin(DISCOVERY_PORT);
        Serial.println("MODE RECEPTION ACTIF");
    }
}

void loop() {
    BTstack.loop();

    // 1. Gestion du mode configuration
    if (isInConfigMode) {
        // La LED est fixe (HIGH) dans setupWifi pour indiquer le mode config.
        return; 
    }

    // --- Mode Normal (WiFi connecté) ---
    
    // 2. Annonce de présence à l'App (UDP Broadcast)
    broadcastPresence();

    // 3. Réception Audio UDP
    int packetSize = UdpAudio.parsePacket();
    if (packetSize) {
        // Le paquet doit être de la taille exacte (256 échantillons * 2 octets)
        if (packetSize == packetSizeSamples * 2) { 
            UdpAudio.read((char*)packetBuffer, packetSize);
            writeToBuffer(packetBuffer, packetSizeSamples);
        } else {
            UdpAudio.flush();
        }
    }
}