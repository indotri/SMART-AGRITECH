// 1. Kredensial Blynk (WAJIB paling atas sebelum include Blynk)
#define BLYNK_TEMPLATE_ID "TMPLxxxxxx"
#define BLYNK_TEMPLATE_NAME "Smart Irrigation"
#define BLYNK_AUTH_TOKEN "Masukan_Token_Blynk_Anda"

#include "DHT.h"
#include <Arduino.h>
#include <BlynkSimpleEsp32.h>
#include <HTTPClient.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <WiFiClient.h>
#include <Wire.h>

// Inisialisasi LCD I2C di alamat 0x27 (16 kolom x 2 baris)
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Wi-Fi Virtual khusus Wokwi (tidak perlu diubah)
char auth[] = BLYNK_AUTH_TOKEN;
char ssid[] = "Wokwi-GUEST";
char pass[] = "";

// URL Gateway Web Dashboard Node.js
// - Jika di Wokwi for VS Code / Wokwi IoT Gateway: gunakan "http://host.wokwi.internal:3000/api/telemetry" atau IP laptop
// - IP Laptop Anda saat ini: "http://192.168.110.156:3000/api/telemetry"
const char *nodeServerUrl = "http://192.168.110.156:3000/api/telemetry";

#define PIN_SOIL_POT 34
#define PIN_BATTERY_POT 35 // Pin ADC untuk monitoring tegangan baterai/solar via voltage divider
#define PIN_DHT 15
#define DHTTYPE DHT22
#define PIN_RELAY 2

DHT dht(PIN_DHT, DHTTYPE);
BlynkTimer timer;

// Ambang Batas Prioritas Kelembapan Tanah & Baterai
const int SOIL_SAFE_LIMIT =
    50; // Batas Aman: Jika tanah >= 50%, pompa WAJIB MATI
const int SOIL_CRITICAL_LIMIT =
    35; // Batas Kritis: Jika tanah < 35%, wajib siram
const float AIR_HUM_DRY_LIMIT = 60.0; // Udara kering jika RH < 60%
const int BATTERY_CUTOFF_LIMIT = 15;  // Batas Kritis Baterai (< 15% kunci pompa agar aki awet)

bool isBlynkActive = false;
bool manualOverrideActive = false;
bool manualPumpTarget = false;

