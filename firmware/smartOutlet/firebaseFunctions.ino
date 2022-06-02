void syncFirebase()
{
  // Firebase.ready() should be called repeatedly to handle authentication tasks.
  if (WiFi.status() == WL_CONNECTED && 
      Firebase.ready() && 
      (millis() - sendDataPrevMillis > SEND_INTERVAL || sendDataPrevMillis == 0))
  {
    sendDataPrevMillis = millis();
    blinkLED(LED);

    String documentPath = "Outlets/" + String(deviceID);
    FirebaseJson content;

    deviceState = (count % 2) == 0;
    content.clear();
    content.set("fields/state/booleanValue", deviceState);

    Serial.println("Updating document...");

    if (Firebase.Firestore.patchDocument(&fbdo, PROJECT_ID, "", documentPath.c_str(), content.raw(), "state"))
      Serial.printf("ok\n%s\n", fbdo.payload().c_str());
    else
      Serial.println(fbdo.errorReason());

    // Print newline for formatting
    Serial.println();
    count++;
  }
}