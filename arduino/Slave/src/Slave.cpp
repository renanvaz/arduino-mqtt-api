/**
 * Slave.cpp
 * @author: Renan Vaz
 */

#include <Arduino.h>
#include <libb64/cencode.h>
#include <Slave.h>
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <ESP8266WebServer.h>
#include <EEPROM.h>
#include <FS.h>

// Create an instance of the server
// specify the port to listen
ESP8266WebServer server(80);
WiFiUDP Udp;

Slave::Slave(String type, String id)
{
  _type = type;
  _id = id;
}

Slave::~Slave()
{
}

void Slave::debug(HardwareSerial &logger)
{
  _logger = &logger;
}

void Slave::setup()
{
  _loadData();

  _logger->println("Mode:");
  _logger->println(_data.deviceMode);

  if (strcmp(_data.deviceMode, SLAVE) == 0) {
    MODE = SLAVE;
    _setupModeSlave();
  } else if (strcmp(_data.deviceMode, CONFIG) == 0) {
    MODE = CONFIG;
    _setupModeConfig();
  } else {
    _setupModeFormat();
  }
}

void Slave::loop()
{
  if (strcmp(MODE, SLAVE) == 0) {
    _loopModeSlave();
  } else if (strcmp(MODE, CONFIG) == 0) {
    _loopModeConfig();
  }
}

void Slave::on(const char* eventName, fn callback)
{
  if (_callbackIndex < MAX_CALLBACKS) {
    _callbackNames[_callbackIndex] = eventName;
    _callbackFunctions[_callbackIndex] = callback;

    _callbackIndex++;
  } else {
    _logger->println("The callbacks limit has been reached: ");
    _logger->println(MAX_CALLBACKS);
  }
}

void Slave::_trigger(const char* eventName, String *params)
{
  bool found = false;
  int foundIndex = 0;

  for (i = 0; i < MAX_CALLBACKS; i++) {
    if (strcmp(_callbackNames[i], eventName) == 0) {
      found = true;
      foundIndex = i;

      break;
    }
  }

  if (found) {
    _callbackFunctions[foundIndex](params);
  } else {
    _logger->println("Event not found: ");
    _logger->println(eventName);
  }
}

void Slave::setAPData(String ssid, String password)
{
  _ap_ssid = ssid;
  _ap_password = password;
}

void Slave::_setupModeConfig()
{
  // Init SPIFFS for load the index.html file
  SPIFFS.begin();

  // HTML da pagina principal
  File fileIndex = SPIFFS.open("/index.html", "r");
  File fileSuccess = SPIFFS.open("/success.html", "r");

  if (fileIndex) {
    _htmlRoot = fileIndex.readString();
  } else {
    _logger->println("ERROR on loading \"index.html\" file");
  }

  if (fileSuccess) {
    _htmlSuccess = fileSuccess.readString();
  } else {
    _logger->println("ERROR on loading \"success.html\" file");
  }

  // Creating a WiFi network
  WiFi.mode(WIFI_AP);
  WiFi.softAP(_ap_ssid.c_str(), _ap_password.c_str());

  _logger->println("SSID: ");
  _logger->println(_ap_ssid);
  _logger->println("PASS: ");
  _logger->println(_ap_password);
  _logger->println("Local IP: ");
  _logger->println(WiFi.softAPIP());

  // Start the _server
  server.on("/", HTTP_GET, std::bind(&Slave::_handleRootGET, this));
  server.on("/", HTTP_POST, std::bind(&Slave::_handleRootPOST, this));
  server.begin();
}

void Slave::_setupModeSlave()
{
  bool error = false;
  int connectionTries = 0;
  int maxConnectionTries = 20;
  int localPort = 4000; // procurar pela primeira porta livre

  _logger->println("setupModeSlave");

  // Setup button reset to config mode pin
  pinMode(RESET_BUTTON_PIN, INPUT);

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
    _logger->println("Connected to: ");
    _logger->println(_data.ssid);

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
      _logger->println("UDP Connection successful");
      _send("hi");
    } else {
      _logger->println("UDP Connection failed");
    }
  } else {
    _logger->println("Connection failure... Restarting in mode CONFIG...");

    strcpy(_data.deviceMode, CONFIG);
    _saveData();

    ESP.restart();
  }
}

void Slave::_setupModeFormat()
{
  _logger->println("setupModeFormat");

  _clearData();

  strcpy(_data.deviceMode, CONFIG);
  _saveData();

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
    _loopUDP();
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
    _logger->println("Clear data");

    _clearData();
  }

  strcpy(_data.deviceMode, CONFIG);
  _saveData();

  ESP.restart();
}

void Slave::_loopUDP()
{
  int packetSize, lastFound, index, topicDivisorAt, remotePort;
  String message, topic, sParams, params[5];
  IPAddress remoteIP;

  packetSize = Udp.parsePacket();

  if (packetSize) {
    remoteIP    = Udp.remoteIP();
    remotePort  = Udp.remotePort();

    Udp.read(_packetBuffer, packetSize);

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

void Slave::_send(const char* message)
{
  IPAddress remoteIP(192, 168, 15, 10);
  int remotePort = 4123;

  Udp.beginPacket(remoteIP, remotePort);
  Udp.write(message);
  Udp.endPacket();
}

void Slave::_loadData()
{
  EEPROM.begin(_EEPROM_SIZE);

  for (i = 0, l = sizeof(_data); i < l; i++){
    *((char*)&_data + i) = EEPROM.read(_ADDRESS_CONFIG + i);
  }

  EEPROM.end();
}

void Slave::_saveData()
{
  EEPROM.begin(_EEPROM_SIZE);

  for (i = 0, l = sizeof(_data); i < l; i++){
    EEPROM.write(_ADDRESS_CONFIG + i, *((char*)&_data + i));
  }

  EEPROM.end();
}

void Slave::_clearData()
{
  EEPROM.begin(_EEPROM_SIZE);

  for (i = 0; i < _EEPROM_SIZE; i++) {
    EEPROM.write(i, NULL);
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

  strcpy(_data.deviceName, deviceName.c_str());
  strcpy(_data.ssid, ssid.c_str());
  strcpy(_data.password, password.c_str());
  strcpy(_data.deviceMode, SLAVE);

  _saveData();

  server.send(200, "text/html", _parseHTML(_htmlSuccess));

  ESP.restart();
}

String Slave::_parseHTML(String html)
{
  html.replace("{{ device-type }}", _type);
  html.replace("{{ device-id }}", _id);
  html.replace("{{ device-name }}", _data.deviceName);
  html.replace("{{ ssid }}", _data.ssid);
  html.replace("{{ password }}", _data.password);

  return html;
}



