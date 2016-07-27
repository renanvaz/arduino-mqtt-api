/**
 * Slave.h
 * @author: Renan Vaz
 */

#ifndef Slave_h
#define Slave_h

#define SLAVE "1"
#define CONFIG "0"
#define MAX_CALLBACKS 100

typedef void(*fn)();

class WiFiUDP;
class ESP8266WebServer;

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
    Slave(String type, String id);
    ~Slave();

    unsigned int BUTTON_PIN;
    String MODE;

    void debug(HardwareSerial &logger);
    void setup();
    void loop();
    void on(String eventName, fn callback);
    void setAPData(String ssid, String password);

    String getMode();
    String getType();
    String getID();

  private:
    unsigned int i, l;

    int _callbackIndex = 0;
    String _callbackNames[MAX_CALLBACKS];
    fn _callbackFunctions[MAX_CALLBACKS];

    // EEPROM memory address
    const unsigned int _ADDRESS_CONFIG = 0;
    const unsigned int _EEPROM_SIZE = 512;

    // Access point info
    String _ap_ssid = "Slave ESP8266";
    String _ap_password = "123456789";

    // Logger
    HardwareSerial *_logger;

    // HTML data for config mode
    String _htmlRoot;
    String _htmlSuccess;

    // Wifi Config data
    Config _data;

    // Device info
    String _type;
    String _id;

    // Create an instance of UDP connection
    WiFiUDP *_udp;

    // Methods
    void _setupModeConfig();
    void _setupModeSlave();
    void _setupModeFormat();

    void _loopModeConfig();
    void _loopModeSlave();

    void _loadData();
    void _saveData();
    void _clearData();

    void _handleRootGET();
    void _handleRootPOST();

    String _parseHTML(String html);
};

#endif
