#include <ESP8266WiFi.h>
#include <WiFiUDP.h>
#include <ESP8266WebServer.h>
#include <EEPROM.h>
#include <FS.h>

const char* ssid = "ESP8266 Slave";
const char* password = "123456789";
String htmlRoot;
String htmlSuccess;

unsigned int CONFIG_START = 1;
unsigned int CONFIG_FLAG_START = 0;

unsigned int MODE;

unsigned int BUTTON_PIN = D1;
unsigned bool BUTTON_PRESSED = false;

// Create an instance of UDP connection
WiFiUDP UDP;

// Create an instance of the server
// specify the port to listen
ESP8266WebServer server(80);

// Wifi Config data
struct ConfigStruct {
  char ssid[32];
  char senha[63];
} wifiConfig;

enum MODES { 
  CONFIG = 0,
  SLAVE = 1
};

void setup() {
  // Init Serial for log data
  Serial.begin(115200);
  delay(10);

  // Init EEPROM for load connection saved data
  EEPROM.begin(512);

  MODE = EEPROM.read(CONFIG_FLAG_START);

  if (MODE == MODES.SLAVE) {
    setupUDPSlave();
  } else {
    setupModeConfig();
  }
}

void loop() {
  if (MODE == MODES.SLAVE) {
      BUTTON_PRESSED = false;
    
      while(digitalRead(BUTTON_PIN) == HIGH) {
         BUTTON_PRESSED = true;
      }

      if (BUTTON_PRESSED) {
        EEPROM.write(CONFIG_FLAG_START, 0);
  
        EEPROM.commit();

        ESP.restart();
      }
  } else {
    server.handleClient();
  }
}

void handleRootGET() {
    server.send(200, "text/html", htmlRoot);
}

void handleRootPOST() {
    server.send(200, "text/html", htmlSuccess);
    ESP.restart();
}

void saveConfig() {
  for (unsigned int t = 0; t < sizeof(wifiConfig); t++) {
    EEPROM.write(CONFIG_START + t, *((char*)&wifiConfig + t));
  }
  
  EEPROM.commit();
}

void loadConfig () {
    for (unsigned int t = 0; t < sizeof(wifiConfig); t++){
        *((char*)&wifiConfig + t) = EEPROM.read(CONFIG_START + t);
    }
}

void setupModeConfig() {
  // Init SPIFFS for load the index.html file
  SPIFFS.begin();
  
  // HTML da pagina principal
  File fileIndex = SPIFFS.open("/index.html", "r");
  File fileSuccess = SPIFFS.open("/success.html", "r");

  Serial.println();
  Serial.println();
  
  if (fileIndex) {
    htmlRoot = fileIndex.readString();
    Serial.println("Success on load \"index.html\" file");
  } else {
    Serial.println("ERROR on loading \"index.html\" file");
  }

  if (fileSuccess) {
    htmlSuccess = fileSuccess.readString();
    Serial.println("Success on load \"success.html\" file");
  } else {
    Serial.println("ERROR on loading \"success.html\" file");
  }
  
  delay(10);

  // Creating a WiFi network
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid, password);
  delay(10);

  Serial.println();
  Serial.println();
  Serial.print("SSID:");
  Serial.println(ssid);
  Serial.print("PASS:");
  Serial.println(password);
  Serial.println(WiFi.softAPIP());
  WiFi.printDiag(Serial);
  
  // Start the server
  server.on("/", HTTP_GET, handleRootGET);
  server.on("/", HTTP_POST, handleRootPOST);
  server.begin();
  delay(10);

  Serial.println();
  Serial.println();
  Serial.println("Server started");
}

void setupUDPSlave() {
  pinMode(BUTTON_CONFIG, INPUT);
}

