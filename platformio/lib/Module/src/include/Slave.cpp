/**
 * Slave.cpp
 * @author: Renan Vaz <renan.c.vaz@gmail.com>
 */

#include "Slave.h"

// Create an instance of the server
// specify the port to listen
ESP8266WebServer server(80);
WiFiUDP Udp;

Slave::Slave()
{
}

Slave::~Slave()
{
}

void Slave::setup(String& id, String& type, String& version)
{
  _ID = id;
  _TYPE = type;
  _VERSION = version;

  _loadData();

  if (isModeSlave()) {
    _setupModeSlave();
  } else if (isModeConfig()) {
    _setupModeConfig();
  } else {
    _setupModeFormat();
  }
}

void Slave::loop()
{
  if (isModeSlave()) {
    _loopModeSlave();
  } else if (isModeConfig()) {
    _loopModeConfig();
  }
}

bool Slave::isModeSlave()
{
  return strcmp(_data.deviceMode, SLAVE) == 0;
}

bool Slave::isModeConfig()
{
  return strcmp(_data.deviceMode, CONFIG) == 0;
}

void Slave::send(const char* topic, String& value)
{
  send(topic, value.c_str());
}

void Slave::send(const char* topic, const char* value)
{
  String message = "";
  message += _ID;
  message += ":";
  message += topic;
  message += ":";
  message += value;

  Udp.beginPacket(HOMEZ_SERVER_IP, HOMEZ_SERVER_PORT);
  Udp.write(message.c_str());
  Udp.endPacket();
}

void Slave::on(const char* eventName, function<void(String* params)> cb)
{
  int8_t foundIndex = _findEventIndex(eventName);

  if (foundIndex == -1) {
    if (_cbIndex < MAX_CALLBACKS) {
      _cbNames[_cbIndex] = eventName;
      _cbFunctions[_cbIndex] = cb;

      _cbIndex++;

      #ifdef MODULE_CAN_DEBUG
        Serial.print("Command created: ");
        Serial.println(eventName);
      #endif
    } else {
      #ifdef MODULE_CAN_DEBUG
        Serial.print("The callbacks limit has been reached: ");
        Serial.println(MAX_CALLBACKS);
      #endif
    }
  } else {
    #ifdef MODULE_CAN_DEBUG
      Serial.print("Cannot override command: ");
      Serial.println(eventName);
    #endif
  }
}

void Slave::_trigger(const char* eventName, String* params)
{
  int8_t foundIndex = _findEventIndex(eventName);

  if (foundIndex != -1) {
    _cbFunctions[foundIndex](params);
  } else {
    #ifdef MODULE_CAN_DEBUG
      Serial.print("Command not found: ");
      Serial.println(eventName);
    #endif
  }
}

int8_t Slave::_findEventIndex(const char* eventName)
{
  int8_t foundIndex = -1;

  for (uint8_t i = 0; i < _cbIndex; i++) {
    if (strcmp(_cbNames[i], eventName) == 0) {
      foundIndex = i;

      break;
    }
  }

  return foundIndex;
}

void Slave::_setupModeConfig()
{
  String ssid;

  // Init SPIFFS for load the index.html file
  SPIFFS.begin();

  // HTML da pagina principal
  File fileIndex = SPIFFS.open("/index.html", "r");
  File fileSuccess = SPIFFS.open("/success.html", "r");

  if (fileIndex) {
    _htmlRoot = fileIndex.readString();
  } else {
    #ifdef MODULE_CAN_DEBUG
      Serial.println("ERROR on loading \"index.html\" file");
    #endif
  }

  if (fileSuccess) {
    _htmlSuccess = fileSuccess.readString();
  } else {
    #ifdef MODULE_CAN_DEBUG
      Serial.println("ERROR on loading \"success.html\" file");
    #endif
  }

  // Creating a WiFi network
  ssid = "Module - ";
  ssid += _TYPE;
  ssid += " (";
  // ssid += _data.deviceName[0] != '\0' ? _data.deviceName : system_get_chip_id();
  ssid += _data.deviceName[0] != '\0' ? _data.deviceName : "Unamed";
  ssid += ")";

  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid.c_str(), AP_PASSWORD);

  #ifdef MODULE_CAN_DEBUG
    Serial.print("SSID: ");
    Serial.println(ssid);
    Serial.print("PASS: ");
    Serial.println(AP_PASSWORD);
    Serial.print("Local IP: ");
    Serial.println(WiFi.softAPIP());
  #endif

  // Start the _server
  server.on("/", HTTP_GET, bind(&Slave::_handleRootGET, this));
  server.on("/", HTTP_POST, bind(&Slave::_handleRootPOST, this));
  server.begin();
}

