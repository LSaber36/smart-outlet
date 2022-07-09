enum CODES = {
  ACCEPTED = 2,
  Denied = 4,
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
      Serial.printf("\n*********\n");
      Serial.printf("Received: %s", rxValue.data());
      Serial.printf("\n*********\n\n");

      if (atoi(rxValue.data()) == BLUETOOTH_FINISHED)
      {
        Serial.println("Received expected value, blinking LED");
        blinkLED(GREEN_LED, 100, 500, 2);
        Serial.println("Shutting off bluetooth");
        pServer->getAdvertising()->stop();
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

  blinkLED(GREEN_LED, 100, 400, 1);

  // Start advertising
  pServer->getAdvertising()->start();

  TxChar->setValue(&txValue, sizeof(txValue));
  TxChar->notify();
}