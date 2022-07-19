enum BLUETOOTH_CODES
{
  ACCEPTED = 1,
  DENIED = 2,
  TEST_WIFI = 3,
  WIFI_CONNECTION_SUCCESSFUL = 4,
  WIFI_CONNECTION_FAILED = 5,
  NEW_UUID = 6,
  CHECK_UUID = 7,
  UUID_RECEIVED = 8,
  REBOOT_DEVICE = 9,

  BLUETOOTH_FINISHED = 64
};

enum INCOMING_DATA_CODES
{
  NO_INCOMING_VARS = 1,
  INCOMING_WIFI_CREDS = 2,
  INCOMING_UUID = 3
};

class MyServerCallbacks: public BLEServerCallbacks
{
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("Device Connected");
  };

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("Device Disconnected");
  }
};

class MyCallbacks: public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic) {
    std::string rxValue = pCharacteristic->getValue();
    int convertedRxValue = atoi(rxValue.data());

    if (rxValue.length() > 0) {
      if (convertedRxValue == BLUETOOTH_FINISHED)
      {
        blinkLED(BLUE_LED, 100, 300, 2);
        Serial.println("Shutting off bluetooth");
        
        putMode("normal");
        Serial.println("Rebooting device");
        ESP.restart();
      }
      else if (convertedRxValue == REBOOT_DEVICE)
      {
        Serial.println("About to reboot device...");
        // Wait 5 seconds first
        delay(5000);
        Serial.println("Rebooting device");
        delay(100);
        
        putMode("normal");
        ESP.restart();
      }
      else if (convertedRxValue == ACCEPTED)
      {
        Serial.println("Ready for wifi creds");
        incomingData = INCOMING_WIFI_CREDS;
        incomingDataCounter = 0;
        firebaseEstablished = false;

        // Cancel current connection if it exists and and clear out existing creds
        if (WiFi.status() == WL_CONNECTED)
          WiFi.disconnect();

        resetSavedInfo();
      }
      else if (convertedRxValue == TEST_WIFI)
      {
        Serial.println("\nChecking wifi connection");
        bool result = setupWiFi(currentSsid, currentPass);

        TxChar->setValue(String(
          (result) ? WIFI_CONNECTION_SUCCESSFUL : WIFI_CONNECTION_FAILED
        ).c_str());
        TxChar->notify();
      }
      else if (convertedRxValue == NEW_UUID)
      {
        Serial.println("Ready for new uuid");
        incomingData = INCOMING_UUID;
        incomingDataCounter = 0;
      }
      else if (convertedRxValue == CHECK_UUID)
      {
        Serial.printf("Received UUID: %s\n", (currentUuid != "") ? "true" : "false");
        TxChar->setValue(String(UUID_RECEIVED).c_str());
        TxChar->notify();
      }


      // Process the counter for storing incoming data
      if (incomingData == INCOMING_WIFI_CREDS)
      {
        // Process new wifi cred variables
        if (incomingDataCounter == 1)
        {
          currentSsid = rxValue.data();
        }  
        else if (incomingDataCounter == 2)
        {
          currentPass = rxValue.data();
          putSsidPass(currentSsid, currentPass);
          Serial.println("\nReceived SSID and Password:");
          Serial.printf("ssid: %s\n", currentSsid.c_str());
          Serial.printf("pass: %s\n", currentPass.c_str());
          incomingDataCounter = -1;
          incomingData = NO_INCOMING_VARS;
        }

        incomingDataCounter ++;
      }
      else if (incomingData == INCOMING_UUID)
      {
        // Process new UUID variables
        if (incomingDataCounter == 1)
        {
          currentUuid = rxValue.data();
          putUuid(currentUuid);
          Serial.println("\nReceived UUID:");
          Serial.printf("uuid: %s\n", currentUuid.c_str());
          incomingDataCounter = -1;
          incomingData = NO_INCOMING_VARS;
        }
          
        incomingDataCounter ++;
      }

    }
  }
};

void enterPairingMode()
{
  Serial.println("Starting bluetooth");

  blinkLED(BLUE_LED, 100, 300, 4);
  
  // Create the BLE Device
  BLEDevice::init("New SmartOutlet Device");

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE Service
  pService = pServer->createService(SERVICE_UUID);

  // Create first BLE Characteristic
  TxChar = pService->createCharacteristic(
    CHARACTERISTIC_UUID_TX,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_WRITE |
    BLECharacteristic::PROPERTY_NOTIFY |
    BLECharacteristic::PROPERTY_INDICATE
  );

  // The characteristic for receiving information
  RxChar = pService->createCharacteristic(
    CHARACTERISTIC_UUID_RX,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_WRITE |
    BLECharacteristic::PROPERTY_NOTIFY |
    BLECharacteristic::PROPERTY_INDICATE
  );
  
  // Start the service
  pService->start();

  RxChar->setCallbacks(new MyCallbacks());

  // Start advertising
  pServer->getAdvertising()->start();

  Serial.println("Bluetooth started");
}