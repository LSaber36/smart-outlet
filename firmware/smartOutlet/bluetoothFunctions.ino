enum BLUETOOTH_CODES
{
  ACCEPTED = 1,
  DENIED = 2,
  TEST_WIFI = 3,
  WIFI_CONNECTION_SUCCESSFUL = 4,
  WIFI_CONNECTION_FAILED = 5,
  NEW_UUID = 6,
  TEST_FIREBASE = 7,
  FIREBASE_CONNECTION_SUCCESSFUL = 8,
  FIREBASE_CONNECTION_FAILED = 9,

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
    txValue = 'A';
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
        pServer->getAdvertising()->stop();
      }
      else if (convertedRxValue == ACCEPTED)
      {
        Serial.println("Ready for wifi creds");
        incomingData = INCOMING_WIFI_CREDS;
        incomingDataCounter = 0;
        // Cancel current connection if it exists and and clear out existing creds
        if (WiFi.status() == WL_CONNECTED)
          WiFi.disconnect();

        resetSavedInfo();
      }
      else if (convertedRxValue == TEST_WIFI)
      {
        Serial.println("\nChecking wifi connection");
        setupWiFi(currentSsid, currentPass);

        TxChar->setValue(std::to_string(
          (WiFi.status() == WL_CONNECTED) ? 
          WIFI_CONNECTION_SUCCESSFUL :
          WIFI_CONNECTION_FAILED
        ));
        TxChar->notify();
      }
      else if (convertedRxValue == NEW_UUID)
      {
        Serial.println("Ready for new uuid");
        incomingData = INCOMING_UUID;
        incomingDataCounter = 0;
      }
      else if (convertedRxValue == TEST_FIREBASE)
      {
        Serial.println("Checking firebase connection");
        // TODO: Figure out how to set this up since it trips watchdog timer currently
        // setupFirebase();
        TxChar->setValue(std::to_string(FIREBASE_CONNECTION_SUCCESSFUL));
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
          Serial.println("\nCollected data:");
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
          Serial.println("\nCollected data:");
          Serial.printf("uuid: %s\n", currentUuid.c_str());
          incomingDataCounter = -1;
          incomingData = NO_INCOMING_VARS;
        }
          
        incomingDataCounter ++;
      }

    }
  }
};

void setupBLE()
{
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
}

void pairingMode()
{
  Serial.println("Starting bluetooth");

  blinkLED(BLUE_LED, 100, 300, 4);

  // Start advertising
  pServer->getAdvertising()->start();

  TxChar->setValue(&txValue, sizeof(txValue));
  TxChar->notify();
}