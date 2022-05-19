#include <WiFi.h>
#include <FirebaseESP32.h>
#include <addons/TokenHelper.h>
#include "firebaseInfo.h"

#define LED 2
#define SEND_INTERVAL 10000

// Define Firebase Data objects
FirebaseData fbdo;

// Define Firebase auth and config objects
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
unsigned long count = 0;

// Status results
bool boolResult, intResult;

// Realtime Data
bool deviceState;
int deviceID; 

void setup()
{
  Serial.begin(115200);

  pinMode(LED, OUTPUT);
  setupWiFi();
  setupFirebase();
}

void loop()
{
  printSensorData();

  // Firebase.ready() should be called repeatedly to handle authentication tasks.
  if (Firebase.ready() && (millis() - sendDataPrevMillis > SEND_INTERVAL || sendDataPrevMillis == 0))
  {
    sendDataPrevMillis = millis();
    blinkLED(LED);

    // Boolean test
    boolResult = Firebase.setBool(fbdo, F("/test/state"), (count % 2 == 0));
    Serial.printf("Set state: %s\n", boolResult ? "ok" : fbdo.errorReason().c_str());

    boolResult = Firebase.getBool(fbdo, F("/test/state"), &deviceState);
    Serial.printf("Get state: %s\n", boolResult ? (deviceState ? "true" : "false") : fbdo.errorReason().c_str());


    // Int test
    intResult = Firebase.setInt(fbdo, F("/test/id"), count);
    Serial.printf("Set id:  %s\n", intResult ? "ok" : fbdo.errorReason().c_str());

    intResult = Firebase.getInt(fbdo, F("/test/id"), &deviceID);
    Serial.printf("Get id:  %s\n", intResult ? String(deviceID).c_str() : fbdo.errorReason().c_str());

    // Print newline for formatting
    Serial.println();
    count++;
  }
}