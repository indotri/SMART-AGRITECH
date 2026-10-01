# HydroNode — Phosphor CRT IoT Dashboard (Node.js)

Dashboard IoT berbasis **Node.js + Socket.IO + Vanilla CSS** untuk sistem monitoring dan kontrol hidroponik pintar ESP32. Antarmuka dirancang mengikuti sistem desain **Phosphor Terminal** dari `DESIGN.md`.

## Fitur Utama

- **CRT Phosphor Terminal Aesthetic:** Sesuai tokens `DESIGN.md` (Void Black `#000000`, Ground Iron `#181818`, Carbon Veil `#212525`, Lime Pulse `#7fee64`, Phosphor White `#ddffdc`, dan Circuit Border `#485346`).
- **Telemetry Real-Time:** Update data kelembapan tanah, suhu udara, kelembapan udara (RH), dan status relay pompa secara instan via WebSocket.
- **Relay Actuator Override:** Saklar mode (Autonomous vs Manual Override) dan kendali pompa langsung dari web.
- **Dynamic Threshold Calibration:** Atur batas kritis kelembapan tanah (< 35%) dan batas aman (>= 50%) langsung dari browser.
- **Live Vector Canvas Chart:** Grafik tren 40-titik waktu-nyata tanpa library berat.
- **Terminal Code Window:** Log stream dengan traffic-light dots (`[SYS]`, `[ESP32]`, `[PUMP]`, `[ALERT]`).
- **Built-in Virtual Simulator:** Jika ESP32 belum dinyalakan, server otomatis menghasilkan data simulasi natural sehingga dashboard langsung aktif dan dapat diuji seketika.

## Cara Menjalankan

1. Masuk ke folder `dashboard`:
   ```bash
   cd dashboard
   ```
2. Pastikan dependensi terpasang:
   ```bash
   npm install
   ```
3. Jalankan server:
   ```bash
   node server.js
   ```
4. Buka di browser:
   ```
   http://localhost:3000
   ```

## API Endpoints untuk ESP32

- `POST /api/telemetry`
  - Body (JSON):
    ```json
    {
      "soilMoisture": 42,
      "airTemp": 28.5,
      "airHumidity": 60.0,
      "pumpStatus": 0
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "pumpTarget": false,
      "mode": "auto",
      "thresholds": { ... }
    }
    ```
- `GET /api/status`: Mengambil status terkini dan jumlah client terhubung.
- `POST /api/pump`: Mengirim kontrol override manual pompa (`{ "action": "on" | "off" }`).
