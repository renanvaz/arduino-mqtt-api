/**
 * MQTT.h
 * @author: Renan Vaz <renan.c.vaz@gmail.com>
 */

#ifndef MQTT_h
#define MQTT_h

#include <Arduino.h>
#include <cstdint>
#include <functional>
#include "PubSubClient.h"

// PACKET BUFFER SIZE
#define PACKET_SIZE 512

#define TIMEOUT 250

class MQTT
{
  public:
    MQTT();
    ~MQTT();

    int16_t setup();
    void setServer(IPAddress ip, uint16_t port);
    void connect();
    void disconnect();
    bool connected();
    void onConnected(std::function<void()> cb);
    void onDisconnected(std::function<void()> cb);
    void onMessage(std::function<void(String)> cb);
    void loop();
    void send(const char* message);
  private:
    std::function<void()> _onConnectedCb;
    std::function<void()> _onDisconnectedCb;
    std::function<void(String)> _onMessageCb;

    #ifdef MODULE_CAN_DEBUG
    IPAddress _remoteIP;
    uint16_t _remotePort;
    #endif
};

#endif
