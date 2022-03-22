int val[8];

void setup()
{
    // put your setup code here, to run once:
    Serial.begin(9600);
}

void loop()
{
    // put your main code here, to run repeatedly:
    for(int i =0; i<8; i++){
        val[i] = analogRead(i);
        Serial.print(val[i]);
        Serial.print(" ");
    }
    Serial.println();
    delay(10);
}
