/**
 * Slave.cpp
 * @author: Renan Vaz
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

void Slave::canDebug(bool debug)
{
  _CAN_DEBUG = debug;
}

void Slave::setup(const char* id, const char* type, const char* version)
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
  int foundIndex = _findEventIndex(eventName);

  if (foundIndex == -1) {
    if (_cbIndex < MAX_CALLBACKS) {
      _cbNames[_cbIndex] = eventName;
      _cbFunctions[_cbIndex] = cb;

      _cbIndex++;

      if (_CAN_DEBUG) {
        Serial.print("Command created: ");
        Serial.println(eventName);
      }
    } else {
      if (_CAN_DEBUG) {
        Serial.print("The callbacks limit has been reached: ");
        Serial.println(MAX_CALLBACKS);
      }
    }
  } else {
    if (_CAN_DEBUG) {
      Serial.print("Cannot override command: ");
      Serial.println(eventName);
    }
  }
}

void Slave::_trigger(const char* eventName, String* params)
{
  int foundIndex = _findEventIndex(eventName);

  if (foundIndex != -1) {
    _cbFunctions[foundIndex](params);
  } else {
    if (_CAN_DEBUG) {
      Serial.print("Command not found: ");
      Serial.println(eventName);
    }
  }
}

int Slave::_findEventIndex(const char* eventName)
{
  int foundIndex = -1;

  for (i = 0; i < _cbIndex; i++) {
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
    if (_CAN_DEBUG) {
      Serial.println("ERROR on loading \"index.html\" file");
    }
  }

  if (fileSuccess) {
    _htmlSuccess = fileSuccess.readString();
  } else {
    if (_CAN_DEBUG) {
      Serial.println("ERROR on loading \"success.html\" file");
    }
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

  if (_CAN_DEBUG) {
    Serial.print("SSID: ");
    Serial.println(ssid);
    Serial.print("PASS: ");
    Serial.println(AP_PASSWORD);
    Serial.print("Local IP: ");
    Serial.println(WiFi.softAPIP());
  }

  // Start the _server
  server.on("/", HTTP_GET, bind(&Slave::_handleRootGET, this));
  server.on("/", HTTP_POST, bind(&Slave::_handleRootPOST, this));
  server.begin();
}

void Slave::_setupModeSlave()
{
  bool error = false;
  int connectionTries = 0;
  int maxConnectionTries = 40;
  int localPort = 4000; // procurar pela primeira porta livre

  if (_CAN_DEBUG) {
    Serial.println("Setup mode Slave");
    Serial.print("Try to connect to: ");
    Serial.println(_data.ssid);
    Serial.print("With password: ");
    Serial.println(_data.password);
  }

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
    if (_CAN_DEBUG) {
      Serial.print("Connected to: ");
      Serial.println(_data.ssid);
    }

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
      if (_CAN_DEBUG) {
        Serial.print("UDP connection successful on port: ");
        Serial.println(localPort);
      }

      // Setup button reset to config mode pin
      pinMode(RESET_BUTTON_PIN, INPUT);

      String message = "";
      message += _ID;   message += "|";
      message += _TYPE; message += "|";
      message += _VERSION;

      send("hi", message.c_str());
    } else {
      if (_CAN_DEBUG) {
        Serial.println("UDP Connection failed");
      }
    }
  } else {
    if (_CAN_DEBUG) {
      Serial.println("Connection failure... Restarting in mode CONFIG...");
    }

    strcpy(_data.deviceMode, CONFIG);
    _saveData();

    ESP.restart();
  }
}

void Slave::_setupModeFormat()
{
  if (_CAN_DEBUG) {
    Serial.println("Setup mode Format");
  }

  _clearData();
  _loadData();

  strcpy(_data.deviceMode, CONFIG);

  _saveData();

  if (_CAN_DEBUG) {
    Serial.println("Restarting...");
  }

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
  int startHold, holdTime;

  startHold = millis();

  while (digitalRead(RESET_BUTTON_PIN) == HIGH) {
    delay(100);
  }

  holdTime = millis() - startHold;

  if (holdTime > 5000) {
    if (_CAN_DEBUG) {
      Serial.println("Long button reset press.");
    }

    _clearData();
  } else {
    if (_CAN_DEBUG) {
      Serial.println("Button reset press.");
    }
  }

  strcpy(_data.deviceMode, CONFIG);
  _saveData();

  if (_CAN_DEBUG) {
    Serial.println("Restarting...");
  }

  ESP.restart();
}

void Slave::_loopClient()
{
  int packetSize, lastFound, index, topicDivisorAt, remotePort;
  String message, topic, sParams, params[5];
  IPAddress remoteIP;

  packetSize = Udp.parsePacket();

  if (packetSize) {
    char _packetBuffer[PACKET_SIZE] = {}; // UDP_TX_PACKET_MAX_SIZE is too large: 8192

    remoteIP    = Udp.remoteIP();
    remotePort  = Udp.remotePort();

    Udp.read(_packetBuffer, packetSize);

    if (_CAN_DEBUG) {
      Serial.print("New packet recived: ");
      Serial.println(_packetBuffer);
    }

    message = String(_packetBuffer);

    topicDivisorAt = message.indexOf(':');
    topic = message.substring(0, topicDivisorAt);
    sParams = message.substring(topicDivisorAt);

    lastFound = 1;
    index = 0;

    for (i = 0, l = sParams.length(); i < l; i++) {
      if (sParams[i] == '|') {
        params[index] = sParams.substring(lastFound, i);

        index++;
        lastFound = i+1;
      }
    }

    params[index] = sParams.substring(lastFound);

    _trigger(topic.c_str(), params);
  }
}

void Slave::_loadData()
{
  if (_CAN_DEBUG) {
    Serial.println("Loading data...");
  }

  EEPROM.begin(EEPROM_SIZE);

  for (i = 0, l = sizeof(_data); i < l; i++){
    *((char*)&_data + i) = EEPROM.read(ADDRESS_CONFIG + i);
  }

  EEPROM.end();
}

void Slave::_saveData()
{
  if (_CAN_DEBUG) {
    Serial.println("Saving data...");
  }

  EEPROM.begin(EEPROM_SIZE);

  for (i = 0, l = sizeof(_data); i < l; i++){
    EEPROM.write(ADDRESS_CONFIG + i, *((char*)&_data + i));
  }

  EEPROM.end();
}

void Slave::_clearData()
{
  if (_CAN_DEBUG) {
    Serial.println("Cleaning data...");
  }

  EEPROM.begin(EEPROM_SIZE);

  for (i = 0; i < EEPROM_SIZE; i++) {
    EEPROM.write(i, '\0');
  }

  for (i = 0, l = sizeof(_data); i < l; i++){
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

  if (_CAN_DEBUG) {
    Serial.print("Device name: ");
    Serial.println(deviceName);
    Serial.print("SSID:");
    Serial.println(ssid);
    Serial.print("Password:");
    Serial.println(password);
  }

  strcpy(_data.deviceName, deviceName.c_str());
  strcpy(_data.ssid, ssid.c_str());
  strcpy(_data.password, password.c_str());
  strcpy(_data.deviceMode, SLAVE);

  _saveData();

  server.send(200, "text/html", _parseHTML(_htmlSuccess));

  if (_CAN_DEBUG) {
    Serial.println("Restarting...");
  }

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
    Serial.println(millis());

    int pin = params[0].toInt();
    String mode = params[1];

    Serial.println(pin);
    Serial.println(mode == "OUTPUT" ? "OUTPUT" : "INPUT");

    pinMode(pin, mode == "OUTPUT" ? OUTPUT : INPUT);
  });

  on("digitalWrite", [](String* params){
    Serial.println(millis());

    int pin = params[0].toInt();
    String value = params[1];

    Serial.println(pin);
    Serial.println(value);

    digitalWrite(pin, value == "HIGH" ? HIGH : LOW);
  });
}