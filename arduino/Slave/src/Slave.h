/**
 * Slave.h
 * @author: Renan Vaz
 */

#ifndef Slave_h
#define Slave_h

#define SLAVE "1"
#define CONFIG "0"
#define MAX_CALLBACKS 100

typedef void (*fn)(String *params);

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
    Slave(const char* id, const char* type, const char* version);
    ~Slave();

    unsigned int RESET_BUTTON_PIN;

    void debug(HardwareSerial &logger);
    void setup();
    void loop();
    void on(const char* eventName, fn callback);
    void setAPData(String ssid, String password);
    void sendUDP(const char* topic, const char* value);

    bool isConfigMode();
    bool isSlaveMode();

  private:
    unsigned int i, l;

    int _callbackIndex = 0;
    const char* _callbackNames[MAX_CALLBACKS];
    fn _callbackFunctions[MAX_CALLBACKS];

    // EEPROM memory address
    const unsigned int _ADDRESS_CONFIG = 0;
    const unsigned int _EEPROM_SIZE = 512;

    // Access point info
    String _ap_ssid = "Slave ESP8266"; // system_get_chip_id()
    String _ap_password = "123456789";

    // Logger
    HardwareSerial *_logger;

    // HTML data for config mode
    String _htmlRoot;
    String _htmlSuccess;

    // Wifi Config data
    Config _data;

    // Device info
    const char* _type;
    const char* _id;
    const char* _version;

    // UDP packet buffer
    char _packetBuffer[512]; // UDP_TX_PACKET_MAX_SIZE is too large: 8192

    // Methods
    void _setupModeConfig();
    void _setupModeSlave();
    void _setupModeFormat();

    void _loopModeConfig();
    void _loopModeSlave();

    // void _trigger(const char* eventName);
    void _trigger(const char* eventName, String *params);

    void _loadData();
    void _saveData();
    void _clearData();

    void _handleRootGET();
    void _handleRootPOST();

    void _onPressReset();
    void _loopUDP();

    String _parseHTML(String html);
};

#endif
