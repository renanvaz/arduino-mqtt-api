/**
 * Slave.h
 * @author: Renan Vaz
 */

#ifndef Slave_h
#define Slave_h

class Slave
{
  public:
    Slave(String type, String id);

    void debug(HardwareSerial &logger);
    void setup();
    void loop();
    void on(String eventName, fn callback);

    String getMode();
    String getType();
    String getID();

  private:
    // EEPROM memory address
    const unsigned int _ADDRESS_CONFIG;
    const unsigned int _EEPROM_SIZE;

    // Reset push button
    const unsigned int _BUTTON_PIN;

    // Logger
    HardwareSerial* _logger;

    // HTML data for config mode
    String _htmlRoot;
    String _htmlSuccess;

    unsigned int i, l;


    // Wifi Config data
    struct Config
    {
      char deviceMode[2];
      char deviceName[33];
      char ssid[33];
      char password[64];
    };

    Config _Data;

    // Modes
    String SLAVE;
    String CONFIG;
    String _mode;

    // Device info
    String _type;
    String _id;

    // Create an instance of UDP connection
    WiFiUDP UDP;
    int packetSize;

    // Create an instance of the server
    // specify the port to listen
    ESP8266WebServer server;

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
