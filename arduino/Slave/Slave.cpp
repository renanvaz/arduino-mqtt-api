/**
 * Slave.cpp
 * @author: Renan Vaz
 */

#include "Arduino.h"
#include "Slave.h"

Slave::Slave(String type, String id)
{
  _type = type;
  _id = id;
}

void Slave::debug(HardwareSerial &logger)
{
  _logger = logger;
}

void Slave::setup()
{
  loadData();

  _logger.println("");
  _logger.print("Device mode: ");
  _logger.println(Data.deviceMode);

  _logger.print("Device name: ");
  _logger.println(Data.deviceName);

  if (strcmp(Data.deviceMode, SLAVE.c_str()) == 0) {
    MODE = SLAVE;
    setupModeSlave();
  } else if (strcmp(Data.deviceMode, CONFIG.c_str()) == 0) {
    MODE = CONFIG;
    setupModeConfig();
  } else {
    setupModeFormat();
  }
}

void Slave::loop()
{
  if (MODE == SLAVE) {
    loopSlave();
  } else if (MODE == CONFIG) {
    loopConfig();
  }
}

void Slave::setupModeConfig()
{
  // Init SPIFFS for load the index.html file
  SPIFFS.begin();

  // HTML da pagina principal
  File fileIndex = SPIFFS.open("/index.html", "r");
  File fileSuccess = SPIFFS.open("/success.html", "r");

  _logger.println();
  _logger.println("setupModeConfig");
  _logger.println();

  if (fileIndex) {
    _htmlRoot = fileIndex.readString();
    _logger.println("Success on load \"index.html\" file");
  } else {
    _logger.println("ERROR on loading \"index.html\" file");
  }

  if (fileSuccess) {
    _htmlSuccess = fileSuccess.readString();
    _logger.println("Success on load \"success.html\" file");
  } else {
    _logger.println("ERROR on loading \"success.html\" file");
  }

  delay(10);

  // Creating a WiFi network
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid, password);
  delay(10);

  _logger.println();
  _logger.println();
  _logger.print("SSID:");
  _logger.println(ssid);
  _logger.print("PASS:");
  _logger.println(password);
  _logger.println(WiFi.softAPIP());
  WiFi.printDiag(Serial);

  // Start the server
  _server.on("/", HTTP_GET, handleRootGET);
  _server.on("/", HTTP_POST, handleRootPOST);
  _server.begin();
  delay(10);

  _logger.println();
  _logger.println();
  _logger.println("Server started");
}

void Slave::setupModeSlave()
{
  bool error = false;
  int connectionTries = 0;
  int maxConnectionTries = 20;

  _logger.println();
  _logger.println("setupModeSlave");
  _logger.println();

  // Setup button reset to config mode pin
  pinMode(_BUTTON_PIN, INPUT);

  WiFi.begin(Data.ssid, Data.password);

  // Wait for connection
  _logger.println("");
  _logger.print("Connecting to WiFi...");

  while (WiFi.status() != WL_CONNECTED) {
    if (connectionTries++ < maxConnectionTries) {
      _logger.print(".");
      delay(500);
    } else {
      error = true;
      break;
    }
  }

  if (!error) {
    _logger.println("");
    _logger.print("Connected to ");
    _logger.println(Data.ssid);
    _logger.print("IP address: ");
    _logger.println(WiFi.localIP());
  } else {
    _logger.println("Connection failure... Restarting in mode CONFIG...");
    CONFIG.toCharArray(Data.deviceMode, 2);
    _saveData();

    ESP.restart();
  }
}

void Slave::setupModeFormat()
{
  _logger.println();
  _logger.println("setupModeFormat");
  _logger.println();

  _logger.println("Formating EEPROM...");
  _clearData();

  _logger.println("Saving default Data...");
  CONFIG.toCharArray(Data.deviceMode, 2);
  _saveData();

  _logger.println("Restarting...");
  ESP.restart();
}

void Slave::loopModeConfig()
{
  server.handleClient();
}

void Slave::loopModeSlave()
{
  // If button is pressed
  if (digitalRead(_BUTTON_PIN) == HIGH) {
    while (digitalRead(_BUTTON_PIN) == HIGH) {
       delay(100);
    }

    _logger.println("BUTTON_PRESSED");
    CONFIG.toCharArray(Data.deviceMode, 2);
    saveData();

    _logger.print("Device mode: ");
    _logger.println(Data.deviceMode);

    _logger.println("Restarting...");
    ESP.restart();
  } else {
    if (false) {
      packetSize = UDP.parsePacket();

      if (packetSize) {
        _logger.println("");
        _logger.print("Received packet of size ");
        _logger.println(packetSize);
        _logger.print("From ");
        IPAddress remote = UDP.remoteIP();

        for (i = 0; i < 4; i++) {
          _logger.print(remote[i], DEC);

          if (i < 3) {
            _logger.print(".");
          }
        }

        _logger.print(", port ");
        _logger.println(UDP.remotePort());

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

void Slave::on(String eventName, fn callback)
{
  if (_callbackIndex < _maxCallbacks) {
    _callbackNames[_callbackIndex] = eventName;
    _callbackFunctions[_callbackIndex] = callback;

    _callbackIndex++;
  } else {
    _logger.print("The callbacks limit has been reached: ");
    _logger.print(_maxCallbacks);
  }
}

void Slave::loadData()
{
  EEPROM.begin(_EEPROM_SIZE);

  for (i = 0, l = sizeof(_Data); i < l; i++){
    *((char*)&_Data + i) = EEPROM.read(_ADDRESS_CONFIG + i);
  }

  EEPROM.end();
}

void Slave::saveData()
{
  EEPROM.begin(_EEPROM_SIZE);

  for (i = 0, l = sizeof(_Data); i < l; i++){
    EEPROM.write(_ADDRESS_CONFIG + i, *((char*)&_Data + i));
  }

  EEPROM.end();
}

void Slave::clearData()
{
  EEPROM.begin(_EEPROM_SIZE);

  for (i = 0; i < _EEPROM_SIZE; i++) {
    EEPROM.write(i, NULL);
  }

  EEPROM.end();
}

void Slave::handleRootGET()
{
  server.send(200, "text/html", parseHTML(_htmlRoot));
}

void Slave::handleRootPOST()
{
  String deviceName = server.arg("device-name");
  String ssid       = server.arg("ssid");
  String password   = server.arg("password");

  deviceName.toCharArray(_Data.deviceName, 33);
  ssid.toCharArray(_Data.ssid, 33);
  password.toCharArray(_Data.password, 64);
  SLAVE.toCharArray(_Data.deviceMode, 2);

  saveData();

  server.send(200, "text/html", parseHTML(_htmlSuccess));

  ESP.restart();
}

String Slave::parseHTML(String html)
{
  html.replace("{{ device-type }}", TYPE);
  html.replace("{{ device-id }}", ID);
  html.replace("{{ device-name }}", Data.deviceName);
  html.replace("{{ ssid }}", Data.ssid);
  html.replace("{{ password }}", Data.password);

  return html;
}



