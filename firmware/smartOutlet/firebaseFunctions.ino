bool setupWiFi(String ssid, String pass)
{
  unsigned long startTime = 0;

  WiFi.begin(ssid.c_str(), pass.c_str());
  Serial.print("\nConnecting to Wi-Fi");
  
  configTime(-18000, 3600, ntpServer);

  startTime = millis();
  // TO-DO: Add a timeout to this
  while ((WiFi.status() != WL_CONNECTED) && ((millis() - startTime) < WIFI_TIMEOUT))
  {
    Serial.print(".");
    delay(300);
  }

  if ((millis() - startTime) >= WIFI_TIMEOUT)
  {
    Serial.println("\nWifi conenction failed");
    return false;
  }

  Serial.print("\nConnected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("\n");
  return true;
}

void streamCallback(FirebaseStream data)
{
  // Save the captured data to variables for later processing
  if (data.dataPath() == "/state")
  {
    // Serial.printf("Received State: %s\n", (data.boolData() ? "true" : "false"));
    relayState = data.boolData();
    dataChanged = RELAY_STATE;
  }
  else if (data.dataPath() == "/powerThreshold")
  {
    // Serial.printf("Received powerThreshold: %d\n", data.intData());
    powerThreshold = data.intData();
    dataChanged = POWER_THRESHOLD;
  }
  else
  {                
    dataChanged = INITIAL_UPDATE;
    Firebase.RTDB.getBool(&fbdo, String(deviceID + "/state"));
    relayState = fbdo.to<bool>();
    prevRelayState = !relayState;
    Firebase.RTDB.getInt(&fbdo, String(deviceID + "/powerThreshold"));
    powerThreshold = fbdo.to<int>();
  }
}

void streamTimeoutCallback(bool timeout)
{
  if (timeout)
    Serial.println("Stream timed out, resuming...\n");

  if (!stream.httpConnected())
    Serial.printf("Error code: %d, reason: %s\n\n", stream.httpCode(), stream.errorReason().c_str());
}

unsigned long getTime(struct tm * info)
{
  time_t now;
  if (!getLocalTime(info))
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
  Firebase.setSystemTime(getTime(&timeInfo));
  Firebase.setDoubleDigits(5);

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  if (!Firebase.RTDB.beginStream(&stream, "/" + deviceID))
    Serial.printf("Stream begin error, %s\n\n", stream.errorReason().c_str());

  Firebase.RTDB.setStreamCallback(&stream, streamCallback, streamTimeoutCallback);
}

void syncFirebase()
{
  // Firebase.ready() should be called repeatedly to handle authentication tasks.
  // Check every 5 seconds
  if (Firebase.ready() && 
      (millis() - sendDataPrevMillis > SEND_INTERVAL || sendDataPrevMillis == 0))
  {
    sendDataPrevMillis = millis();

    // This is where we want to read the ADC and add to the current sum  
  }
}