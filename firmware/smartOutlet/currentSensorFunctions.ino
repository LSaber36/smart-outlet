void setupADC()
{
  ads.setGain(GAIN_ONE);
  Serial.println("Attempting to initialize ADS");

  if (!ads.begin())
  {
    Serial.println("Failed to initialize ADS.");
  }
  else
  {
    Serial.println("Initialized ADS");
    ADCInitialized = true;
  
    sampleCounter = 0;
    averageVoltage = 0;

    while (sampleCounter < 50)
    {
      ADCResult = ads.readADC_Differential_0_1() * ADCMultiplier / 1000;
      averageVoltage = averageVoltage + ADCResult;
      sampleCounter++;
      delay(7);
    }
    averageVoltage = averageVoltage / sampleCounter;
  }
}

void getADCReading()
{
  // Without this if check, calling readADC_Differential_0_1() causes an infinite loop
  if (ADCInitialized)
  {
    if (firstADCCheck)
    {
      prevADCTime = millis();
      firstADCCheck = false;
    }

    maxv = averageVoltage;
    minv = averageVoltage;

    if (millis() - prevADCTime < 1000)
    {
      ADCResult = ads.readADC_Differential_0_1() * ADCMultiplier / 1000;

      // Get the min and max values for 1 second
      if (maxv < ADCResult)
        maxv = ADCResult;
      
      if (minv > ADCResult)
        minv = ADCResult;
    }
    else
    {
      if ((averageVoltage - minv) > (maxv - averageVoltage))
        maxv = averageVoltage + averageVoltage - minv;
        
      ADCValue = (maxv - averageVoltage) * 10;
      
      //Ignore small voltage differences
      if((maxv - minv) < .1)
        ADCValue = 0;  

      Serial.printf("Voltage Reading: %.2f\n", ADCResult);
      Serial.printf("MaxV: %.2f\n", maxv);
      Serial.printf("MinV: %.2f\n", minv);
      Serial.printf("IRMS Current?: %.2f\n", ADCValue);
      Serial.println();

      firstADCCheck = true;
    }
  }
} 