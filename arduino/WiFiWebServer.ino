#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <FS.h>

const char* ssid = "ESP8266 Slave";
const char* password = "123456789";
String html;

// Create an instance of the server
// specify the port to listen on as an argument
ESP8266WebServer server(80);

void setup() {
  Serial.begin(115200);
  delay(10);

  // Init SPIFFS for load the index.html file
  SPIFFS.begin();
  
  // HTML da pagina principal
  File f = SPIFFS.open("/index.html", "r");

  Serial.println();
  Serial.println();
  
  if (f) {
    html = f.readString();
    Serial.println("Success on load \"index.html\" file");
  } else {
    Serial.println("ERROR on loading \"index.html\" file");
  }
  
  delay(10);

  // Creating a WiFi network
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid, password);
  delay(10);

  Serial.println();
  Serial.println();
  Serial.print("SSID:");
  Serial.println(ssid);
  Serial.print("PASS:");
  Serial.println(password);
  Serial.print("IP:");
  Serial.println(WiFi.softAPIP());
  WiFi.printDiag(Serial);
  
  // Start the server
  server.on("/", handleRoot);
  server.begin();
  delay(10);

  Serial.println();
  Serial.println();
  Serial.println("Server started");
}

void loop() {
  server.handleClient();
}

void handleRoot() {
    server.send(200, "text/html", html);
}

