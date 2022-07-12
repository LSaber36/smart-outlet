#include <Adafruit_ADS1X15.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>
#include "firebaseInfo.h"
#include "time.h"

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define GREEN_LED 32
#define BLUE_LED 33
#define BUTTON_PIN 26
#define RELAY_PIN 17
#define NUM_SAMPLES 50
#define SEND_INTERVAL 5000

#define SHORT_PRESS_TIME 1000
#define LONG_PRESS_TIME 3000

#define SERVICE_UUID            "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_RX  "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_TX  "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

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
volatile bool dataChanged = false, firstStreamUpdate = true, firebaseEstablished = false;
String deviceID = "6281f1d0-59e2-4682-9662-a85fad04ebf7"; 
int devicePower = 0;

// ADC data
float ADCMultiplier = 0.1875F;
float averageVoltage;
bool ADCInitialized = false;

// Button data
uint8_t currButtonState;
uint8_t prevButtonState;
unsigned long prevMillis = 0, releasedPressTime = 0, depressedPressTime = 0;
bool prevRelayState, relayState = false;

// Bluetooth data
BLEServer *pServer = NULL;
BLEService *pService;
BLECharacteristic *TxChar;
BLECharacteristic *RxChar;
bool deviceConnected = false;
bool oldDeviceConnected = false;
uint8_t txValue = 'A';

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

  setupADC();
  setupWiFi();
  setupFirebase();
  setupBLE();
}

void loop()
{
  getButtons();
  getADCReading();
  syncFirebase();

  if (dataChanged)
  {
    if (firstStreamUpdate)
    {
      firstStreamUpdate = false;
      firebaseEstablished = true;
      Serial.println("\nFirebase Connection Established");
      // Indicate that the code is running
      blinkLED(GREEN_LED, 100, 150, 2);
      blinkLED(BLUE_LED, 100, 150, 2);
    }

    // Process new data received away from callback for efficiency
    Serial.printf("Received stream update: %s\n", relayState ? "true" : "false");
    blinkLED(GREEN_LED, 100, 200, 2);
    dataChanged = false;
  }

  if (deviceConnected)
  {        
		delay(1000); // bluetooth stack will go into congestion, if too many packets are sent
	}

  if (!deviceConnected && oldDeviceConnected)
  {
    // Do stuff here after disconnected
    // give the bluetooth stack the chance to get things ready
    delay(500);

    // After device disconnects, turn off bluetooth
    
    oldDeviceConnected = deviceConnected;
  }
  if (deviceConnected && !oldDeviceConnected)
  {
    // Do stuff here after connection is established
    blinkLED(BLUE_LED, 100, 300, 2);
    oldDeviceConnected = deviceConnected;
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