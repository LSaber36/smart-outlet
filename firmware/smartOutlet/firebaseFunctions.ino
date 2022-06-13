void syncFirebase()
{
  // Firebase.ready() should be called repeatedly to handle authentication tasks.
  if (WiFi.status() == WL_CONNECTED && 
      Firebase.ready() && 
      (millis() - sendDataPrevMillis > SEND_INTERVAL || sendDataPrevMillis == 0))
  {
    sendDataPrevMillis = millis();
    blinkLED(LED);

    /*
    // This is the code that can update the state of the database, it should do so because of a button
    // ================================================================================================
    Serial.println("Updating realtime database...");
    Firebase.RTDB.setBool(&fbdo, F("/" + deviceID + "/state"), deviceState);
    Serial.printf("Get bool: %s", Firebase.RTDB.getBool(&fbdo, F("/1/state"), &deviceState) ? deviceState ? "True" : "False" : fbdo.errorReason().c_str());

    Print newline for formatting
    Serial.println();
    */
  }
}

void streamCallback(FirebaseStream data)
{
  // Save the captured data to variables for later processing
  deviceState = data.boolData();

  dataChanged = true;
}

void streamTimeoutCallback(bool timeout)
{
  if (timeout)
    Serial.println("Stream timed out, resuming...\n");

  if (!stream.httpConnected())
    Serial.printf("Error code: %d, reason: %s\n\n", stream.httpCode(), stream.errorReason().c_str());
}