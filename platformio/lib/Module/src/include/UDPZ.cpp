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

  send("hi");
}

void UDPZ::reconnect()
{
  send("hi");
}

void UDPZ::disconnect()
{
  send("bye");
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

void UDPZ::onMessage(std::function<void(String)> cb)
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

    char _packetBuffer[PACKET_SIZE] = {}; // UDP_TX_PACKET_MAX_SIZE is too large: 8192

    Udp.read(_packetBuffer, _packetSize);

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

      _onMessageCb(String(_packetBuffer));
    }
  } else if (_isConnected) {
    now = millis();

    // Precisa acompanhar  para ver o que acontece quando resetar
    Serial.print(now - _lastTalkTime);
    Serial.print('>');
    Serial.print(TIMEOUT);
    if (now - _lastTalkTime > TIMEOUT) {
      Serial.println(": true");

      _isConnected = false;

      _onDisconnectedCb();
    } else {
      Serial.println(": false");
    }
  }
}

void UDPZ::send(const char* message)
{
  #ifdef MODULE_CAN_DEBUG
  Serial.print("Send message: ");
  Serial.println(message);
  #endif

  Udp.beginPacket(_ip, _port);
  Udp.write(message);
  Udp.endPacket();
}
