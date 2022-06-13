#include <WiFi.h>
// #include <FirebaseESP32.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>
#include "firebaseInfo.h"

#define LED 2
#define SEND_INTERVAL 10000

// Define Firebase Data objects
FirebaseData fbdo;
FirebaseData stream;

// Define Firebase auth and config objects
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
unsigned long count = 0;

// Realtime Data
volatile bool dataChanged = false;
String deviceID = "1"; 
bool deviceState;
int devicePower = 0;

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
  syncFirebase();

  if (dataChanged)
  {
    // Process new data received away from callback for efficiency
    dataChanged = false;
    Serial.printf("Received stream update: %s\n", deviceState ? "true" : "false");
  }

  // This is necessary to avoid watchdog timer errors
  delay(5);
}