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

  send("_hi");
}

void UDPZ::reconnect()
{
  send("_hi");
}

void UDPZ::disconnect()
{
  send("_bye");
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

    char _packetBuffer[PACKET_SIZE] = {}; // UDP_TX_PACKET_MAX_SIZE is too large: 8192

    Udp.read(_packetBuffer, _packetSize);

    _lastTalkTime = now;

    if (!_isConnected) {
      if (strcmp(_packetBuffer, "_hi") == 0) {
        _isConnected = true;

        _onConnectedCb();
      }
    } else if (_packetBuffer[0] == '_') {
      if (strcmp(_packetBuffer, "_bye") == 0) {
        _isConnected = false;

        _onDisconnectedCb();
      } else if (strcmp(_packetBuffer, "_ping") == 0) {
        send("_ping");
      }
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

      String message = String(_packetBuffer);

      _onMessageCb(message);
    }
  } else if (_isConnected) {
    now = millis();

    // Precisa acompanhar  para ver o que acontece quando resetar
    if (now - _lastTalkTime > TIMEOUT) {
      _isConnected = false;

      _onDisconnectedCb();
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
