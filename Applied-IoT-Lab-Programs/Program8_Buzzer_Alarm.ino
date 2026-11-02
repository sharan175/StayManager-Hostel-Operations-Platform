int buzzerPin = 8;

void setup() {
  pinMode(buzzerPin, OUTPUT);
}

void loop() {
  for (int i = 0; i < 5; i++) {
    digitalWrite(buzzerPin, HIGH);
    delay(500);

    digitalWrite(buzzerPin, LOW);
    delay(500);
  }

  delay(2000);
}
