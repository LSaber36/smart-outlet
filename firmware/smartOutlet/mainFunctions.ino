void blinkLED(uint8_t led, uint16_t blinkSpeed, uint16_t pauseDelay, uint8_t numTimes)
{
  for (int i = 0; i < numTimes; i++)
  {
    digitalWrite(led, HIGH);
    delay(blinkSpeed);
    digitalWrite(led, LOW);
    delay(pauseDelay);
  }
}

void getButtons()
{
  unsigned long prevMillis, pressTime;
  currButtonState = digitalRead(BUTTON_PIN);

  // Check for a button state edge
  if (currButtonState != prevButtonState)
  {
    // If the button has been pressed
    if (currButtonState == 0)
    {
      prevMillis = millis();
    }
    // If the button has been released
    else if (currButtonState == 1)
    {
      // This is where we want to evalulate how long the button has been previously pressed
      pressTime = millis() - prevMillis;

      if (pressTime <= SHORT_PRESS_TIME)
      {
        Serial.println("Short press");

        relayState = !relayState;
        Serial.print("Button status: " + currButtonState);
        Serial.println("  Relay status: " + relayState);
      }
      else if (pressTime <= LONG_PRESS_TIME)
      {
        Serial.println("Long Press");
      }
    }
  }
  
  prevButtonState = currButtonState;
}