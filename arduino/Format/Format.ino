#include <EEPROM.h>
#include <FS.h>

void setup() {
  // Init Serial for log data
  Serial.begin(115200);
  delay(100);
  Serial.write("");
  Serial.write("");

  // Init EEPROM
  EEPROM.begin(512);

  const char isFormated[] = "FORMATED";

  //for (unsigned int t = 0; t < sizeof(isFormated); t++) {
  //  EEPROM.write(t, *((char*)&isFormated + t));
  //}
  
  //EEPROM.commit();

  EEPROM.write(0, "A");
  EEPROM.commit();

  const char data[] = "123456789";
  const char* data2[64];

  Serial.println("");

  Serial.print("data: ");
  Serial.println(data);
  Serial.println(sizeof(data));

  Serial.print("data2: ");
  Serial.println(sizeof(data2));

  for (unsigned int t = 0; t < sizeof(isFormated); t++){
      Serial.print(t);
      Serial.print(": ");
      Serial.println((char) EEPROM.read(t));
  }
  
  Serial.println(data);
}

void loop() {
}
