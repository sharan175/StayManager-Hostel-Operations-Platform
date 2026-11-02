void setup() {
  Serial.begin(9600);
}

void loop() {
  int value = analogRead(A0);

  Serial.println(value);

  delay(500);
}

int led = 9;

void setup() {
  pinMode(led, OUTPUT);
}

void loop() {
  for (int i = 0; i <= 255; i++) {
    analogWrite(led, i);
    delay(10);
  }

  for (int i = 255; i >= 0; i--) {
    analogWrite(led, i);
    delay(10);
  }
}

void setup() {
  Serial.begin(9600);
  Serial.println("\nEnter the message:");
}

void loop() {
  if (Serial.available() > 0) {
    char data = Serial.read();

    if (data != '\n' && data != '\r') {
      Serial.println(data);
      delay(150);
    }
  }
}
