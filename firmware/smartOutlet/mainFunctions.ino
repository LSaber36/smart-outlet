void blinkLED(uint8_t led)
{
  digitalWrite(led, HIGH);
  delay(100);
  digitalWrite(led, LOW);
  delay(200);
  digitalWrite(led, HIGH);
  delay(100);
  digitalWrite(led, LOW);
}

void getButtons()
{
  currButtonState = digitalRead(BUTTON_PIN);

  // Check for a button state edge
  if (currButtonState != prevButtonState)
  {
    // If the edge is falling
    if (currButtonState == 0)
    {
      relayState = !relayState;
      Serial.print("Button status: " + currButtonState);
      Serial.println("  Relay status: " + relayState);
    }
  }

  digitalWrite(RELAY_PIN, relayState);
  
  prevButtonState = currButtonState;
}