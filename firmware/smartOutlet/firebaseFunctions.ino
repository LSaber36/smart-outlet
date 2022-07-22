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
  if (Firebase.ready() && firebaseEstablished &&
      (millis() - sendDataPrevMillis > UPDATE_INTERVAL || sendDataPrevMillis == 0))
  {
    sendDataPrevMillis = millis();

    // Read the ADC and add to the current sum
    getADCReading();
    Serial.printf("Adding %.1f to %.1f:  %.1f\n", power, currentHourCumSum, (currentHourCumSum + power));
    currentHourCumSum += power;

    if (!powerThresholdExceeded && currentHourCumSum > powerThreshold)
    {
      // Trigger a forced update
      updateHistoricalData(timeInfo.tm_hour, currentHourCumSum);
      Serial.printf("Set bool... %s\n", Firebase.RTDB.setBool(&fbdo, stateDatapath, false) ? "ok" : fbdo.errorReason().c_str());
      Serial.println();

      // Ensure that we aren't making unnecessary database calls every 3 seconds
      powerThresholdExceeded = true;
    }

    getTime(&timeInfo);

    if (timeInfo.tm_min != prevMin)
    {
      int8_t diffMinutes = ((timeInfo.tm_min - timerMin + 60) % 60);
      Serial.printf("diff: %d = %d - %d\n", diffMinutes, timeInfo.tm_min, timerMin);

      if (diffMinutes >= ADC_READ_INTERVAL)
      {
        // This is where want to read send the current sum to the database 
        Serial.printf("\n5 minutes has passed: %d\n\n", timeInfo.tm_min);
        updateHistoricalData(timeInfo.tm_hour, currentHourCumSum);
        timerMin = timeInfo.tm_min;
      }

      prevMin = timeInfo.tm_min;
    }

    // The hour has increased by 1
    if (timeInfo.tm_hour != prevHour)
    {
      // Day has increased by 1
      if (timeInfo.tm_hour == 0)
      {
        Serial.println("Day has increased by 1");
        // Reset the database info for the next day
        resetHistoricalData();
      }
      else
      {
        // Write to the database the cumSum and reset it for the next hour
        Serial.printf("Appending cumSum: %d\n", currentHourCumSum);
        updateHistoricalData(prevHour, currentHourCumSum);

        // We can count on the next hour being 0, so we don't need to update that
        currentHourCumSum = 0;
        powerThresholdExceeded = false;
      }

      prevHour = timeInfo.tm_hour;
    }
  }
}

bool updateHistoricalData(int index, float value)
{
  FirebaseJson content;
  FirebaseJsonData result;
  FirebaseJsonArray arr;
  String documentPath = "Outlets/" + deviceID;

  // Update an index in the historicalData array on the database
  if (Firebase.Firestore.getDocument(&fbdo, PROJECT_ID, "", documentPath.c_str(), "", "", ""))
  {
    content.setJsonData(fbdo.payload().c_str());
    content.get(result, "fields/historicalData/arrayValue/values");

    // Populate FirebaseJsonArray arr with the current array data from "historicalData"
    arr.setJsonArrayData(result.to<String>().c_str());

    // Update a value in FirebaseJsonArray arr with "value" at "index"
    // Need to set then remove to avoid having nothing in the specified array index
    arr.set("/[" + String(index) + "]/doubleValue", String(value, 1));
    arr.remove("/[" + String(index) + "]/integerValue");

    // Set "historicalData" with the new array stored in FirebaseJsonArray arr
    content.clear();
    content.set("fields/historicalData/arrayValue/values", arr);
    
    if (Firebase.Firestore.patchDocument(&fbdo, PROJECT_ID, "", documentPath.c_str(), content.raw(), "historicalData"))
    {
      Serial.printf("Updated value at index %d to %.1f\n", index, value);
    }
    else
    {
      Serial.println(fbdo.errorReason());
      return false;
    }
  }
  else
  {
    Serial.println(fbdo.errorReason());
    return false;
  }

  return true;
}

float getHistoricalData(int index)
{
  FirebaseJson content;
  FirebaseJsonData result;
  FirebaseJsonArray arr;
  float retVal = -1.0;
  String documentPath = "Outlets/" + deviceID;

  // Update an index in the historicalData array on the database
  if (Firebase.Firestore.getDocument(&fbdo, PROJECT_ID, "", documentPath.c_str(), "", "", ""))
  {
    content.setJsonData(fbdo.payload().c_str());
    content.get(result, "fields/historicalData/arrayValue/values");

    // Populate FirebaseJsonArray arr with the current array data from "historicalData"
    arr.setJsonArrayData(result.to<String>().c_str());

    // Get the value at the current array, making sure to convert to a float and return    
    if (arr.get(result, "/[" + String(index) + "]/doubleValue", true))
      retVal = (float)result.doubleValue;
    else if (arr.get(result, "/[" + String(index) + "]/integerValue", true))
      retVal = (float)result.intValue;
    
    Serial.printf("Got float value: %.1f\n", retVal);
    return retVal;
  }
  else
  {
    Serial.println(fbdo.errorReason());
    return retVal;
  }
}

bool resetHistoricalData()
{
  FirebaseJson content;
  FirebaseJsonData result;
  FirebaseJsonArray arr;
  String documentPath = "Outlets/" + deviceID;

  // Update an index in the historicalData array on the database
  if (Firebase.Firestore.getDocument(&fbdo, PROJECT_ID, "", documentPath.c_str(), "", "", ""))
  {
    content.setJsonData(fbdo.payload().c_str());
    content.get(result, "fields/historicalData/arrayValue/values");

    // Populate FirebaseJsonArray arr with the current array data from "historicalData"
    arr.setJsonArrayData(result.to<String>().c_str());

    // Update each value in the array to 0, effectively resetting it
    // Need to set then remove to avoid having nothing in the specified array index
    for (uint8_t i = 0; i < 24; i++)
    {
      arr.set("/[" + String(i) + "]/doubleValue", String(0.0, 1));
      arr.remove("/[" + String(i) + "]/integerValue");
    }

    // Set "historicalData" with the new array stored in FirebaseJsonArray arr
    content.clear();
    content.set("fields/historicalData/arrayValue/values", arr);
    
    if (Firebase.Firestore.patchDocument(&fbdo, PROJECT_ID, "", documentPath.c_str(), content.raw(), "historicalData"))
    {
      Serial.println("Reset all values in array to 0");
    }
    else
    {
      Serial.println(fbdo.errorReason());
      return false;
    }
  }
  else
  {
    Serial.println(fbdo.errorReason());
    return false;
  }

  return true;
}