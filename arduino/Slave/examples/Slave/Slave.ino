#include <Slave.h>

// Device firmware type
String TYPE = "Slave Default";
String ID = "031d8494-9d53-4f2c-bd4c-72e5fc5b3080";

Slave slave(TYPE, ID);

void setup() {
  // Init Serial for log data
  Serial.begin(115200);
  delay(10);

  slave.RESET_BUTTON_PIN = D1;

  slave.setAPData("ESP8266 Slave", "123456789");
  slave.debug(Serial);
  slave.setup();

  if (slave.MODE == SLAVE) {
    Serial.println("DEBUG: slave.MODE == SLAVE");

    slave.on("teste", [](String *params){
      Serial.println("Event teste");
      Serial.println(params[0]);
    });
  }

  if (slave.MODE == CONFIG) {
    Serial.println("DEBUG: slave.MODE == CONFIG");
  }
}

void loop() {
  slave.loop();
}
