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
#include <WiFiClientSecure.h>

// Wi-Fi Kredensial (ESP32 dan Laptop WAJIB terhubung ke Hotspot / Wi-Fi yang
// SAMA)
char auth[] = BLYNK_AUTH_TOKEN;
char ssid[] = "indosus";
char pass[] = "12344321";

// URL Gateway Web Dashboard Vercel Cloud (Serverless API Publik - Dapat diakses
// dari mana saja)
const char *nodeServerUrl =
    "https://smart-agritech-iot.vercel.app/api/telemetry";

#define PIN_SOIL_POT 34
#define PIN_BATTERY_POT                                                        \
  35 // Pin ADC untuk monitoring tegangan baterai/solar via voltage divider
#define PIN_RELAY 27

// Konfigurasi Logika Modul Relay:
// Modul relay fisik Anda adalah tipe ACTIVE-LOW (terverifikasi dari foto: sinyal LOW menyalakan indikator hijau).
// - LOW  (0V)  : Relay AKTIF / MENYALA (Lampu Hijau MENYALA -> Kontak NO terhubung -> Pompa MENYALA)
// - HIGH (3.3V): Relay NONAKTIF / MATI (Lampu Hijau PADAM   -> Kontak NO terbuka   -> Pompa MATI)
#define RELAY_ACTIVE_LOW true

#if RELAY_ACTIVE_LOW
  #define RELAY_ON  LOW
  #define RELAY_OFF HIGH
#else
  #define RELAY_ON  HIGH
  #define RELAY_OFF LOW
#endif
#define PIN_DS18B20 4 // Pin Data 1-Wire DS18B20 Waterproof (Suhu Air Nutrisi)

int activeDhtPin = 15;
DHT dht(activeDhtPin, DHT22);
OneWire oneWire(PIN_DS18B20);
DallasTemperature ds18b20(&oneWire);

