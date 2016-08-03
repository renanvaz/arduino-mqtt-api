#include <Slave.h>

// Device firmware type
const char* ID      = "031d8494-9d53-4f2c-bd4c-72e5fc5b3080";
const char* TYPE    = "Slave Default";
const char* VERSION = "1.0.0";

Slave slave(ID, TYPE, VERSION);

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

  slave.send(response, String(value).c_str());
}

void setup() {
  // Init Serial for log data
  Serial.begin(115200);
  delay(100);

  slave.RESET_BUTTON_PIN = D1;

  slave.canDebug(true);
  slave.setup();

  if (slave.isModeSlave()) {
    Serial.println("DEBUG: slave.MODE == SLAVE");

    slave.on("teste", onTeste);
    slave.on("pinMode", onPinMode);
    slave.on("digitalRead", onDigitalRead);
    slave.on("digitalWrite", [](String *params){
      Serial.println(millis());
      int pin = atoi(params[0].c_str());
      int value = atoi(params[1].c_str());

      Serial.println(pin);
      Serial.println(value);

      digitalWrite(pin, value);
    });
  }

  if (slave.isModeConfig()) {
    Serial.println("DEBUG: slave.MODE == CONFIG");
  }
}

void loop() {
  slave.loop();
}
