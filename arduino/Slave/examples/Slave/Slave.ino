#include <Slave.h>

// Device firmware type
const char* TYPE = "Slave Default";
const char* ID = "031d8494-9d53-4f2c-bd4c-72e5fc5b3080";
const char* VERSION = "1.0.0";

Slave slave(ID, TYPE, VERSION);

void setup() {
  // Init Serial for log data
  Serial.begin(115200);
  delay(10);

  slave.RESET_BUTTON_PIN = D1;

  Serial.println("");
  Serial.print("PIN: ");
  Serial.println(D2);

  Serial.println(millis());

  slave.setAPData("ESP8266 Slave", "123456789");
  slave.debug(Serial);
  slave.setup();

  if (slave.isSlaveMode()) {
    Serial.println("DEBUG: slave.MODE == SLAVE");

    slave.on("teste", onTeste);
    slave.on("pinMode", onPinMode);
    slave.on("digitalWrite", onDigitalWrite);
    slave.on("digitalRead", onDigitalRead);
  }

  if (slave.isConfigMode()) {
    Serial.println("DEBUG: slave.MODE == CONFIG");
  }
}

void loop() {
  slave.loop();
}

void onTeste(String *params){
  Serial.println("Event teste");
  Serial.println(params[0]);
}

 void onPinMode(String *params){
    Serial.println(millis());
    int pin = atoi(params[0].c_str());

    Serial.println(pin);
    Serial.println(strcmp(params[1].c_str(), "OUTPUT") == 0 ? "OUTPUT" : "INPUT");

    pinMode(pin, strcmp(params[1].c_str(), "OUTPUT") == 0 ? OUTPUT : INPUT);
};

void onDigitalWrite(String *params){
    Serial.println(millis());
    int pin = atoi(params[0].c_str());
    int value = atoi(params[1].c_str());

    Serial.println(pin);
    Serial.println(value);

    digitalWrite(pin, value);
};

void onDigitalRead(String *params)
{
    Serial.println(millis());
    const char* response = params[0].c_str();
    int pin = atoi(params[1].c_str());

    int value = digitalRead(pin);

    Serial.println(pin);
    Serial.println(value);

    slave.sendUDP(response, String(value).c_str());
}