void Slave::_setupModeSlave()
{
  bool error = false;
  uint8_t connectionTries = 0;
  uint8_t maxConnectionTries = 40;
  uint16_t localPort = 4000; // procurar pela primeira porta livre

  #ifdef MODULE_CAN_DEBUG
    Serial.println("Setup mode Slave");
    Serial.print("Try to connect to: ");
    Serial.println(_data.ssid);
    Serial.print("With password: ");
    Serial.println(_data.password);
  #endif

  WiFi.mode(WIFI_STA);
  WiFi.begin(_data.ssid, _data.password);

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    if (connectionTries++ < maxConnectionTries) {
      delay(500);
    } else {
      error = true;
      break;
    }
  }

  if (!error) {
    #ifdef MODULE_CAN_DEBUG
      Serial.print("Connected to: ");
      Serial.println(_data.ssid);
    #endif

    connectionTries = 0;

    while (Udp.begin(localPort) != 1) {
      localPort++;

      if (localPort < 5000) {
        delay(1);
      } else {
        error = true;
        break;
      }
    }

    if (!error) {
      #ifdef MODULE_CAN_DEBUG
        Serial.print("UDP connection successful on port: ");
        Serial.println(localPort);
      #endif

      // Setup button reset to config mode pin
      pinMode(RESET_BUTTON_PIN, INPUT);

      String message = "";
      message += _ID;   message += "|";
      message += _TYPE; message += "|";
      message += _VERSION;

      send("hi", message);
    } else {
      #ifdef MODULE_CAN_DEBUG
        Serial.println("UDP Connection failed");
      #endif
    }
  } else {
    #ifdef MODULE_CAN_DEBUG
      Serial.println("Connection failure... Restarting in mode CONFIG...");
    #endif

    strcpy(_data.deviceMode, CONFIG);
    _saveData();

    ESP.restart();
  }
}

void Slave::_setupModeFormat()
{
  #ifdef MODULE_CAN_DEBUG
    Serial.println("Setup mode Format");
  #endif

  _clearData();
  _loadData();

  strcpy(_data.deviceMode, CONFIG);

  _saveData();

  #ifdef MODULE_CAN_DEBUG
    Serial.println("Restarting...");
  #endif

  ESP.restart();
}

void Slave::_loopModeConfig()
{
  server.handleClient();
}

void Slave::_loopModeSlave()
{
  // If button is pressed
  if (digitalRead(RESET_BUTTON_PIN) == HIGH) {
    _onPressReset();
  } else {
    _loopClient();
  }
}

void Slave::_onPressReset()
{
  uint16_t startHold, holdTime;

  startHold = millis();

  while (digitalRead(RESET_BUTTON_PIN) == HIGH) {
    delay(100);
  }

  holdTime = millis() - startHold;

  if (holdTime > 5000) {
    #ifdef MODULE_CAN_DEBUG
      Serial.println("Long button reset press.");
    #endif

    _clearData();
  } else {
    #ifdef MODULE_CAN_DEBUG
      Serial.println("Button reset press.");
    #endif
  }

  strcpy(_data.deviceMode, CONFIG);
  _saveData();

  #ifdef MODULE_CAN_DEBUG
    Serial.println("Restarting...");
  #endif

  ESP.restart();
}

