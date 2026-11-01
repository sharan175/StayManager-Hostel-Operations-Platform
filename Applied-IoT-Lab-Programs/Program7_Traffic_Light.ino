// ==================== 7 - Traffic Light Signal ====================

int redLED = 8;    // Red LED on pin 8
int yellowLED = 9; // Yellow LED on pin 9
int greenLED = 10; // Green LED on pin 10

void setup() {
  pinMode(redLED, OUTPUT);
  pinMode(yellowLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
}

void loop() {
  // 1. Red ON (Stop)
  digitalWrite(redLED, HIGH);
  digitalWrite(yellowLED, LOW);
  digitalWrite(greenLED, LOW);
  delay(5000);      // Red for 5 seconds

  // 2. Yellow ON (Get ready)
  digitalWrite(redLED, LOW);
  digitalWrite(yellowLED, HIGH);
  digitalWrite(greenLED, LOW);
  delay(2000);      // Yellow for 2 seconds

  // 3. Green ON (Go)
  digitalWrite(redLED, LOW);
  digitalWrite(yellowLED, LOW);
  digitalWrite(greenLED, HIGH);
  delay(5000);      // Green for 5 seconds
}
