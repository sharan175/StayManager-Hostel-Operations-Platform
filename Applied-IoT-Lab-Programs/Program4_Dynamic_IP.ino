// ==================== 4 - Dynamic IP ====================

#include <ESP8266WiFi.h>

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

void setup() {
  Serial.begin(9600);
  delay(2000);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("\nConnecting");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("Wi-Fi Connected");
  Serial.print("Dynamic IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
}