const int scanPins[] = {15, 13, 14, 16, 17, 5, 18, 19, 23, 12};
const int numScanPins = sizeof(scanPins) / sizeof(scanPins[0]);
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
  // 1. Baca data sensor lingkungan
  const int pinsToTry[] = {15, 13, 14, 23, 18, 19};
  float airHumidity = dht.readHumidity(true);
  float airTemp = dht.readTemperature(false, true);

  if (isnan(airHumidity) || isnan(airTemp)) {
    for (size_t i = 0; i < sizeof(pinsToTry) / sizeof(pinsToTry[0]); i++) {
      int p = pinsToTry[i];
      // 1. Coba protokol DHT22 (Sensor Putih)
      DHT tryDht22(p, DHT22);
      tryDht22.begin();
      float h = tryDht22.readHumidity(true);
      float t = tryDht22.readTemperature(false, true);
      if (!isnan(h) && !isnan(t)) {
        activeDhtPin = p;
        dht = tryDht22;
        airHumidity = h;
        airTemp = t;
        Serial.printf("[BERHASIL!] Sensor DHT22 (Putih) ditemukan normal di "
                      "pin GPIO %d (D%d)!\n",
                      p, p);
        break;
      }
      // 2. Coba protokol DHT11 (Sensor Biru)
      DHT tryDht11(p, DHT11);
      tryDht11.begin();
      h = tryDht11.readHumidity(true);
      t = tryDht11.readTemperature(false, true);
      if (!isnan(h) && !isnan(t)) {
        activeDhtPin = p;
        dht = tryDht11;
        airHumidity = h;
        airTemp = t;
        Serial.printf("[BERHASIL!] Sensor DHT11 (Biru) ditemukan normal di pin "
                      "GPIO %d (D%d)!\n",
                      p, p);
        break;
      }
    }
  }

  // Baca Suhu Air Nutrisi (DS18B20 Waterproof di GPIO 4)
  ds18b20.requestTemperatures();
  float waterTemp = ds18b20.getTempCByIndex(0);
  bool waterSensorValid = (waterTemp != DEVICE_DISCONNECTED_C &&
                           waterTemp > -40.0 && waterTemp < 85.0);
  bool dhtOk = (!isnan(airHumidity) && !isnan(airTemp));
  if (!waterSensorValid) {
    waterTemp =
        dhtOk ? airTemp : 25.0; // Fallback jika sensor fisik belum dicolok
    Serial.printf(
        "[PERINGATAN DS18B20] Sensor air di GPIO %d belum terbaca (Code -127). "
        "Pastikan kabel Data ke GPIO 4 & pasang resistor pull-up 4.7k!\n",
        PIN_DS18B20);
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
    // Rentang aktif proporsional
    instantMoisture =
        constrain(map(rawSoil, SOIL_DRY_ADC, SOIL_WET_ADC, 0, 100), 0, 100);
  }

  // Filter Pelembut Eksponensial (EMA / Low-Pass Filter) untuk mencegah
  // lonjakan nilai fluktuatif
  static float filteredSoil = -1.0;
  if (filteredSoil < 0) {
    filteredSoil = instantMoisture;
  } else {
    // Bobot: 65% nilai lama + 35% nilai baru agar pergerakan halus, stabil, dan
    // tidak melompat-lompat
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
  if (batteryVoltage < 10.0)
    batteryVoltage =
        12.6; // Fallback jika belum memasang sensor tegangan baterai/solar aki
  int batteryPercent =
      constrain((int)((batteryVoltage - 11.0) / (12.7 - 11.0) * 100.0), 0, 100);

  if (!dhtOk) {
    Serial.printf("[PERINGATAN DHT] Sensor DHT di GPIO %d belum terbaca. Cek "
                  "pin data DHT!\n",
                  activeDhtPin);
    airHumidity = 60.0;
    airTemp = 27.0;
  }

  // 3. Kirim data ke Pin Virtual Blynk (jika terhubung)
  if (isBlynkActive) {
    Blynk.virtualWrite(V0, soilMoisture);   // Gauge Tanah
    Blynk.virtualWrite(V1, airTemp);        // Nilai Suhu Udara
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

  // 6. Kirim Telemetry ke Server Web Dashboard
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    bool isHttps = String(nodeServerUrl).startsWith("https://");
    WiFiClientSecure secureClient;
    WiFiClient plainClient;

    if (isHttps) {
      secureClient.setInsecure();
      http.begin(secureClient, nodeServerUrl);
    } else {
      http.begin(plainClient, nodeServerUrl);
    }
    http.setTimeout(3500);
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
      // Server membalas instruksi jika ada override manual dari web
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
      Serial.printf("[HTTP %d] Telemetri terkirim ke Web Dashboard!\n", code);
    } else {
      Serial.printf("[HTTP ERROR] Gagal mengirim ke %s | Error: %s (Kode %d)\n",
                    nodeServerUrl, http.errorToString(code).c_str(), code);
    }
    http.end();
  } else {
    Serial.println("[WARN] Wi-Fi ESP32 terputus! Mencoba rekoneksi...");
    WiFi.reconnect();
  }

  // Logging ke Serial Monitor
  Serial.printf(
      "Tanah: %d%% (ADC: %d) | Udara: %.1f°C | Air (DS18B20): %.1f°C | RH: "
      "%.1f%% | Bat: %.2fV (%d%%) | Pompa: %s (Pin D%d: %s) | Mode: %s%s\n",
      soilMoisture, rawSoil, airTemp, waterTemp, airHumidity, batteryVoltage,
      batteryPercent, triggerPump ? "MENYIRAM (ON)" : "MATI (OFF)",
      PIN_RELAY, (triggerPump ? "LOW" : "HIGH"),
      manualOverrideActive ? (manualPumpTarget ? "MANUAL-ON" : "MANUAL-OFF")
                           : "AUTO",
      lowBatteryCutoff ? " [LOW BATTERY LOCK]" : "");
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_RELAY, OUTPUT);
  digitalWrite(PIN_RELAY, RELAY_OFF);

  pinMode(activeDhtPin, INPUT_PULLUP);
  dht.begin();
  pinMode(PIN_DS18B20, INPUT_PULLUP);
  ds18b20.begin();
  Serial.println("[INFO] Sensor Suhu Air DS18B20 diinisialisasi pada GPIO 4 "
                 "(Pullup Aktif).");

  // Cek koneksi Blynk atau Wi-Fi langsung
  if (String(auth) != "Masukan_Token_Blynk_Anda" &&
      String(auth).length() > 10) {
    Serial.println("[INFO] Menghubungkan ke Blynk...");
    Blynk.begin(auth, ssid, pass);
    isBlynkActive = true;
  } else {
    Serial.printf("[INFO] Menghubungkan ke Wi-Fi '%s' ...\n", ssid);
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, pass);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(400);
      Serial.print(".");
      attempts++;
    }
    // Jika tidak terhubung ke hotspot (misalnya sedang dijalankan di simulator
    // Wokwi), coba Wokwi-GUEST
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("\n[INFO] Mencoba Wi-Fi Simulator Wokwi-GUEST...");
      WiFi.begin("Wokwi-GUEST", "");
      attempts = 0;
      while (WiFi.status() != WL_CONNECTED && attempts < 15) {
        delay(400);
        Serial.print(".");
        attempts++;
      }
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\n[INFO] Wi-Fi Berhasil Terhubung!");
      Serial.printf("[INFO] SSID      : %s\n", WiFi.SSID().c_str());
      Serial.printf("[INFO] IP ESP32  : %s\n",
                    WiFi.localIP().toString().c_str());
      Serial.printf("[INFO] Target Web: %s\n", nodeServerUrl);
    } else {
      Serial.println("\n[WARN] Belum berhasil terhubung ke Wi-Fi. Cek kembali "
                     "SSID & Password!");
    }
  }

  // Tampilkan data pertama kali secara langsung ke Dashboard
  processIrrigationLogic();

  // Evaluasi logika sensor dan kirim data setiap 3 detik (sesuai spesifikasi
  // DHT22)
  timer.setInterval(3000L, processIrrigationLogic);
}

void loop() {
  if (isBlynkActive) {
    Blynk.run();
  }
  timer.run();
}
