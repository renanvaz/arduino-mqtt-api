/**
 * ModeSlave.cpp
 * @author: Renan Vaz <renan.c.vaz@gmail.com>
 */

#include "ModeSlave.h"

// USE MQTT or UDP (for UDP comment the line below)
UDPZ protocol;

// Add interupts for button press (more performance)
uint8_t resetButtonPin;
long _startPressReset;

void _onReleaseReset(){
  uint16_t holdTime = (uint16_t) (millis() - _startPressReset);

  detachInterrupt(resetButtonPin);

  if (holdTime > 5000) {
    #ifdef MODULE_CAN_DEBUG
      Serial.println("Long button reset press.");
    #endif

    Data.clear();
  } else {
    #ifdef MODULE_CAN_DEBUG
      Serial.println("Button reset press.");
    #endif
  }

  strcpy(Config.deviceMode, CONFIG);
  Data.save();

  #ifdef MODULE_CAN_DEBUG
    Serial.println("Restarting...");
  #endif

  ESP.restart();
}

void _onPressReset(){
  _startPressReset = millis();
  detachInterrupt(resetButtonPin);
  attachInterrupt(resetButtonPin, _onReleaseReset, FALLING);
}

ModeSlave::ModeSlave()
{
}

ModeSlave::~ModeSlave()
{
}

void ModeSlave::send(const char* topic, const char* value)
{
  char message[PACKET_SIZE];
  strcpy(message, topic);
  strcat(message, ":");
  strcat(message, value);

  protocol.send(message);
}

void ModeSlave::on(const char* eventName, std::function<void(String* params)> cb)
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

void ModeSlave::_trigger(const char* eventName, String* params)
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

int8_t ModeSlave::_findEventIndex(const char* eventName)
{
  for (uint8_t i = 0; i < _cbIndex; i++) {
    if (strcmp(_cbNames[i], eventName) == 0) {
      return i;
    }
  }

  return -1;
}

void ModeSlave::setup()
{
  bool error = false;
  uint8_t connectionTries = 0;
  uint8_t maxConnectionTries = 40;
  int16_t localPort;

  #ifdef MODULE_CAN_DEBUG
    Serial.println("Setup mode ModeSlave");
    Serial.print("Try to connect to: ");
    Serial.println(Config.ssid);
    Serial.print("With password: ");
    Serial.println(Config.password);
  #endif

  WiFi.mode(WIFI_STA);
  WiFi.begin(Config.ssid, Config.password);

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    #ifdef MODULE_CAN_DEBUG
      Serial.print("Try: ");
      Serial.println(connectionTries);
    #endif

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
      Serial.println(Config.ssid);
    #endif

    localPort = protocol.setup();

    if (localPort != -1) {
      #ifdef MODULE_CAN_DEBUG
        Serial.print("UDP connection successful on port: ");
        Serial.println(localPort);
      #endif

      // Setup button reset to config mode pin
      pinMode(RESET_BUTTON_PIN, INPUT);
      resetButtonPin = RESET_BUTTON_PIN;

      attachInterrupt(RESET_BUTTON_PIN, _onPressReset, RISING);

      protocol.onConnected([&](){
        #ifdef MODULE_CAN_DEBUG
          Serial.println("Connected to the server");
        #endif

        String message = "";
        message += Device.ID; message += "|";
        message += Device.TYPE; message += "|";
        message += Device.VERSION;

        send("setDevice", message.c_str());
      });

      protocol.onDisconnected([&](){
        _lastConnectionTry = millis();

        #ifdef MODULE_CAN_DEBUG
          Serial.println("Disconnected from the server");
        #endif
      });

      protocol.onMessage([&](String& message){
        _onMessage(message);
      });

      _lastConnectionTry = millis();
      protocol.connect(SERVER_IP, SERVER_PORT);
    } else {
      #ifdef MODULE_CAN_DEBUG
        Serial.println("UDP Connection failed");
      #endif
    }
  } else {
    #ifdef MODULE_CAN_DEBUG
      Serial.println("Connection failure... Restarting in mode CONFIG...");
    #endif

    strcpy(Config.deviceMode, CONFIG);
    Data.save();

    ESP.restart();
  }
}

void ModeSlave::loop()
{
  protocol.loop();

  if (!protocol.connected()) {
    unsigned long now = millis();

    if ((now - _lastConnectionTry) > RECONNECT_DELAY) {
      _lastConnectionTry = now;

      protocol.reconnect();
    }
  }
}

void ModeSlave::_onMessage(String& message)
{
  uint8_t index;
  int16_t charAt;
  String messageTopic, messageParams, params[5];

  charAt         = message.indexOf(':');
  messageTopic   = message.substring(0, charAt);
  messageParams  = message.substring(charAt);

  charAt = 1;
  index  = 0;

  for (uint16_t i = 0, l = messageParams.length(); i < l; i++) {
    if (messageParams[i] == '|') {
      params[index] = messageParams.substring(charAt, i);

      index++;
      charAt = i+1;
    }
  }

  params[index] = messageParams.substring(charAt);

  _trigger(messageTopic.c_str(), params);
}
