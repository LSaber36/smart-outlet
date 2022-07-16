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
  Serial.printf("Received: %s\n", (data.boolData() ? "true" : "false"));
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
  Serial.println("Setting up firebase connection");

  // Assign the api key (required)
  config.api_key = API_KEY;

  // Assign the user sign in credentials
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  // Assign database url
  config.database_url = DATABASE_URL;
  
  // Assign the callback function for the long running token generation task
  config.token_status_callback = tokenStatusCallback;
  config.max_token_generation_retry = 10;

  fbdo.setResponseSize(4096);
  Firebase.setSystemTime(getTime());
  Firebase.setDoubleDigits(5);

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  if (!Firebase.RTDB.beginStream(&stream, "/" + deviceID + "/state"))
    Serial.printf("Stream begin error, %s\n\n", stream.errorReason().c_str());

  Firebase.RTDB.setStreamCallback(&stream, streamCallback, streamTimeoutCallback);
}

void syncFirebase()
{
  // Firebase.ready() should be called repeatedly to handle authentication tasks.
  if (Firebase.ready() && 
      (millis() - sendDataPrevMillis > SEND_INTERVAL || sendDataPrevMillis == 0))
  {
    sendDataPrevMillis = millis();

  }
}