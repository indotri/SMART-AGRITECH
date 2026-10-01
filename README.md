# 🌱 Smart Hydroponic IoT System (ESP32 & Node.js Dashboard)

Sistem monitoring dan otomasi irigasi hidroponik berbasis **ESP32** dengan web dashboard real-time bergaya **CRT Phosphor Terminal** bertenaga **Node.js + Socket.IO**.

---

## 📋 Fitur Utama
- **Monitoring Real-time:** Memantau kelembapan tanah, suhu udara, kelembapan udara (RH), tegangan baterai, dan panel surya.
- **Kontrol Pompa Otomatis & Manual:** Pompa aktif otomatis saat tanah kritis (<35%) atau dapat di-override langsung dari web dashboard.
- **Bi-directional WebSocket:** Update instan tanpa perlu reload halaman via Socket.IO.
- **Live Vector Chart & Terminal Log:** Visualisasi grafik dinamis dan log stream aktivitas sistem.
- **Virtual Telemetry Simulator:** Server otomatis menyimulasikan data jika perangkat keras ESP32 belum terhubung.
- **Auto Data Logger:** Pencatatan otomatis ke format Excel (`.xlsx`) dan JSONL.

---

## 🚀 Panduan Menjalankan Proyek (Untuk Teman / Kontributor)

### 1. Clone Repository
Buka terminal (Git Bash, Command Prompt, atau PowerShell), lalu jalankan:
```bash
git clone <URL_REPOSITORY_GITHUB_KAMU>
cd hidro
```

---

### 2. Menjalankan Web Dashboard (Node.js)
1. Masuk ke direktori `dashboard`:
   ```bash
   cd dashboard
   ```
2. Pasang semua dependensi:
   ```bash
   npm install
   ```
3. Jalankan server:
   ```bash
   npm start
   # atau: node server.js
   ```
4. Buka browser dan akses:
   ```
   http://localhost:3000
   ```

---

### 3. Menjalankan Simulasi ESP32 (Wokwi / PlatformIO)
- **Menggunakan PlatformIO (VS Code):**
  1. Buka folder root proyek di VS Code yang telah memiliki ekstensi **PlatformIO IDE**.
  2. Klik ikon PlatformIO -> **Build** (`pio run`) atau **Upload** ke board ESP32 fisik.
- **Menggunakan Wokwi Simulator:**
  1. Pasang ekstensi **Wokwi for VS Code**.
  2. Buka file `diagram.json` dan tekan tombol **Play** untuk memulai simulasi sirkuit virtual.

---

## 🌐 Cara Deploy ke Cloud

### Rekomendasi Utama: Render.com (Gratis & Mendukung WebSocket)
Karena dashboard ini menggunakan **Express + Socket.IO (WebSocket)**, platform seperti **Render** atau **Railway** adalah pilihan terbaik:
1. Buat akun di [Render.com](https://render.com).
2. Klik **New +** -> **Web Service**.
3. Hubungkan repository GitHub ini.
4. Konfigurasi:
   - **Root Directory:** `dashboard`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Klik **Create Web Service**. Web dashboard Anda akan langsung online dengan dukungan WebSocket penuh!

### Opsi Vercel (Hanya untuk Tampilan Statis)
*Catatan: Vercel berbasis Serverless Functions, sehingga koneksi WebSocket persisten (Socket.IO) tidak didukung secara native.*
Jika ingin deploy tampilan frontend saja:
1. Hubungkan repository ke [Vercel](https://vercel.com).
2. Set **Root Directory** ke `dashboard/public` (atau `dashboard`).
3. Deploy.

---

## 📁 Struktur Direktori
```
hidro/
├── src/                # Kode sumber firmware ESP32 (main.cpp)
├── platformio.ini      # Konfigurasi PlatformIO & dependensi C++
├── diagram.json        # Desain wiring sirkuit Wokwi
├── wokwi.toml          # Konfigurasi simulasi Wokwi
├── dashboard/          # Aplikasi Web Gateway & Dashboard
│   ├── public/         # Tampilan frontend (HTML, CSS, JS)
│   ├── server.js       # Express & Socket.IO server
│   ├── excelLogger.js  # Modul pencatatan data ke Excel
│   └── package.json    # Dependensi Node.js
└── README.md           # Panduan proyek
```
