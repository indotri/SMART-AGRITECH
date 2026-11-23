// 1. Kredensial Blynk (WAJIB paling atas sebelum include Blynk)
#define BLYNK_TEMPLATE_ID "TMPLxxxxxx"
#define BLYNK_TEMPLATE_NAME "Smart Irrigation"
#define BLYNK_AUTH_TOKEN "Masukan_Token_Blynk_Anda"

#include "DHT.h"
#include <Arduino.h>
#include <BlynkSimpleEsp32.h>
#include <DallasTemperature.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <WiFi.h>
#include <WiFiClient.h>

// Wi-Fi Virtual khusus Wokwi (tidak perlu diubah)
char auth[] = BLYNK_AUTH_TOKEN;
char ssid[] = "Wokwi-GUEST";
char pass[] = "";

// URL Gateway Web Dashboard Node.js
// - Jika di Wokwi for VS Code / Wokwi IoT Gateway: gunakan
// "http://host.wokwi.internal:3000/api/telemetry" atau IP laptop
// - IP Laptop Anda saat ini: "http://10.70.86.183:3000/api/telemetry"
const char *nodeServerUrl = "http://10.70.86.183:3000/api/telemetry";

#define PIN_SOIL_POT 34
#define PIN_BATTERY_POT                                                        \
  35 // Pin ADC untuk monitoring tegangan baterai/solar via voltage divider
#define PIN_DHT 15
#define DHTTYPE DHT22
#define PIN_RELAY 2

// Konfigurasi Logika Modul Relay:
// Mayoritas modul relay ESP32/Arduino (misal modul relay Songle 1-channel optocoupler)
// beroperasi dengan logika ACTIVE-LOW:
// - LOW (0V)  : Relay AKTIF (Kontak NO terhubung -> Pompa MENYALA)
// - HIGH (3.3V): Relay MATI (Kontak NO terbuka -> Pompa MATI)
#define RELAY_ACTIVE_LOW true

#if RELAY_ACTIVE_LOW
  #define RELAY_ON  LOW
  #define RELAY_OFF HIGH
#else
  #define RELAY_ON  HIGH
  #define RELAY_OFF LOW
#endif
#define PIN_DS18B20 4 // Pin Data 1-Wire Sensor Suhu Air Waterproof DS18B20

DHT dht(PIN_DHT, DHTTYPE);
OneWire oneWire(PIN_DS18B20);
DallasTemperature ds18b20(&oneWire);
BlynkTimer timer;

// Ambang Batas Prioritas Kelembapan Tanah, Udara, Suhu & Baterai (Dapat
// dikonfigurasi via Web)
int soilSafeLimit = 50;      // Batas Aman: Jika tanah >= 50%, pompa WAJIB MATI
int soilCriticalLimit = 35;  // Batas Kritis: Jika tanah < 35%, wajib siram
float airHumDryLimit = 60.0; // Udara kering jika RH < 60%
float tempMaxLimit = 31.0;   // Batas Suhu Panas jika Suhu >= 31°C
const int BATTERY_CUTOFF_LIMIT =
    15; // Batas Kritis Baterai (< 15% kunci pompa agar aki awet)

bool isBlynkActive = false;
bool manualOverrideActive = false;
bool manualPumpTarget = false;

