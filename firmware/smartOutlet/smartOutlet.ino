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
    boolResult = Firebase.setBool(fbdo, F("/test/bool"), (count % 2 == 0));
    Serial.printf("Set bool: %s\n", boolResult ? "ok" : fbdo.errorReason().c_str());

    boolResult = Firebase.getBool(fbdo, F("/test/bool"), &deviceState);
    Serial.printf("Get bool: %s\n", boolResult ? (deviceState ? "true" : "false") : fbdo.errorReason().c_str());


    // Int test
    intResult = Firebase.setInt(fbdo, F("/test/int"), count);
    Serial.printf("Set int:  %s\n", intResult ? "ok" : fbdo.errorReason().c_str());

    intResult = Firebase.getInt(fbdo, F("/test/int"), &deviceID);
    Serial.printf("Get int:  %s\n", intResult ? String(deviceID).c_str() : fbdo.errorReason().c_str());

    // Print newline for formatting
    Serial.println();
    count++;
  }
}