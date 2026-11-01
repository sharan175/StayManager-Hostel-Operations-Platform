// ==================== 1(a) ====================

void setup() {
  pinMode(8, OUTPUT);
}

void loop() {
 
  digitalWrite(8, HIGH);
  delay(500);
 
  digitalWrite(8, LOW);

  delay(500);
}


// ==================== 1(b) - Case 1 ====================

int red = 8;
int green = 9;
int button = 7;
int state = 0;

void setup() {
  pinMode(red, OUTPUT);
  pinMode(green, OUTPUT);
  pinMode(button, INPUT_PULLUP);
}

void loop() {
  if (digitalRead(button) == LOW) {
    state++;

    if (state == 1) {
      digitalWrite(red, HIGH);
      digitalWrite(green, LOW);
    }

    if (state == 2) {
      digitalWrite(red, LOW);
      digitalWrite(green, HIGH);
    }

    if (state == 3) {
      digitalWrite(red, LOW);
      digitalWrite(green, LOW);
      state = 0;
    }

    delay(300);
  }
}


// ==================== 1(b) - Case 2 ====================

int red = 8;
int green = 9;
int s1 = 7;
int s2 = 6;

void setup() {
  pinMode(red, OUTPUT);
  pinMode(green, OUTPUT);
  pinMode(s1, INPUT_PULLUP);
  pinMode(s2, INPUT_PULLUP);
}

void loop() {
  if (digitalRead(s1) == LOW) {
    digitalWrite(red, !digitalRead(red));
    delay(300);
  }

  if (digitalRead(s2) == LOW) {
    digitalWrite(green, !digitalRead(green));
    delay(300);
  }
}

