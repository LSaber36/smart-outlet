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

  // This is necessary for watchdog timer errors
  delay(5);
}