/**
 * UDPZ.cpp
 * @author: Renan Vaz <renan.c.vaz@gmail.com>
 */

#include "UDPZ.h"

WiFiUDP Udp;
unsigned long now;

UDPZ::UDPZ()
{
  _isConnected = false;
}

UDPZ::~UDPZ()
{
}

void UDPZ::connect(IPAddress ip, uint16_t port)
{
  _ip   = ip;
  _port = port;

  send("+");
}

void UDPZ::reconnect()
{
  send("+");
}

void UDPZ::disconnect()
{
  send("-");
}

bool UDPZ::connected()
{
  return _isConnected;
}

void UDPZ::onConnected(std::function<void()> cb)
{
  _onConnectedCb = cb;
}

void UDPZ::onDisconnected(std::function<void()> cb)
{
  _onDisconnectedCb = cb;
}

void UDPZ::onMessage(std::function<void(String&)> cb)
{
  _onMessageCb = cb;
}

int16_t UDPZ::setup()
{
  uint16_t port      = 4000;
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

void UDPZ::loop()
{
  _packetSize = Udp.parsePacket();

  if (_packetSize) {
    now = millis();

    Udp.read(_packetBuffer, _packetSize);
    _packetBuffer[_packetSize] = '\0';
    _lastTalkTime = now;

    if (_packetBuffer[0] == '.') { // Ping
      send(".");
    } else if (_packetBuffer[0] == '-') { // Disconnect
      _isConnected = false;

      _onDisconnectedCb();
    } else if (_packetBuffer[0] == '+') { // Connect
      _isConnected = true;

      _onConnectedCb();
    } else { // Message
      #ifdef MODULE_CAN_DEBUG
      _remoteIP    = Udp.remoteIP();
      _remotePort  = Udp.remotePort();

      Serial.print(_packetSize);
      Serial.print("B packet received from: ");
      Serial.print(_remoteIP);
      Serial.print(":");
      Serial.println(_remotePort);
      Serial.print("Message: ");
      Serial.println(_packetBuffer);
      #endif

      String message = String(_packetBuffer);

      _onMessageCb(message);
    }
  } else if (_isConnected) {
    now = millis();

    if (now - _lastTalkTime > TIMEOUT) {
      _isConnected = false;

      _onDisconnectedCb();
    }
  }
}

void UDPZ::send(const char* message)
{
  #ifdef MODULE_CAN_DEBUG
  if (strcmp(message, ".") != 0 && strcmp(message, "+") != 0 && strcmp(message, "-") != 0) {
    Serial.print("Send message: ");
    Serial.println(message);
  }
  #endif

  Udp.beginPacket(_ip, _port);
  Udp.write(message);
  Udp.endPacket();
}
