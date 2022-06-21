void setupWiFi()
{
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");

  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(300);
  }

  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();
}

void setupFirebase()
{
  String dataPath = "/" + deviceID + "/state";

  Serial.println("Setting up firebase connection");
  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);

  // Assign the api key (required)
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Assign the user sign in credentials
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  // Assign the callback function for the long running token generation task
  config.token_status_callback = tokenStatusCallback;

  fbdo.setResponseSize(2048);

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  Firebase.setDoubleDigits(5);

  if (!Firebase.RTDB.beginStream(&stream, dataPath))
    Serial.printf("Stream begin error, %s\n\n", stream.errorReason().c_str());

  Firebase.RTDB.setStreamCallback(&stream, streamCallback, streamTimeoutCallback);
}

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
    Firebase.RTDB.setBool(&fbdo, F("/" + deviceID + "/state"), relayState);
    Serial.printf("Get bool: %s", Firebase.RTDB.getBool(&fbdo, F("/1/state"), &relayState) ? relayState ? "True" : "False" : fbdo.errorReason().c_str());

    Print newline for formatting
    Serial.println();
    */
  }
}

void streamCallback(FirebaseStream data)
{
  // Save the captured data to variables for later processing
  relayState = data.boolData();

  dataChanged = true;
}

void streamTimeoutCallback(bool timeout)
{
  if (timeout)
    Serial.println("Stream timed out, resuming...\n");

  if (!stream.httpConnected())
    Serial.printf("Error code: %d, reason: %s\n\n", stream.httpCode(), stream.errorReason().c_str());
}