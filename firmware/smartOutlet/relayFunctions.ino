// Relay Control Pin at GPIO0
int relayPin = 0;
// Read logic at GIO4 Pin
int buttonPin = 16;
void setup()
{
  //GPIO4 to Output and low
  pinMode(relayPin, OUTPUT);
  relayPin = LOW;
  
//Sets Pullup so GPIO4 defaults to on
    pinMode(buttonPin, INPUT_PULLUP);
    // Serial monitor setup
    Serial.begin(9600);
}

void loop()
{
    if (!digitalRead(buttonPin)){
        Serial.print("button status:" + digitalRead(buttonPin));
        digitalWrite(relayPin, !digitalRead(relayPin));
        Serial.println("  Relay status:" + digitalRead(relayPin));
        delay(3000);
    }
    delay(3000);
    
    

}