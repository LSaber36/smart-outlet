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
      releasedPressTime = millis() - prevMillis;

      if (releasedPressTime <= SHORT_PRESS_TIME)
      {
        Serial.println("Short press");

        if (buttonPressCount == 0)
        {
          prevButtonCountTime = millis();
        }

        buttonPressCount ++;
        // relayState = !relayState;
      }
      else if (releasedPressTime <= LONG_PRESS_TIME)
      {
        Serial.println("Long Press");
      }
    }
  }
  else if (currButtonState == 0)
  {
    depressedPressTime = millis();

    if (depressedPressTime - prevMillis > LONG_PRESS_TIME)
    {
      // Trigger bluetooth to start
      Serial.println("Really long press while holding");
      pairingMode();
    }
  }

  // Check for multi button press timeout
  buttonCountTime = millis();
  if (buttonCountTime - prevButtonCountTime < MULTI_BUTTON_PRESS_TIME)
  {
    // Multi button press time valid
    if (buttonPressCount == NUM_MULTI_PRESS)
    {
      Serial.println("Short multi press");

      

      buttonPressCount = 0;
    }
  }
  else
  {
    if (buttonPressCount > 0)
    {
      // Multi button press time exceeded
      Serial.println("Short multi press timed out");
      buttonPressCount = 0;
    }
  }
  
  prevButtonState = currButtonState;
}

void getSavedInfo(String * ssid, String * password, String * uuid)
{
  savedInfo.begin("network-info", false);
  *ssid = savedInfo.getString("ssid", "");
  *password = savedInfo.getString("password", "");
  *uuid = savedInfo.getString("uuid", "");
  savedInfo.end();
}

void putSavedInfo(String ssid, String password, String uuid)
{
  savedInfo.begin("network-info", false);
  savedInfo.putString("ssid", ssid);
  savedInfo.putString("password", password);
  savedInfo.putString("uuid", uuid);
  savedInfo.end();
}

void putSsidPass(String ssid, String password)
{
  savedInfo.begin("network-info", false);
  savedInfo.putString("ssid", ssid);
  savedInfo.putString("password", password);
  savedInfo.end();
}

void putUuid(String uuid)
{
  savedInfo.begin("network-info", false);
  savedInfo.putString("uuid", uuid);
  savedInfo.end();
}

void resetSavedInfo()
{
  savedInfo.begin("network-info", false);
  savedInfo.putString("ssid", "");
  savedInfo.putString("password", "");
  savedInfo.putString("uuid", "");
  savedInfo.end();
}