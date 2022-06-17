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
  uint16_t i;
  int sumValues;

  // Take an average of NUM_SAMPLES samples to smooth out data
  for (i = 0; i < NUM_SAMPLES; i++)
  {
    sumValues += ( (ads.readADC_Differential_0_1() * ADCMultiplier) / 1000 );
  }

  averageVoltage = sumValues / NUM_SAMPLES;

  Serial.print("Averaged Differential Voltage: ");
  Serial.println(averageVoltage); 

  // This is where we should use averageVoltage to calculate the average current
  // With average voltage, current, and assumed 120V AC from the wall, we should
  // be able to figure out the average power of the system, which is the last 
  // thing this function should calculate
}