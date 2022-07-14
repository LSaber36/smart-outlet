void setupWiFi(String ssid, String pass)
{
  WiFi.begin(ssid.c_str(), pass.c_str());
  Serial.print("\nConnecting to Wi-Fi");
  
  configTime(-18000, 3600, ntpServer);

  // TO-DO: Add a timeout to this
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(300);
  }

  Serial.print("\nConnected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("\n");
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

unsigned long getTime()
{
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo))
    return(0);

  time(&now);
  return now;
}

void setupFirebase()
{
  String dataPath = "/" + deviceID + "/state";

  Serial.println("Setting up firebase connection");

  // Assign the api key (required)
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Assign the user sign in credentials
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  // Assign the callback function for the long running token generation task
  config.token_status_callback = tokenStatusCallback;
  config.max_token_generation_retry = 10;

  fbdo.setResponseSize(4096);

  Firebase.setSystemTime(getTime());
  Firebase.reconnectWiFi(true);
  Firebase.setDoubleDigits(5);
  Firebase.begin(&config, &auth);

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
    blinkLED(GREEN_LED, 100, 0, 1);

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