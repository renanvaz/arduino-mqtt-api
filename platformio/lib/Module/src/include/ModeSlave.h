/**
 * ModeSlave.h
 * @author: Renan Vaz <renan.c.vaz@gmail.com>
 */

#ifndef ModeSlave_h
#define ModeSlave_h

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <cstdint>

#include "Modes.h"
#include "Device.h"
#include "Config.h"
#include "Data.h"
#include "UDPZ.h"

// Limit of binded commands
#define MAX_CALLBACKS 100

// Access point info
#define RECONNECT_DELAY 1000

// Server to connect IP
// const IPAddress HOMEZ_SERVER_IP(192, 168, 4, 1);
const IPAddress SERVER_IP(192, 168, 15, 10);
const uint16_t SERVER_PORT = 4123;

class ModeSlave
{
  public:
  ModeSlave();
  ~ModeSlave();

  uint8_t RESET_BUTTON_PIN = D1;
  uint8_t LED_STATUS_PIN = LED_BUILTIN;

  void setup();
  void loop();

  void send(const char* topic, const char* value); // Send UDP packet

  void on(const char* eventName, std::function<void(String*)> cb);

  void createDefaultAPI();

  private:
  unsigned long _startPressReset;
  unsigned long _lastConnectionTry = 0;

  uint8_t _cbIndex = 0;
  const char* _cbNames[MAX_CALLBACKS];
  std::function<void(String*)> _cbFunctions[MAX_CALLBACKS];

  // void _trigger(const char* eventName);
  void _trigger(const char* eventName, String* params);
  void _onMessage(String message);
  int8_t _findEventIndex(const char* eventName);
};

#endif
