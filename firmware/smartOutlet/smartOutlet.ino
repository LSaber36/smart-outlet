#include <WiFi.h>
// #include <FirebaseESP32.h>
#include <Firebase_ESP_Client.h>
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

// Realtime Data
int deviceID = 1; 
bool deviceState;

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
  if (WiFi.status() == WL_CONNECTED && Firebase.ready() && (millis() - sendDataPrevMillis > SEND_INTERVAL || sendDataPrevMillis == 0))
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
    {  
      Serial.printf("ok\n%s\n", fbdo.payload().c_str());
    }else{
      Serial.println(fbdo.errorReason());
    }

    // Print newline for formatting
    Serial.println();
    count++;
  }

  // This is necessary for watchdog timer errors
  delay(5);
}