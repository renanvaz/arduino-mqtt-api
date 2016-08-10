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

// Server to connect IP
// const IPAddress HOMEZ_SERVER_IP(192, 168, 4, 1);
const IPAddress HOMEZ_SERVER_IP(192, 168, 15, 10);
const int HOMEZ_SERVER_PORT = 4123;

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

  void setup(String& id, String& type, String& version);
  void loop();

  void send(const char* topic, const char* value); // Send UDP packet
  void send(const char* topic, String& value); // Send UDP packet

  void on(const char* eventName, function<void(String* params)> cb);

  bool isModeConfig();
  bool isModeSlave();

  void createDefaultAPI();

  private:
  int _cbIndex = 0;
  const char* _cbNames[MAX_CALLBACKS];
  function<void(String*)> _cbFunctions[MAX_CALLBACKS];

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

  void _onPressReset();
  void _loopClient();

  String _parseHTML(String html);
  int _findEventIndex(const char* eventName);
};

#endif
