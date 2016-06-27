#include <EEPROM.h>
#include <FS.h>

void setup() {
  // Init Serial for log data
  Serial.begin(115200);
  delay(10);

  // Init EEPROM
  EEPROM.begin(512);

  for (unsigned int t = 0; t < 512; t++) {
    EEPROM.write(t, "");
  }

  // Init SPIFFS
  SPIFFS.begin();
  SPIFFS.format();

  Serial.write("Done!");
}

void loop() {
}
