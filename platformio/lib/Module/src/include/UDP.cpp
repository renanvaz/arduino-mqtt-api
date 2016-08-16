/**
 * Protocol.cpp
 * @author: Renan Vaz <renan.c.vaz@gmail.com>
 */

#include "Protocol.h"

WiFiUDP Udp;
unsigned long now;

Protocol::Protocol()
{
  _isConnected = false;
}

Protocol::~Protocol()
{
}

void Protocol::setServer(IPAddress ip, uint16_t port)
{
  _ip   = ip;
  _port = port;
}

bool Protocol::connected()
{
  return _isConnected;
}

void Protocol::onConnected(std::function<void()> cb)
{
  _onConnectedCb = cb;
}

void Protocol::onDisconnected(std::function<void()> cb)
{
  _onDisconnectedCb = cb;
}

void Protocol::onMessage(std::function<void(String)> cb)
{
  _onMessageCb = cb;
}

int16_t Protocol::setup()
{
  uint16_t port = 4000;
  uint16_t portLimit = 5000;

  bool error = false;

  while (Udp.begin(port) != 1) {
    port++;

    if (port > portLimit) {
      return -1;
    }
  }

  return port;
}

void Protocol::loop()
{
  _packetSize = Udp.parsePacket();

  if (_packetSize) {
    now = millis();

    char _packetBuffer[PACKET_SIZE] = {}; // UDP_TX_PACKET_MAX_SIZE is too large: 8192

    Udp.read(_packetBuffer, _packetSize);

    #ifdef MODULE_CAN_DEBUG
    _remoteIP    = Udp.remoteIP();
    _remotePort  = Udp.remotePort();

    Serial.print("New packet received from: ");
    Serial.print(_remoteIP);
    Serial.print(":");
    Serial.println(_remotePort);
    Serial.print("Message: ");
    Serial.println(_packetBuffer);
    #endif

    _lastTalkTime = now;

    if (strcmp(_packetBuffer, "hi") == 0) {
      _isConnected = true;

      _onConnectedCb();
    } else if (strcmp(_packetBuffer, "bye") == 0) {
      _isConnected = false;

      _onDisconnectedCb();
    } else if (strcmp(_packetBuffer, "ping") == 0) {
      send("ping");
    } else {
      _onMessageCb(String(_packetBuffer));
    }
  } else if (_isConnected) {
    now = millis();

    if(now - _lastTalkTime > TIMEOUT) {
      _isConnected = false;

      _onDisconnectedCb();
    }
  }
}

void Protocol::send(const char* message)
{
  #ifdef MODULE_CAN_DEBUG
  Serial.print("Send message: ");
  Serial.println(message);
  #endif

  Udp.beginPacket(_ip, _port);
  Udp.write(message);
  Udp.endPacket();
}

void Protocol::connect()
{
  send("hi");
}

void Protocol::disconnect()
{
  send("bye");
}
