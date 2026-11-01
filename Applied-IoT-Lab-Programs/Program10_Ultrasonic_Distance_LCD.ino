// ==================== 10 - Distance Measurement Displayed on LCD ====================

#include <LiquidCrystal.h>

// LCD pins (RS, E, D4, D5, D6, D7)
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

// Ultrasonic sensor pins
const int trigPin = 8; // Trigger pin
const int echoPin = 9; // Echo pin

void setup() {
  lcd.begin(16, 2);          // Initialize 16x2 LCD
  pinMode(trigPin, OUTPUT);  // Trigger as output
  pinMode(echoPin, INPUT);   // Echo as input

  lcd.clear();
  lcd.print("Distance Measurement");
  lcd.setCursor(0, 1);
  lcd.print("Using Ultrasonic");
  delay(2000);
  lcd.clear();
}

void loop() {
  // Send 10 microsecond HIGH pulse to trigger pin
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Read the echo time
  long duration = pulseIn(echoPin, HIGH);

  // Calculate distance in cm
  float distance = duration * 0.034 / 2;

  // Display distance on LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Distance: ");

  lcd.setCursor(0, 1);
  lcd.print(distance);
  lcd.print(" cm");

  delay(500); // Update every 0.5 seconds
}
