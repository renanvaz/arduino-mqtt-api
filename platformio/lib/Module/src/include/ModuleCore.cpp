/**
 * ModuleCore.cpp
 * @author: Renan Vaz <renan.c.vaz@gmail.com>
 */

#include "ModuleCore.h"

ModuleCore::ModuleCore()
{
}

ModuleCore::~ModuleCore()
{
}

void ModuleCore::setup(String& id, String& type, String& version)
{
  id.toCharArray(Device.ID, 37);
  type.toCharArray(Device.TYPE, 26);
  version.toCharArray(Device.VERSION, 12);

  Data.load();

  _isModeConfig = strcmp(Config.deviceMode, CONFIG) == 0;
  _isModeSlave  = strcmp(Config.deviceMode, SLAVE) == 0;

  if (_isModeSlave) {
    _modeSlave = new ModeSlave();
    _modeSlave->setup();
  } else if (_isModeConfig) {
    _modeConfig = new ModeConfig();

    String ssid = "Module - ";
    ssid += Device.TYPE;
    ssid += " (";
    ssid += Config.deviceName[0] != '\0' ? Config.deviceName : String("Unamed ") + String(random(0xffff), HEX);
    ssid += ")";

    _modeConfig->setup(ssid.c_str(), AP_PASSWORD);
  } else {
    #ifdef MODULE_CAN_DEBUG
      Serial.println("Setup mode Format");
    #endif

    Data.clear();
    Data.load();

    strcpy(Config.deviceMode, CONFIG);

    Data.save();

    #ifdef MODULE_CAN_DEBUG
      Serial.println("Restarting...");
    #endif

    ESP.restart();
  }
}

void ModuleCore::loop()
{
  if (_isModeSlave) {
    _modeSlave->loop();
  } else {
    _modeConfig->loop();
  }
}

bool ModuleCore::isModeSlave()
{
  return _isModeSlave;
}

bool ModuleCore::isModeConfig()
{
  return _isModeConfig;
}

void ModuleCore::send(const char* topic)
{
  _modeSlave->send(topic, "");
}

void ModuleCore::send(const char* topic, String& value)
{
  _modeSlave->send(topic, value.c_str());
}

void ModuleCore::send(const char* topic, const char* value)
{
  _modeSlave->send(topic, value);
}

void ModuleCore::on(const char* eventName, std::function<void(String* params)> cb)
{
  _modeSlave->on(eventName, cb);
}

void ModuleCore::createDefaultAPI()
{
  on("pinMode", [](String* params){
    uint8_t pin = params[0].toInt();
    String mode = params[1];

    pinMode(pin, mode == "OUTPUT" ? OUTPUT : INPUT);
  });

  on("digitalWrite", [](String* params){
    uint8_t pin  = params[0].toInt();
    String value = params[1];

    digitalWrite(pin, value == "1" ? HIGH : LOW);
  });

  on("digitalRead", [&](String* params){
    const char* resTopic = params[0].c_str();
    uint8_t pin          = params[1].toInt();
    uint8_t value        = digitalRead(pin);
    String resMessage    = String(value);

    send(resTopic, resMessage);
  });
}
