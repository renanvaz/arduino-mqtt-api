/**
 * Slave.cpp
 * @author: Renan Vaz
 */

#include <Arduino.h>
#include <Slave.h>
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <ESP8266WebServer.h>
#include <EEPROM.h>
#include <FS.h>

Slave::Slave(String type, String id)
{
  _type = type;
  _id = id;
}

void Slave::debug(HardwareSerial &logger)
{
  _logger = &logger;
}

void Slave::setup()
{
  _loadData();

  if (_data.deviceMode == SLAVE) {
    MODE = SLAVE;
    _setupModeSlave();
  } else if (_data.deviceMode == CONFIG) {
    MODE = CONFIG;
    _setupModeConfig();
  } else {
    _setupModeFormat();
  }
}

void Slave::loop()
{
  if (MODE == SLAVE) {
    _loopModeSlave();
  } else if (MODE == CONFIG) {
    _loopModeConfig();
  }
}

void Slave::on(String eventName, fn callback)
{
  if (_callbackIndex < MAX_CALLBACKS) {
    _callbackNames[_callbackIndex] = eventName;
    _callbackFunctions[_callbackIndex] = callback;

    _callbackIndex++;
  } else {
    _log("The callbacks limit has been reached: ");
    _log(MAX_CALLBACKS);
  }
}

void Slave::setAPData(const char* ssid, const char* password)
{
  _ap_ssid = ssid;
  _ap_password = password;
}

void Slave::_log(String text)
{
  if (_logger) {
    _logger->println(text);
  }
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
    _log("ERROR on loading \"index.html\" file");
  }

  if (fileSuccess) {
    _htmlSuccess = fileSuccess.readString();
  } else {
    _log("ERROR on loading \"success.html\" file");
  }

  // Creating a WiFi network
  WiFi.mode(WIFI_AP);
  WiFi.softAP(_ap_ssid, _ap_password);

  _log("SSID: ");
  _log(_ap_ssid);
  _log("PASS: ");
  _log(_ap_password);
  _log("Local IP: ");
  _log(WiFi.softAPIP());

  // Start the server
  _server.on("/", HTTP_GET, _handleRootGET);
  _server.on("/", HTTP_POST, _handleRootPOST);
  _server.begin();
}

void Slave::_setupModeSlave()
{
  bool error = false;
  int connectionTries = 0;
  int maxConnectionTries = 20;

  _log("setupModeSlave");

  // Setup button reset to config mode pin
  pinMode(Slave.BUTTON_PIN, INPUT);

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
    _log("Connected to: "+_data.ssid);
  } else {
    _log("Connection failure... Restarting in mode CONFIG...");

    CONFIG.toCharArray(_data.deviceMode, 2);
    _saveData();

    ESP.restart();
  }
}

void Slave::_setupModeFormat()
{
  _log("setupModeFormat");

  _clearData();

  CONFIG.toCharArray(_data.deviceMode, 2);
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
  if (digitalRead(Slave.BUTTON_PIN) == HIGH) {
    while (digitalRead(Slave.BUTTON_PIN) == HIGH) {
       delay(100);
    }

    CONFIG.toCharArray(_data.deviceMode, 2);
    saveData();

    ESP.restart();
  } else {
    if (false) {
      packetSize = UDP.parsePacket();

      if (packetSize) {
        IPAddress remote = UDP.remoteIP();

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

void Slave::_loadData()
{
  EEPROM.begin(_EEPROM_SIZE);

  for (i = 0, l = sizeof(_Data); i < l; i++){
    *((char*)&_Data + i) = EEPROM.read(_ADDRESS_CONFIG + i);
  }

  EEPROM.end();
}

void Slave::_saveData()
{
  EEPROM.begin(_EEPROM_SIZE);

  for (i = 0, l = sizeof(_Data); i < l; i++){
    EEPROM.write(_ADDRESS_CONFIG + i, *((char*)&_Data + i));
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
  server.send(200, "text/html", parseHTML(_htmlRoot));
}

void Slave::_handleRootPOST()
{
  String deviceName = server.arg("device-name");
  String ssid       = server.arg("ssid");
  String password   = server.arg("password");

  deviceName.toCharArray(_data.deviceName, 33);
  ssid.toCharArray(_data.ssid, 33);
  password.toCharArray(_data.password, 64);
  SLAVE.toCharArray(_data.deviceMode, 2);

  saveData();

  server.send(200, "text/html", parseHTML(_htmlSuccess));

  ESP.restart();
}

String Slave::_parseHTML(String html)
{
  html.replace("{{ device-type }}", TYPE);
  html.replace("{{ device-id }}", ID);
  html.replace("{{ device-name }}", _data.deviceName);
  html.replace("{{ ssid }}", _data.ssid);
  html.replace("{{ password }}", _data.password);

  return html;
}



