#include "Module.h"

String ID      = "031d8494-9d53-4f2c-bd4c-72e5fc5b3080";
String TYPE    = "Slave Default";
String VERSION = "1.0.0";

void setup() {
  // Init Serial for log data
  Serial.begin(115200);

  Module.RESET_BUTTON_PIN = D1;

  Module.setup(ID, TYPE, VERSION);

  if (Module.isModeSlave()) {
    Module.createDefaultAPI();

    // Create your API here
  }
}

void loop() {
  Module.loop();
}
