// ==================== 9 - Temperature and Humidity on Serial Monitor ====================

#include <DHT.h>        // Include DHT sensor library
#define DHTPIN 2        // DHT11 data pin connected to Arduino pin 2
#define DHTTYPE DHT11   // Specify sensor type

DHT dht(DHTPIN, DHTTYPE); // Create DHT object

void setup() {
  Serial.begin(9600);   // Start serial communication
  dht.begin();          // Initialize DHT sensor

  Serial.println("Temperature and Humidity Readings");
  Serial.println("-------------------------------");
}

void loop() {
  float humidity = dht.readHumidity();       // Read humidity
  float temperature = dht.readTemperature(); // Read temperature

  // Check if sensor reading failed
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    delay(2000);
    return;
  }

  // Display values on Serial Monitor
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.print(" %\t");

  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println(" °C");

  delay(2000); // Read every 2 seconds
}
