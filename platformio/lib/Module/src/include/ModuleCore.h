/**
 * ModuleCore.h
 * @author: Renan Vaz <renan.c.vaz@gmail.com>
 */

#ifndef ModuleCore_h
#define ModuleCoree_h

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <EEPROM.h>
#include <FS.h>
#include <cstdint>

#include "Modes.h"
#include "Device.h"
#include "Data.h"
#include "ModeConfig.h"
#include "ModeSlave.h"

// Access point info
#define AP_PASSWORD "123456789"

class ModuleCore
{
  public:
  ModuleCore();
  ~ModuleCore();

  uint8_t RESET_BUTTON_PIN = D1;
  uint8_t LED_STATUS_PIN = LED_BUILTIN;

  void setup(String& id, String& type, String& version);
  void loop();

  void send(const char* topic); // Send UDP packet
  void send(const char* topic, const char* value); // Send UDP packet
  void send(const char* topic, String& value); // Send UDP packet

  void on(const char* eventName, std::function<void(String*)> cb);

  bool isModeConfig();
  bool isModeSlave();

  void createDefaultAPI();

  private:
  bool _isModeSlave;
  bool _isModeConfig;
  ModeSlave* _modeSlave;
  ModeConfig* _modeConfig;
};

#endif
