// ==================== 8 - Alarm Generation using Buzzer ====================

int buzzerPin = 8; // Buzzer connected to pin 8

void setup() {
  pinMode(buzzerPin, OUTPUT);
}

void loop() {
  // Beep the buzzer 5 times
  for (int i = 0; i < 5; i++) {
    digitalWrite(buzzerPin, HIGH); // Buzzer ON
    delay(500);                    // 500 ms ON

    digitalWrite(buzzerPin, LOW);  // Buzzer OFF
    delay(500);                    // 500 ms OFF
  }

  delay(2000); // Wait 2 seconds
}
