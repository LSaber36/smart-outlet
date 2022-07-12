enum CODES
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

    if (rxValue.length() > 0) {
      Serial.printf("\n******************\n");
      Serial.printf("Received: %s", rxValue.data());
      Serial.printf("\n******************\n\n");

      if (atoi(rxValue.data()) == BLUETOOTH_FINISHED)
      {
        blinkLED(BLUE_LED, 100, 300, 2);
        Serial.println("Shutting off bluetooth");
        pServer->getAdvertising()->stop();
      }
      else if (atoi(rxValue.data()) == ACCEPTED)
      {
        Serial.println("Ready for wifi creds");
      }
      else if (atoi(rxValue.data()) == TEST_WIFI)
      {
        Serial.println("Checking wifi connection");
        // TODO: Actually check if WiFi connection establishes or not
        TxChar->setValue(std::to_string(WIFI_CONNECTION_SUCCESSFUL));
        TxChar->notify();
      }
      else if (atoi(rxValue.data()) == TEST_FIREBASE)
      {
        // TODO: Actually check if Firebase connection establishes or not
        Serial.println("Checking firebase connection");
        TxChar->setValue(std::to_string(FIREBASE_CONNECTION_SUCCESSFUL));
        TxChar->notify();
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