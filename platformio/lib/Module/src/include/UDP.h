/**
 * Protocol.h
 * @author: Renan Vaz <renan.c.vaz@gmail.com>
 */

#ifndef Protocol_h
#define Protocol_h

#include <Arduino.h>
#include <WiFiUdp.h>
#include <cstdint>
#include <functional>

// PACKET BUFFER SIZE
#define PACKET_SIZE 512

#define TIMEOUT 250

class Protocol
{
  public:
    Protocol();
    ~Protocol();

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

    IPAddress _ip;
    uint16_t _port;
    unsigned long _lastTalkTime;
    bool _isConnected;

    uint16_t _packetSize;

    #ifdef MODULE_CAN_DEBUG
    IPAddress _remoteIP;
    uint16_t _remotePort;
    #endif
};

#endif
