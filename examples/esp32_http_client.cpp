/**
 * Contoh Integrasi ESP32 -> Node.js Web Dashboard
 * Mengirim telemetry sensor (DHT22, Soil Moisture Potentiometer, Relay)
 * via HTTP POST JSON ke server Node.js.
 */

#include "DHT.h"
#include <Arduino.h>
#include <HTTPClient.h>
#include <WiFi.h>

// Ganti dengan kredensial Wi-Fi Anda (atau Wokwi-GUEST jika di simulator Wokwi)
const char *ssid = "Wokwi-GUEST";
const char *password = "";

// Ganti dengan IP komputer/laptop tempat Node.js berjalan (misal:
// "http://192.168.1.100:3000/api/telemetry") Jika menggunakan Wokwi dengan
// Wokwi IoT Gateway atau localhost:
const char *serverEndpoint = "http://localhost:3000/api/telemetry";

#define PIN_SOIL_POT 34
#define PIN_DHT 15
#define DHTTYPE DHT22
#define PIN_RELAY 2

DHT dht(PIN_DHT, DHTTYPE);

unsigned long lastSend = 0;
const unsigned long sendInterval = 3000; // Kirim tiap 3 detik

void setup() {
  Serial.begin(115200);
  pinMode(PIN_RELAY, OUTPUT);
  digitalWrite(PIN_RELAY, LOW);

  dht.begin();

  WiFi.begin(ssid, password);
  Serial.print("Menghubungkan ke Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi Terhubung! IP ESP32: " + WiFi.localIP().toString());
}

void loop() {
  if (millis() - lastSend >= sendInterval) {
    lastSend = millis();

    float airTemp = dht.readTemperature();
    float airHumidity = dht.readHumidity();
    int rawADC = analogRead(PIN_SOIL_POT);
    int soilMoisture = map(rawADC, 0, 4095, 0, 100);
    bool pumpCurrent = digitalRead(PIN_RELAY) == HIGH;

    if (isnan(airTemp) || isnan(airHumidity)) {
      Serial.println("[ERROR] Gagal membaca sensor DHT22");
      return;
    }

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverEndpoint);
      http.addHeader("Content-Type", "application/json");

      // Siapkan payload JSON
      String jsonPayload = "{";
      jsonPayload += "\"soilMoisture\":" + String(soilMoisture) + ",";
      jsonPayload += "\"airTemp\":" + String(airTemp, 1) + ",";
      jsonPayload += "\"airHumidity\":" + String(airHumidity, 1) + ",";
      jsonPayload += "\"pumpStatus\":" + String(pumpCurrent ? 1 : 0);
      jsonPayload += "}";

      int httpResponseCode = http.POST(jsonPayload);

      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.printf("[HTTP] Sukses (%d): %s\n", httpResponseCode,
                      response.c_str());

        // Response dari server Node.js memberikan instruksi pumpTarget
        // Jika server menginstruksikan pompa ON/OFF, ESP32 dapat
        // mengeksekusinya:
        if (response.indexOf("\"pumpTarget\":true") > 0) {
          digitalWrite(PIN_RELAY, HIGH);
        } else if (response.indexOf("\"pumpTarget\":false") > 0) {
          digitalWrite(PIN_RELAY, LOW);
        }
      } else {
        Serial.printf("[HTTP] Gagal mengirim data: %s\n",
                      http.errorToString(httpResponseCode).c_str());
      }
      http.end();
    }
  }
}
