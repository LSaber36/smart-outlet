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
  }

  counter = 0;
  averageVoltage = 0;

  while (counter < 50)
  {
    ADCResult = ads.readADC_Differential_0_1() * ADCMultiplier/1000;
    averageVoltage = averageVoltage + ADCResult;
    counter++;
    delay(7);
  }
  averageVoltage = averageVoltage / counter;
}

void getADCReading()
{
   // Without this if check, calling readADC_Differential_0_1() causes an infinite loop
  if (ADCInitialized)
  {
    maxv = averageVoltage;
    minv = averageVoltage;
    long time_check = millis();

    while (millis() - time_check < 1000)
    {
      ADCResult = ads.readADC_Differential_0_1() * ADCMultiplier / 1000;

      if (maxv < ADCResult)
        maxv = ADCResult;
      
      if (minv > ADCResult)
        minv = ADCResult;
    }
    if ((averageVoltage - minv) > (maxv - averageVoltage))
      maxv = averageVoltage + averageVoltage - minv;
      
    ADCValue = (maxv - averageVoltage) * 10;
    
    //Ignore small voltage differences
    if((maxv - minv) < .1)
      ADCValue = 0;  

    Serial.printf("Voltage Reading: %.2f\n", ADCResult);
    Serial.printf("MaxV: %.2f\n", maxv);
    Serial.printf("MinV: %.2f\n", minv);
    Serial.printf("Mean: %.2f\n", mean);
    Serial.printf("IRMS Current?: %.2f\n", ADCValue);
    Serial.println();

    delay(500);
  }
} 