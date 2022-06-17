void setupADC()
{
  ads.setGain(GAIN_TWOTHIRDS);

  if (!ads.begin())
  {
    Serial.println("Failed to initialize ADS.");
    while (1);
  }
}

void getADCReading()
{
  ADCResult = ads.readADC_Differential_0_1();
  ADCValue = ADCResult * ADCMultiplier / 1000;

  Serial.print("Differential Voltage: ");
  Serial.println(ADCValue); 

  delay(500);
}