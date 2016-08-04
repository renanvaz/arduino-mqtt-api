/**
 * Slave.h
 * @author: Renan Vaz
 */

#ifndef Slave_h
#define Slave_h

#include "Arduino.h"
#include "ESP8266WiFi.h"
#include "WiFiUdp.h"
#include "ESP8266WebServer.h"
#include "EEPROM.h"
#include "FS.h"

#include "unordered_map"

using namespace std;

// States
#define SLAVE "1"
#define CONFIG "0"

// Limit of binded commands
#define MAX_CALLBACKS 100

// PACKET BUFFER SIZE
#define PACKET_SIZE 512

// EEPROM memory address
#define ADDRESS_CONFIG 0
#define EEPROM_SIZE 512

// Access point info
#define AP_PASSWORD "123456789"

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

  unsigned int RESET_BUTTON_PIN;

  void canDebug(bool debug);

  void setup(const char* id, const char* type, const char* version);
  void loop();

  void send(const char* topic, const char* value); // Send UDP packet

  void on(const char* eventName, function<void(String* params)> cb);

  bool isModeConfig();
  bool isModeSlave();

  void createDefaultAPI();

  private:
  unsigned int i, l;

  // Debug in Serial
  bool _CAN_DEBUG = false;

  int _cbIndex = 0;
  const char* _cbNames[MAX_CALLBACKS];
  function<void(String*)> _cbFunctions[MAX_CALLBACKS];

  // HTML data for config mode
  String _htmlRoot;
  String _htmlSuccess;

  // Wifi Config data
  Config _data;

  // Device info
  const char* _ID;
  const char* _TYPE;
  const char* _VERSION;

  // UDP packet buffer
  char _packetBuffer[PACKET_SIZE]; // UDP_TX_PACKET_MAX_SIZE is too large: 8192

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

  void _onPressReset();
  void _loopClient();

  String _parseHTML(String html);
  int _searchEvent(const char* eventName);
};

#endif