void Slave::_loopClient()
{
  uint8_t index;
  uint16_t packetSize, lastFound, topicDivisorAt, remotePort;
  String message, messageTopic, messageParams, params[5];
  IPAddress remoteIP;

  packetSize = Udp.parsePacket();

  if (packetSize) {
    char _packetBuffer[PACKET_SIZE] = {}; // UDP_TX_PACKET_MAX_SIZE is too large: 8192

    remoteIP    = Udp.remoteIP();
    remotePort  = Udp.remotePort();

    Udp.read(_packetBuffer, packetSize);

    #ifdef MODULE_CAN_DEBUG
      Serial.print("New packet recived: ");
      Serial.println(_packetBuffer);
    #endif

    message = String(_packetBuffer);

    topicDivisorAt = message.indexOf(':');
    messageTopic = message.substring(0, topicDivisorAt);
    messageParams = message.substring(topicDivisorAt);

    lastFound = 1;
    index = 0;

    for (uint16_t i = 0, l = messageParams.length(); i < l; i++) {
      if (messageParams[i] == '|') {
        params[index] = messageParams.substring(lastFound, i);

        index++;
        lastFound = i+1;
      }
    }

    params[index] = messageParams.substring(lastFound);

    _trigger(messageTopic.c_str(), params);
  }
}

void Slave::_loadData()
{
  #ifdef MODULE_CAN_DEBUG
    Serial.println("Loading data...");
  #endif

  EEPROM.begin(EEPROM_SIZE);

  for (uint16_t i = 0, l = sizeof(_data); i < l; i++){
    *((char*)&_data + i) = EEPROM.read(ADDRESS_CONFIG + i);
  }

  EEPROM.end();
}

void Slave::_saveData()
{
  #ifdef MODULE_CAN_DEBUG
    Serial.println("Saving data...");
  #endif

  EEPROM.begin(EEPROM_SIZE);

  for (uint16_t i = 0, l = sizeof(_data); i < l; i++){
    EEPROM.write(ADDRESS_CONFIG + i, *((char*)&_data + i));
  }

  EEPROM.end();
}

void Slave::_clearData()
{
  #ifdef MODULE_CAN_DEBUG
    Serial.println("Cleaning data...");
  #endif

  EEPROM.begin(EEPROM_SIZE);

  for (uint16_t i = 0; i < EEPROM_SIZE; i++) {
    EEPROM.write(i, '\0');
  }

  for (uint16_t i = 0, l = sizeof(_data); i < l; i++){
    *((char*)&_data + i) = EEPROM.read(ADDRESS_CONFIG + i);
  }

  EEPROM.end();
}

void Slave::_handleRootGET()
{
  server.send(200, "text/html", _parseHTML(_htmlRoot));
}

void Slave::_handleRootPOST()
{
  String deviceName = server.arg("device-name");
  String ssid       = server.arg("ssid");
  String password   = server.arg("password");

  #ifdef MODULE_CAN_DEBUG
    Serial.print("Device name: ");
    Serial.println(deviceName);
    Serial.print("SSID:");
    Serial.println(ssid);
    Serial.print("Password:");
    Serial.println(password);
  #endif

  strcpy(_data.deviceName, deviceName.c_str());
  strcpy(_data.ssid, ssid.c_str());
  strcpy(_data.password, password.c_str());
  strcpy(_data.deviceMode, SLAVE);

  _saveData();

  server.send(200, "text/html", _parseHTML(_htmlSuccess));

  #ifdef MODULE_CAN_DEBUG
    Serial.println("Restarting...");
  #endif

  ESP.restart();
}

String Slave::_parseHTML(String html)
{
  html.replace("{{ device-type }}", _TYPE);
  html.replace("{{ firmware-version }}", _VERSION);
  html.replace("{{ device-id }}", _ID);
  html.replace("{{ device-name }}", _data.deviceName);
  html.replace("{{ ssid }}", _data.ssid);
  html.replace("{{ password }}", _data.password);

  return html;
}

void Slave::createDefaultAPI()
{
  on("pinMode", [](String* params){
    uint8_t pin = params[0].toInt();
    String mode = params[1];

    pinMode(pin, mode == "OUTPUT" ? OUTPUT : INPUT);
  });

  on("digitalWrite", [](String* params){
    uint8_t pin = params[0].toInt();
    String value = params[1];

    digitalWrite(pin, value == "HIGH" ? HIGH : LOW);
  });
}
