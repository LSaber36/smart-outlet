#include <Adafruit_ADS1X15.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>
#include "firebaseInfo.h"

#define LED 2
#define SEND_INTERVAL 10000
#define RELAY_PIN 17
#define BUTTON_PIN 16
#define NUM_SAMPLES 50

#define SHORT_PRESS_TIME 500
#define LONG_PRESS_TIME 1000

// Define ADC object
Adafruit_ADS1115 ads;

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
String deviceID = "4df8ed81-1c65-4d2e-acbd-1d8eb01a9195"; 
bool deviceState;
int devicePower = 0;

// ADC data
float ADCMultiplier = 0.1875F;
float averageVoltage;

// Button data
uint8_t currButtonState;
uint8_t prevButtonState;
bool relayState = false;

void setup()
{
  Serial.begin(115200);

  // Init pinmodes
  pinMode(LED, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  digitalWrite(RELAY_PIN, LOW);

  setupWiFi();
  setupFirebase();
  setupADC();
}

void loop()
{
  getButtons();
  getADCReading();
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