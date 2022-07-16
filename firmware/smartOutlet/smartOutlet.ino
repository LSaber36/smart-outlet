#include <Adafruit_ADS1X15.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>
#include "firebaseInfo.h"
#include "time.h"

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#include <Preferences.h>

#define GREEN_LED 32
#define BLUE_LED 33
#define BUTTON_PIN 26
#define RELAY_PIN 17
#define NUM_SAMPLES 50
#define SEND_INTERVAL 5000

#define SHORT_PRESS_TIME 1000
#define LONG_PRESS_TIME 3000
#define MULTI_BUTTON_PRESS_TIME 750
#define NUM_MULTI_PRESS 3
#define WIFI_TIMEOUT 6000

#define SERVICE_UUID            "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_RX  "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_TX  "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

// Define preferences object for flash access
Preferences savedInfo;
String currentSsid, currentPass, currentUuid;
volatile bool hasSavedInfo = false;

// Define ADC object
Adafruit_ADS1015 ads;       

// Define Firebase Data objects
FirebaseData stream;
FirebaseData fbdo;

// Define Firebase auth and config objects
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;

// Realtime Data
volatile bool dataChanged = false, firstStreamUpdate = true, firebaseEstablished = false;
String deviceID = "";
int devicePower = 0;

// ADC data
float ADCMultiplier = 2.0F;
float ADCResult;  //Voltage
float ADCValue;   //Current
float averageVoltage;
float maxv;
float minv;
float counter;

bool ADCInitialized = false;

// Button data
uint8_t currButtonState = 1;
uint8_t prevButtonState = 1;
unsigned long prevMillis = 0, releasedPressTime = 0, depressedPressTime = 0;
unsigned long prevButtonCountTime = 0, buttonCountTime = 0;
uint8_t buttonPressCount = 0;
volatile bool prevRelayState, relayState = false;

// Bluetooth data
BLEServer *pServer = NULL;
BLEService *pService;
BLECharacteristic *TxChar;
BLECharacteristic *RxChar;
bool deviceConnected = false;
bool oldDeviceConnected = false;
int8_t incomingData = 0, incomingDataCounter = 0;

const char* ntpServer = "pool.ntp.org";

// Mode for knowing wheter to boot in normal operation or in pairing mode
String mode;

void setup()
{
  Serial.begin(115200);
  Serial.printf("Starting Program...\n\n");
  
  // Init pinmodes
  pinMode(GREEN_LED, OUTPUT);
  pinMode(BLUE_LED, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  // Turn the relay off
  digitalWrite(RELAY_PIN, HIGH);

  // Check flash for existing values and print them
  getSavedInfo(&currentSsid, &currentPass, &currentUuid);
  Serial.printf("ssid: %s\n", currentSsid.c_str());
  Serial.printf("pass: %s\n", currentPass.c_str());
  Serial.printf("uuid: %s\n", currentUuid.c_str());
  Serial.println();

  getMode(&mode);
  Serial.printf("Mode: %s\n", mode);

  if (mode == "")
  {
    putMode("normal");
    mode = "normal";
  }

  if (mode == "pairing")
  {
    Serial.println("Entered pairing mode");
    enterPairingMode();
  }
  else if (mode == "normal")
  {
    Serial.println("Entered normal mode");
    if (currentSsid == "" || currentPass == "" || currentUuid == "")
    {
      Serial.println("No data found, can't connect to network");
      hasSavedInfo = false;
    }
    else if (currentSsid != "" || currentPass != "" || currentUuid != "")
    {
      Serial.println("Found data, attempting network connection");
      hasSavedInfo = true;
      deviceID = currentUuid;
      setupWiFi(currentSsid, currentPass);
      delay(750);
      setupFirebase();
      setupADC();
    }
  }
}

void loop()
{
  if (mode == "normal")
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
      digitalWrite(GREEN_LED, relayState);
    }

    prevRelayState = relayState;
  }

  // This is necessary to avoid watchdog timer errors
  delay(10);
}