void processIrrigationLogic() {
  // 1. Baca data sensor lingkungan
  float airHumidity = dht.readHumidity();
  float airTemp = dht.readTemperature(); // Hanya untuk monitoring tampilan

  // 2. Baca Potensiometer Tanah & Baterai Surya (ADC ESP32: 0 - 4095)
  int rawSoil = analogRead(PIN_SOIL_POT);
  int soilMoisture = map(rawSoil, 0, 4095, 0, 100);

  int rawBattery = analogRead(PIN_BATTERY_POT);
  // Kalibrasi tegangan baterai aki 12V (rentang 10.0V - 14.5V)
  // Pembagi tegangan R1=30k & R2=7.5k memetakan tegangan 0-14.8V ke 0-3.3V ADC ESP32
  float batteryVoltage = (rawBattery / 4095.0) * 14.5;
  if (batteryVoltage < 0.5) batteryVoltage = 12.4; // Default fallback jika pin mengambang saat tanpa kabel
  int batteryPercent = constrain((int)((batteryVoltage - 11.0) / (12.7 - 11.0) * 100.0), 0, 100);

  if (isnan(airHumidity) || isnan(airTemp)) {
    Serial.println("[ERROR] Pembacaan DHT22 gagal!");
    lcd.setCursor(0, 0);
    lcd.print("Sensor Error!   ");
    return;
  }

  // 3. Kirim data ke Pin Virtual Blynk (jika terhubung)
  if (isBlynkActive) {
    Blynk.virtualWrite(V0, soilMoisture);   // Gauge Tanah
    Blynk.virtualWrite(V1, airTemp);        // Nilai Suhu
    Blynk.virtualWrite(V2, airHumidity);    // Gauge RH Udara
    Blynk.virtualWrite(V4, batteryPercent); // Level Baterai (%)
  }

  // 4. Evaluasi Logika Pompa (PRIORITAS: OVERRIDE MANUAL & SAFETY BATERAI)
  bool triggerPump = false;

  if (manualOverrideActive) {
    // Mode Manual: Ikuti target dari web/server
    triggerPump = manualPumpTarget;
  } else {
    // Mode Otomatis: Prioritas utama kelembapan tanah
    if (soilMoisture < SOIL_SAFE_LIMIT) {
      if (soilMoisture < SOIL_CRITICAL_LIMIT) {
        // Kondisi A: Tanah sangat kering kritis (< 35%), langsung siram
        triggerPump = true;
      } else if (airHumidity < AIR_HUM_DRY_LIMIT) {
        // Kondisi B: Tanah mulai kering (< 50%) DAN udara juga kering (< 60%)
        triggerPump = true;
      }
    }
  }

  // Proteksi Deep Discharge Aki: Kunci pompa jika baterai < 15%
  bool lowBatteryCutoff = (batteryPercent < BATTERY_CUTOFF_LIMIT);
  if (lowBatteryCutoff) {
    triggerPump = false;
  }

  // 5. Eksekusi Aktuator Pompa (Relay)
  if (triggerPump) {
    digitalWrite(PIN_RELAY, HIGH); // Pompa MENYALA
    if (isBlynkActive)
      Blynk.virtualWrite(V3, 255);
  } else {
    digitalWrite(PIN_RELAY, LOW); // Pompa MATI
    if (isBlynkActive)
      Blynk.virtualWrite(V3, 0);
  }

  // 6. Tampilkan ke Layar LCD 16x2
  char bufferLine1[17];
  snprintf(bufferLine1, sizeof(bufferLine1), "T:%.0fC H:%.0f%% B:%d%%", airTemp,
           airHumidity, batteryPercent);
  lcd.setCursor(0, 0);
  lcd.print(bufferLine1);

  char bufferLine2[17];
  const char *statusStr =
      lowBatteryCutoff ? "BAT:LOW "
                       : (triggerPump ? "PUMP:ON "
                                      : (manualOverrideActive ? "MANUAL  " : "STANDBY "));
  snprintf(bufferLine2, sizeof(bufferLine2), "Soil:%2d%% %-9s", soilMoisture,
           statusStr);
  lcd.setCursor(0, 1);
  lcd.print(bufferLine2);

  // 7. Kirim Telemetry ke Server Web Node.js
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(nodeServerUrl);
    http.setTimeout(1200); // 1.2s timeout
    http.addHeader("Content-Type", "application/json");

    String json = "{\"soilMoisture\":" + String(soilMoisture) +
                  ",\"airTemp\":" + String(airTemp, 1) +
                  ",\"airHumidity\":" + String(airHumidity, 1) +
                  ",\"pumpStatus\":" + String(triggerPump ? 1 : 0) +
                  ",\"batteryVoltage\":" + String(batteryVoltage, 2) +
                  ",\"batteryPercent\":" + String(batteryPercent) + "}";

    int code = http.POST(json);
    if (code > 0) {
      // Server membalas instruksi jika ada override manual dari web
      String resp = http.getString();
      if (resp.indexOf("\"mode\":\"manual\"") > 0) {
        manualOverrideActive = true;
        if (resp.indexOf("\"pumpTarget\":true") > 0) {
          manualPumpTarget = true;
          digitalWrite(PIN_RELAY, HIGH);
        } else {
          manualPumpTarget = false;
          digitalWrite(PIN_RELAY, LOW);
        }
      } else if (resp.indexOf("\"mode\":\"auto\"") > 0) {
        manualOverrideActive = false;
      }
    }
    http.end();
  }

  // Logging ke Serial Monitor Wokwi
  Serial.printf(
      "Tanah: %d%% | RH: %.1f%% | Suhu: %.1f°C | Baterai: %.2fV (%d%%) | Pompa: %s | Mode: %s%s\n",
      soilMoisture, airHumidity, airTemp, batteryVoltage, batteryPercent,
      triggerPump ? "MENYIRAM (ON)" : "MATI (OFF)",
      manualOverrideActive ? (manualPumpTarget ? "MANUAL-ON" : "MANUAL-OFF")
                           : "AUTO",
      lowBatteryCutoff ? " [LOW BATTERY LOCK]" : "");
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_RELAY, OUTPUT);
  digitalWrite(PIN_RELAY, LOW);

  // Inisialisasi Layar LCD
  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Smart Hydroponic");
  lcd.setCursor(0, 1);
  lcd.print("System Starting.");

  dht.begin();

  // Cek koneksi Blynk atau Wi-Fi Wokwi langsung
  if (String(auth) != "Masukan_Token_Blynk_Anda" &&
      String(auth).length() > 10) {
    Serial.println("[INFO] Menghubungkan ke Blynk...");
    Blynk.begin(auth, ssid, pass);
    isBlynkActive = true;
  } else {
    Serial.println(
        "[INFO] Menghubungkan ke Wi-Fi Wokwi untuk Web Dashboard Node.js...");
    WiFi.begin(ssid, pass);
  }

  delay(1000);
  lcd.clear();

  // Evaluasi logika sensor dan kirim data setiap 2 detik
  timer.setInterval(2000L, processIrrigationLogic);
}

void loop() {
  if (isBlynkActive) {
    Blynk.run();
  }
  timer.run();
}