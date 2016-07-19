#include <ESP8266WiFi.h>
#include <WiFiUDP.h>
#include <ESP8266WebServer.h>
#include <EEPROM.h>
#include <FS.h>

// Callbacks
typedef void(*fn)();

const int _maxCallbacks = 0;
int _callbackIndex = 0;
String _callbackNames[_maxCallbacks];
fn _callbackFunctions[_maxCallbacks];

// EEPROM memory address
unsigned int ADDRESS_CONFIG = 0;
unsigned int EEPROM_SIZE = 512;

unsigned int i, l;

// Reset push button
unsigned int BUTTON_PIN = D1;

// Wifi Config data
struct ConfigStruct {
  char deviceMode[2];
  char deviceName[33];
  char ssid[33];
  char password[64];
} Data;

// Modes
String SLAVE = "1";
String CONFIG = "0";
String MODE;

// Device firmware type
String TYPE = "Slave Default";
String ID = "031d8494-9d53-4f2c-bd4c-72e5fc5b3080";

// SSID and pass of the network config mode
const char* ssid = "ESP8266 Slave";
const char* password = "123456789";

// HTML data for config mode
String htmlRoot;
String htmlSuccess;

// Create an instance of UDP connection
WiFiUDP UDP;
int packetSize;

// Create an instance of the server
// specify the port to listen
ESP8266WebServer server(80);

void setup() {
  // Init Serial for log data
  Serial.begin(115200);
  delay(10);

  loadData();

  Serial.println("");
  Serial.print("Device mode: ");
  Serial.println(Data.deviceMode);

  Serial.print("Device name: ");
  Serial.println(Data.deviceName);

  if (strcmp(Data.deviceMode, SLAVE.c_str()) == 0) {
    Serial.println("equal to SLAVE");
    MODE = SLAVE;
    setupModeSlave();
  } else if (strcmp(Data.deviceMode, CONFIG.c_str()) == 0) {
    Serial.println("equal to CONFIG");
    MODE = CONFIG;
    setupModeConfig();
  } else {
    Serial.println("not equal");
    setupModeFormat();
  }
}

void loop() {
  if (MODE == SLAVE) {
    loopSlave();
  } else if (MODE == CONFIG) {
    loopConfig();
  }
}

void loopConfig() {
  server.handleClient();
}

void loopSlave() {
  // If button is pressed
  if (digitalRead(BUTTON_PIN) == HIGH) {
    while (digitalRead(BUTTON_PIN) == HIGH) {
       delay(100);
    }

    Serial.println("BUTTON_PRESSED");
    CONFIG.toCharArray(Data.deviceMode, 2);
    saveData();

    Serial.print("Device mode: ");
    Serial.println(Data.deviceMode);

    Serial.println("Restarting...");
    ESP.restart();
  } else {
    if (false) {
      packetSize = UDP.parsePacket();

      if (packetSize) {
        Serial.println("");
        Serial.print("Received packet of size ");
        Serial.println(packetSize);
        Serial.print("From ");
        IPAddress remote = UDP.remoteIP();

        for (i = 0; i < 4; i++) {
          Serial.print(remote[i], DEC);

          if (i < 3) {
            Serial.print(".");
          }
        }

        Serial.print(", port ");
        Serial.println(UDP.remotePort());

        String stringBuffer = "teste:param1|param2|param3";

        int topicDivisor = stringBuffer.indexOf(':');
        String topic = stringBuffer.substring(0, topicDivisor);
        String sParams = stringBuffer.substring(topicDivisor);

        String params[5];
        int lastFound = 1;
        int index = 0;

        for (int i = 0, l = sParams.length(); i < l; i++) {
          if (sParams[i] == '|') {
            params[index] = sParams.substring(lastFound, i);

            index++;
            lastFound = i+1;
          }
        }

        params[index] = sParams.substring(lastFound);
      }
    }
  }
}

void on(String eventName, fn callback) {
  if (_callbackIndex < _maxCallbacks) {
    _callbackNames[_callbackIndex] = eventName;
    _callbackFunctions[_callbackIndex] = callback;

    _callbackIndex++;
  } else {
    Serial.print("The callbacks limit has been reached: ");
    Serial.print(_maxCallbacks);
  }
}

void loadData() {
  EEPROM.begin(EEPROM_SIZE);

  for (i = 0, l = sizeof(Data); i < l; i++){
    *((char*)&Data + i) = EEPROM.read(ADDRESS_CONFIG + i);
  }

  EEPROM.end();
}

void saveData() {
  EEPROM.begin(EEPROM_SIZE);

  for (i = 0, l = sizeof(Data); i < l; i++){
    EEPROM.write(ADDRESS_CONFIG + i, *((char*)&Data + i));
  }

  EEPROM.end();
}

void clearData() {
  EEPROM.begin(EEPROM_SIZE);

  for (i = 0; i < EEPROM_SIZE; i++) {
    EEPROM.write(i, NULL);
  }

  EEPROM.end();
}

void handleRootGET() {
  server.send(200, "text/html", parseHTML(htmlRoot));
}

void handleRootPOST() {
  String deviceName = server.arg("device-name");
  String ssid       = server.arg("ssid");
  String password   = server.arg("password");

  deviceName.toCharArray(Data.deviceName, 33);
  ssid.toCharArray(Data.ssid, 33);
  password.toCharArray(Data.password, 64);
  SLAVE.toCharArray(Data.deviceMode, 2);

  saveData();

  server.send(200, "text/html", parseHTML(htmlSuccess));

  ESP.restart();
}

String parseHTML(String html) {
  html.replace("{{ device-type }}", TYPE);
  html.replace("{{ device-id }}", ID);
  html.replace("{{ device-name }}", Data.deviceName);
  html.replace("{{ ssid }}", Data.ssid);
  html.replace("{{ password }}", Data.password);

  return html;
}

void setupModeConfig() {
  // Init SPIFFS for load the index.html file
  SPIFFS.begin();

  // HTML da pagina principal
  File fileIndex = SPIFFS.open("/index.html", "r");
  File fileSuccess = SPIFFS.open("/success.html", "r");

  Serial.println();
  Serial.println("setupModeConfig");
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

void setupModeSlave() {
  bool error = false;
  int connectionTries = 0;
  int maxConnectionTries = 20;

  Serial.println();
  Serial.println("setupModeSlave");
  Serial.println();

  // Setup button reset to config mode pin
  pinMode(BUTTON_PIN, INPUT);

  WiFi.begin(Data.ssid, Data.password);

  // Wait for connection
  Serial.println("");
  Serial.print("Connecting to WiFi...");

  while (WiFi.status() != WL_CONNECTED) {
    if (connectionTries++ < maxConnectionTries) {
      Serial.print(".");
      delay(500);
    } else {
      error = true;
      break;
    }
  }

  if (!error) {
    Serial.println("");
    Serial.print("Connected to ");
    Serial.println(Data.ssid);
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("Connection failure... Restarting in mode CONFIG...");
    CONFIG.toCharArray(Data.deviceMode, 2);
    saveData();

    ESP.restart();
  }
}

void setupModeFormat() {
  Serial.println();
  Serial.println("setupModeFormat");
  Serial.println();

  Serial.println("Formating EEPROM...");
  clearData();

  Serial.println("Saving default Data...");
  CONFIG.toCharArray(Data.deviceMode, 2);
  saveData();

  Serial.println("Restarting...");
  ESP.restart();
}

