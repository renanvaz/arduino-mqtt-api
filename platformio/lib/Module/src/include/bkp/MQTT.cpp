/**
 * MQTT.cpp
 * @author: Renan Vaz <renan.c.vaz@gmail.com>
 */

#include "MQTT.h"

WiFiClient espClient;
PubSubClient mqtt(espClient);
unsigned long now;

MQTT::MQTT()
{
}

MQTT::~MQTT()
{
}

bool MQTT::connected()
{
  return mqtt.connected();
}

void MQTT::onConnected(std::function<void()> cb)
{
  _onConnectedCb = cb;
}

void MQTT::onDisconnected(std::function<void()> cb)
{
  _onDisconnectedCb = cb;
}

void MQTT::onMessage(std::function<void(String&)> cb)
{
  _onMessageCb = cb;
}

int16_t MQTT::setup()
{
  mqtt.setCallback([&](char* topic, byte* payload, unsigned int length){
    String message = String((char*)payload);

    _onMessageCb(message);
  });

  mqtt.subscribe("msg");

  return 0;
}

void MQTT::loop()
{

}

void MQTT::send(const char* message)
{
  #ifdef MODULE_CAN_DEBUG
  Serial.print("Send message: ");
  Serial.println(message);
  #endif

  mqtt.publish("msg", message);
}

void MQTT::connect(IPAddress ip, uint16_t port)
{
  _ip   = ip;
  _port = port;

  mqtt.setServer(ip, port);

  if (mqtt.connect("ESP8266Client")) { // O nome tem que ser o ID da placa
    _onConnectedCb();
  } else {
    // Precisa pensar no que fazer aqui para manter a interface
  }
}

void MQTT::disconnect()
{
  mqtt.disconnect();
  _onDisconnectedCb();
}

void MQTT::reconnect()
{
  if (mqtt.connect("ESP8266Client")) { // O nome tem que ser o ID da placa
    _onConnectedCb();
  } else {
    // Precisa pensar no que fazer aqui para manter a interface
  }
}
