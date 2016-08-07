#include <Arduino.h>
#line 1 "D:/www/labs/arduino-mqtt-api/platformio/src/main.ino"
#include "Module.h"

const char* ID      = "031d8494-9d53-4f2c-bd4c-72e5fc5b3080";
const char* TYPE    = "Slave Default";
const char* VERSION = "1.0.0";

void setup();

void loop();
#line 7 "D:/www/labs/arduino-mqtt-api/platformio/src/main.ino"
void setup() {
  // Init Serial for log data
  Serial.begin(115200);

  Module.RESET_BUTTON_PIN = D1;

  Module.canDebug(true);
  Module.setup(ID, TYPE, VERSION);

  if (Module.isModeSlave()) {
    Module.createDefaultAPI();

    // Create your API here
  }
}

void loop() {
  Module.loop();
}