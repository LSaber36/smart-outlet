#include <Adafruit_ADS1X15.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>
#include "firebaseInfo.h"
#include "time.h"

#define GREEN_LED 33
#define BLUE_LED 32
#define BUTTON_PIN 5
#define RELAY_PIN 17
#define NUM_SAMPLES 50
#define SEND_INTERVAL 5000

#define SHORT_PRESS_TIME 1000
#define LONG_PRESS_TIME 3000

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
String deviceID = "6281f1d0-59e2-4682-9662-a85fad04ebf7"; 
int devicePower = 0;

// ADC data
float ADCMultiplier = 0.1875F;
float averageVoltage;
bool ADCInitialized = false;

// Button data
uint8_t currButtonState;
uint8_t prevButtonState;
bool prevRelayState, relayState = false;

const char* ntpServer = "pool.ntp.org";

void setup()
{
  Serial.begin(115200);

  // Init pinmodes
  pinMode(GREEN_LED, OUTPUT);
  pinMode(BLUE_LED, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  digitalWrite(RELAY_PIN, LOW);

  // Indicate that the code is running
  blinkLED(GREEN_LED, 100, 150, 2);
  blinkLED(BLUE_LED, 100, 150, 2);

  setupADC();
  setupWiFi();
  setupFirebase();
}

void loop()
{
  getButtons();
  getADCReading();
  syncFirebase();

  if (dataChanged)
  {
    // Process new data received away from callback for efficiency
    Serial.printf("Received stream update: %s\n", relayState ? "true" : "false");
    blinkLED(BLUE_LED, 100, 500, 1);
    dataChanged = false;
  }

  // Only call digitalWrite if the state has changed (reduces unnecessary calls)
  if (relayState != prevRelayState)
  {
    digitalWrite(RELAY_PIN, relayState);
  }

  prevRelayState = relayState;

  // This is necessary to avoid watchdog timer errors
  delay(5);
}