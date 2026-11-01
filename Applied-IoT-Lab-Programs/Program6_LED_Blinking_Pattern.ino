// ==================== 6 - Controlling LEDs Blinking Pattern ====================

// LED pins
int redLED = 8;
int yellowLED = 9;
int greenLED = 10;

void setup() {
  pinMode(redLED, OUTPUT);
  pinMode(yellowLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
}

void loop() {
  // Pattern 1: Red LED ON
  digitalWrite(redLED, HIGH);
  digitalWrite(yellowLED, LOW);
  digitalWrite(greenLED, LOW);
  delay(1000);

  // Pattern 2: Yellow LED ON
  digitalWrite(redLED, LOW);
  digitalWrite(yellowLED, HIGH);
  digitalWrite(greenLED, LOW);
  delay(1000);

  // Pattern 3: Green LED ON
  digitalWrite(redLED, LOW);
  digitalWrite(yellowLED, LOW);
  digitalWrite(greenLED, HIGH);
  delay(1000);

  // Pattern 4: All LEDs ON
  digitalWrite(redLED, HIGH);
  digitalWrite(yellowLED, HIGH);
  digitalWrite(greenLED, HIGH);
  delay(1000);

  // All LEDs OFF
  digitalWrite(redLED, LOW);
  digitalWrite(yellowLED, LOW);
  digitalWrite(greenLED, LOW);
  delay(1000);
}
