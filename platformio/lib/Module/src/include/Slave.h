/**
 * Slave.h
 * @author: Renan Vaz <renan.c.vaz@gmail.com>
 */

#ifndef Slave_h
#define Slave_h

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <EEPROM.h>
#include <FS.h>
#include <cstdint>

#include "Protocol.h"

// States
#define SLAVE "1"
#define CONFIG "0"

// Limit of binded commands
#define MAX_CALLBACKS 100

// EEPROM memory address
#define ADDRESS_CONFIG 0
#define EEPROM_SIZE 512

// Access point info
#define AP_PASSWORD "123456789"

// Access point info
#define RECONNECT_DELAY 1000

// Server to connect IP
// const IPAddress HOMEZ_SERVER_IP(192, 168, 4, 1);
const IPAddress HOMEZ_SERVER_IP(192, 168, 15, 10);
const uint16_t HOMEZ_SERVER_PORT = 4123;

struct Config
{
  char deviceMode[2];
  char deviceName[33];
  char ssid[33];
  char password[64];
};

class Slave
{
  public:
  Slave();
  ~Slave();

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
  unsigned long _lastConnectionTry = 0;

  uint8_t _cbIndex = 0;
  const char* _cbNames[MAX_CALLBACKS];
  std::function<void(String*)> _cbFunctions[MAX_CALLBACKS];

  // HTML data for config mode
  String _htmlRoot;
  String _htmlSuccess;

  // Wifi Config data
  Config _data;

  // Device info
  String _ID;
  String _TYPE;
  String _VERSION;

  // Methods
  void _setupModeConfig();
  void _setupModeSlave();
  void _setupModeFormat();

  void _loopModeConfig();
  void _loopModeSlave();

  // void _trigger(const char* eventName);
  void _trigger(const char* eventName, String* params);

  void _loadData();
  void _saveData();
  void _clearData();

  void _handleRootGET();
  void _handleRootPOST();

  void _loopClient();
  void _onMessage(String message);
  void _onPressReset();

  String _parseHTML(String html);
  int8_t _findEventIndex(const char* eventName);
};

#endif
