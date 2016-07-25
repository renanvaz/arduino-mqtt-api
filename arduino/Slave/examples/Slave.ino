#include <Slave.h>

// Device firmware type
String TYPE = "Slave Default";
String ID = "031d8494-9d53-4f2c-bd4c-72e5fc5b3080";

Slave slave(TYPE, ID);

void setup() {
  // Init Serial for log data
  Serial.begin(115200);
  delay(10);

  Slave.BUTTON_PIN = D1;

  slave.setApData("ESP8266 Slave", "123456789");
  slave.debug(Serial);
  slave.setup();

  if (slave.MODE == SLAVE) {
    //slave.on("teste", function(){
      //Serial.println("Event teste");
    //});
  }
}

void loop() {
  slave.loop();
}