void processIrrigationLogic() {
  // 1. Baca data sensor lingkungan (Udara & Suhu Air Nutrisi)
  float airHumidity = dht.readHumidity();
  float airTemp = dht.readTemperature(); // Suhu udara DHT22

  // Baca sensor suhu air tandon nutrisi DS18B20 (Waterproof)
  ds18b20.requestTemperatures();
  float waterTemp = ds18b20.getTempCByIndex(0);
  // Validasi nilai pembacaan DS18B20 (DEVICE_DISCONNECTED_C = -127°C)
  bool waterSensorValid = (waterTemp != DEVICE_DISCONNECTED_C &&
                           waterTemp > -40.0 && waterTemp < 85.0);
  if (!waterSensorValid) {
    waterTemp =
        airTemp; // Fallback ke suhu udara jika sensor fisik belum tersambung
  }

  // 2. Baca Sensor Kelembapan Tanah (ADC ESP32: 0 - 4095 di GPIO 34)
  // Multi-sampling 20 sampel dengan jeda mikro untuk meredam noise & fluktuasi
  // ADC
  long sumSoil = 0;
  for (int i = 0; i < 20; i++) {
    sumSoil += analogRead(PIN_SOIL_POT);
    delay(2);
  }
  int rawSoil = (int)(sumSoil / 20);

  // Kalibrasi Sensor Tanah Berdasarkan Karakteristik Fisik:
  // - Di udara bebas (kering total): ADC ~3500 -> 0%
  // - Dicelup ke dalam air (sangat basah): ADC ~3100 -> 100%
  const int SOIL_DRY_ADC = 3500;
  const int SOIL_WET_ADC = 3100;
  int instantMoisture = 0;
  if (rawSoil >= SOIL_DRY_ADC) {
    instantMoisture = 0;
  } else if (rawSoil <= SOIL_WET_ADC) {
    instantMoisture = 100;
  } else {
    instantMoisture =
        constrain(map(rawSoil, SOIL_DRY_ADC, SOIL_WET_ADC, 0, 100), 0, 100);
  }

  // Filter Pelembut Eksponensial (EMA / Low-Pass Filter) untuk mencegah
  // lonjakan nilai fluktuatif
  static float filteredSoil = -1.0;
  if (filteredSoil < 0) {
    filteredSoil = instantMoisture;
  } else {
    filteredSoil = (filteredSoil * 0.65f) + (instantMoisture * 0.35f);
  }
  int soilMoisture = round(filteredSoil);

  // Multi-sampling tegangan baterai untuk stabilitas
  long sumBattery = 0;
  for (int i = 0; i < 10; i++) {
    sumBattery += analogRead(PIN_BATTERY_POT);
    delay(1);
  }
  int rawBattery = (int)(sumBattery / 10);
  // Kalibrasi tegangan baterai aki 12V (rentang 10.0V - 14.5V)
  // Pembagi tegangan R1=30k & R2=7.5k memetakan tegangan 0-14.8V ke 0-3.3V ADC
  // ESP32
  float batteryVoltage = (rawBattery / 4095.0) * 14.5;
  if (batteryVoltage < 0.5)
    batteryVoltage =
        12.4; // Default fallback jika pin mengambang saat tanpa kabel
  int batteryPercent =
      constrain((int)((batteryVoltage - 11.0) / (12.7 - 11.0) * 100.0), 0, 100);

  if (isnan(airHumidity) || isnan(airTemp)) {
    Serial.println("[ERROR] Pembacaan DHT22 gagal!");
    return;
  }

  // 3. Kirim data ke Pin Virtual Blynk (jika terhubung)
  if (isBlynkActive) {
    Blynk.virtualWrite(V0, soilMoisture);   // Gauge Tanah
    Blynk.virtualWrite(V1, airTemp);        // Suhu Udara
    Blynk.virtualWrite(V2, airHumidity);    // Gauge RH Udara
    Blynk.virtualWrite(V4, batteryPercent); // Level Baterai (%)
    Blynk.virtualWrite(V5, waterTemp);      // Suhu Air Nutrisi (DS18B20)
  }

  // 4. Evaluasi Logika Pompa (PRIORITAS: OVERRIDE MANUAL & SAFETY BATERAI)
  bool triggerPump = false;

  if (manualOverrideActive) {
    // Mode Manual: Ikuti target dari web/server
    triggerPump = manualPumpTarget;
  } else {
    // Mode Otomatis: Prioritas kelembapan tanah, udara, dan suhu
    if (soilMoisture < soilSafeLimit) {
      if (soilMoisture < soilCriticalLimit) {
        // Kondisi A: Tanah sangat kering kritis (< soilCriticalLimit), langsung
        // siram
        triggerPump = true;
      } else if (airHumidity < airHumDryLimit) {
        // Kondisi B: Tanah mulai kering (< soilSafeLimit) DAN udara juga kering
        // (< airHumDryLimit)
        triggerPump = true;
      } else if (airTemp >= tempMaxLimit) {
        // Kondisi C: Suhu lingkungan melampaui batas panas (>= tempMaxLimit)
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
    digitalWrite(PIN_RELAY, RELAY_ON); // Pompa MENYALA
    if (isBlynkActive)
      Blynk.virtualWrite(V3, 255);
  } else {
    digitalWrite(PIN_RELAY, RELAY_OFF); // Pompa MATI
    if (isBlynkActive)
      Blynk.virtualWrite(V3, 0);
  }

  // 6. Kirim Telemetry ke Server Web Node.js
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(nodeServerUrl);
    http.setTimeout(1200); // 1.2s timeout
    http.addHeader("Content-Type", "application/json");

    String json = "{\"soilMoisture\":" + String(soilMoisture) +
                  ",\"airTemp\":" + String(airTemp, 1) +
                  ",\"waterTemp\":" + String(waterTemp, 1) +
                  ",\"airHumidity\":" + String(airHumidity, 1) +
                  ",\"pumpStatus\":" + String(triggerPump ? 1 : 0) +
                  ",\"batteryVoltage\":" + String(batteryVoltage, 2) +
                  ",\"batteryPercent\":" + String(batteryPercent) + "}";

    int code = http.POST(json);
    if (code > 0) {
      Serial.printf("[HTTP %d] Telemetri terkirim ke Web Dashboard!\n", code);
      // Server membalas instruksi jika ada override manual atau pembaruan
      // ambang batas dari web
      String resp = http.getString();
      if (resp.indexOf("\"mode\":\"manual\"") > 0) {
        manualOverrideActive = true;
        if (resp.indexOf("\"pumpTarget\":true") > 0) {
          manualPumpTarget = true;
          digitalWrite(PIN_RELAY, RELAY_ON);
        } else {
          manualPumpTarget = false;
          digitalWrite(PIN_RELAY, RELAY_OFF);
        }
      } else if (resp.indexOf("\"mode\":\"auto\"") > 0) {
        manualOverrideActive = false;
      }

      // Sinkronisasi ambang batas dinamis dari Web jika tersedia
      int idxSafe = resp.indexOf("\"soilSafeLimit\":");
      if (idxSafe > 0) {
        soilSafeLimit = resp.substring(idxSafe + 16).toInt();
      }
      int idxCrit = resp.indexOf("\"soilCriticalLimit\":");
      if (idxCrit > 0) {
        soilCriticalLimit = resp.substring(idxCrit + 20).toInt();
      }
      int idxHum = resp.indexOf("\"airHumDryLimit\":");
      if (idxHum > 0) {
        airHumDryLimit = resp.substring(idxHum + 17).toFloat();
      }
      int idxTemp = resp.indexOf("\"tempMaxLimit\":");
      if (idxTemp > 0) {
        tempMaxLimit = resp.substring(idxTemp + 15).toFloat();
      }
    } else {
      Serial.printf("[HTTP ERROR] Gagal mengirim ke %s | Error: %s\n",
                    nodeServerUrl, http.errorToString(code).c_str());
    }
    http.end();
  }

  // Logging ke Serial Monitor Wokwi / Hardware
  Serial.printf("Tanah: %d%% | RH: %.1f%% | Udara: %.1f°C | Air Nutrisi: "
                "%.1f°C | Baterai: %.2fV (%d%%) | Pompa: %s | Mode: %s%s\n",
                soilMoisture, airHumidity, airTemp, waterTemp, batteryVoltage,
                batteryPercent, triggerPump ? "MENYIRAM (ON)" : "MATI (OFF)",
                manualOverrideActive
                    ? (manualPumpTarget ? "MANUAL-ON" : "MANUAL-OFF")
                    : "AUTO",
                lowBatteryCutoff ? " [LOW BATTERY LOCK]" : "");
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_RELAY, OUTPUT);
  digitalWrite(PIN_RELAY, RELAY_OFF);

  pinMode(PIN_DHT, INPUT_PULLUP);
  dht.begin();
  pinMode(PIN_DS18B20, INPUT_PULLUP);
  ds18b20.begin();
  Serial.println("[INFO] Sensor Suhu Air DS18B20 diinisialisasi pada GPIO 4.");

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
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(300);
      Serial.print(".");
      attempts++;
    }
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\n[INFO] Wi-Fi Wokwi Terhubung!");
      Serial.printf("[INFO] Target Web Dashboard: %s\n", nodeServerUrl);
    } else {
      Serial.println("\n[WARN] Menunggu koneksi Wi-Fi...");
    }
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