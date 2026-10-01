const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const RECORDS_DIR = path.join(__dirname, 'records');

// Pastikan folder records ada
if (!fs.existsSync(RECORDS_DIR)) {
  fs.mkdirSync(RECORDS_DIR, { recursive: true });
}

class TelemetryExcelLogger {
  constructor() {
    this.recordsDir = RECORDS_DIR;
    this.currentDate = this.getDateString(new Date());
    this.todayBuffer = [];
    this.lastSaveTime = Date.now();
    this.saveIntervalMs = 60 * 1000; // Auto-save ke disk setiap 1 menit jika ada data baru
    this.isDirty = false;

    // Load data hari ini jika sebelumnya sudah tersimpan di cache JSONL
    this.loadTodayCache();

    // Auto-save timer berkala
    setInterval(() => {
      if (this.isDirty) {
        this.saveTodayExcel();
      }
    }, this.saveIntervalMs);

    // Cek rotasi harian setiap 1 menit (pergantian hari pukul 00:00)
    setInterval(() => {
      this.checkDayRotation();
    }, 60 * 1000);
  }

  getDateString(date) {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  getTimeString(date) {
    const d = new Date(date);
    return d.toTimeString().split(' ')[0]; // HH:mm:ss
  }

  getJsonlPath(dateStr) {
    return path.join(this.recordsDir, `data_${dateStr}.jsonl`);
  }

  getExcelPath(dateStr) {
    return path.join(this.recordsDir, `hydro_telemetry_${dateStr}.xlsx`);
  }

  loadTodayCache() {
    const jsonlPath = this.getJsonlPath(this.currentDate);
    if (fs.existsSync(jsonlPath)) {
      try {
        const lines = fs.readFileSync(jsonlPath, 'utf8').split('\n');
        this.todayBuffer = [];
        for (const line of lines) {
          if (line.trim()) {
            this.todayBuffer.push(JSON.parse(line));
          }
        }
        console.log(`[ExcelLogger] Loaded ${this.todayBuffer.length} historical records for today (${this.currentDate})`);
      } catch (err) {
        console.error('[ExcelLogger] Failed loading today cache:', err);
      }
    }
  }

  checkDayRotation() {
    const nowStr = this.getDateString(new Date());
    if (nowStr !== this.currentDate) {
      console.log(`[ExcelLogger] Day rotation detected: ${this.currentDate} -> ${nowStr}`);
      // Simpan final untuk hari sebelumnya
      this.saveTodayExcel(this.currentDate);
      
      // Beralih ke hari baru
      this.currentDate = nowStr;
      this.todayBuffer = [];
      this.isDirty = false;
      this.loadTodayCache();
    }
  }

  record(telemetry, mode = 'auto') {
    this.checkDayRotation();

    const timestamp = new Date();
    const entry = {
      timestamp: timestamp.toISOString(),
      date: this.getDateString(timestamp),
      time: this.getTimeString(timestamp),
      soilMoisture: Number(telemetry.soilMoisture) || 0,
      airTemp: Number(telemetry.airTemp) || 0,
      airHumidity: Number(telemetry.airHumidity) || 0,
      batteryVoltage: Number(telemetry.batteryVoltage) || 0,
      batteryPercent: Number(telemetry.batteryPercent) || 0,
      solarVoltage: Number(telemetry.solarVoltage) || 0,
      solarStatus: telemetry.solarStatus || 'CHARGING',
      pumpStatus: !!telemetry.pumpStatus,
      mode: (mode || 'auto').toUpperCase()
    };

    this.todayBuffer.push(entry);
    this.isDirty = true;

    // Append ke file JSONL agar data instan aman dan tidak hilang jika crash
    const jsonlPath = this.getJsonlPath(this.currentDate);
    fs.appendFile(jsonlPath, JSON.stringify(entry) + '\n', (err) => {
      if (err) console.error('[ExcelLogger] Error appending JSONL:', err);
    });
  }

  // Hitung rata-rata, min, max, dan ringkasan operasional dari buffer
  computeSummary(records) {
    if (!records || records.length === 0) {
      return {
        count: 0,
        startTime: '-',
        endTime: '-',
        soil: { avg: 0, min: 0, max: 0, latest: 0 },
        temp: { avg: 0, min: 0, max: 0, latest: 0 },
        hum: { avg: 0, min: 0, max: 0, latest: 0 },
        batVolt: { avg: 0, min: 0, max: 0, latest: 0 },
        batPct: { avg: 0, min: 0, max: 0, latest: 0 },
        solarVolt: { avg: 0, min: 0, max: 0, latest: 0 },
        pumpActiveCount: 0,
        pumpCycles: 0,
        criticalSoilCount: 0,
        lowBatteryLockCount: 0
      };
    }

    const count = records.length;
    let sumSoil = 0, minSoil = Infinity, maxSoil = -Infinity;
    let sumTemp = 0, minTemp = Infinity, maxTemp = -Infinity;
    let sumHum = 0, minHum = Infinity, maxHum = -Infinity;
    let sumBatVolt = 0, minBatVolt = Infinity, maxBatVolt = -Infinity;
    let sumBatPct = 0, minBatPct = Infinity, maxBatPct = -Infinity;
    let sumSolarVolt = 0, minSolarVolt = Infinity, maxSolarVolt = -Infinity;

    let pumpActiveCount = 0;
    let pumpCycles = 0;
    let prevPump = false;
    let criticalSoilCount = 0;
    let lowBatteryLockCount = 0;

    for (const r of records) {
      // Soil
      sumSoil += r.soilMoisture;
      if (r.soilMoisture < minSoil) minSoil = r.soilMoisture;
      if (r.soilMoisture > maxSoil) maxSoil = r.soilMoisture;
      if (r.soilMoisture < 35) criticalSoilCount++;

      // Temp
      sumTemp += r.airTemp;
      if (r.airTemp < minTemp) minTemp = r.airTemp;
      if (r.airTemp > maxTemp) maxTemp = r.airTemp;

      // Hum
      sumHum += r.airHumidity;
      if (r.airHumidity < minHum) minHum = r.airHumidity;
      if (r.airHumidity > maxHum) maxHum = r.airHumidity;

      // Bat Volt
      sumBatVolt += r.batteryVoltage;
      if (r.batteryVoltage < minBatVolt) minBatVolt = r.batteryVoltage;
      if (r.batteryVoltage > maxBatVolt) maxBatVolt = r.batteryVoltage;

      // Bat Pct
      sumBatPct += r.batteryPercent;
      if (r.batteryPercent < minBatPct) minBatPct = r.batteryPercent;
      if (r.batteryPercent > maxBatPct) maxBatPct = r.batteryPercent;
      if (r.batteryPercent < 15) lowBatteryLockCount++;

      // Solar Volt
      sumSolarVolt += r.solarVoltage;
      if (r.solarVoltage < minSolarVolt) minSolarVolt = r.solarVoltage;
      if (r.solarVoltage > maxSolarVolt) maxSolarVolt = r.solarVoltage;

      // Pump stats
      if (r.pumpStatus) {
        pumpActiveCount++;
        if (!prevPump) pumpCycles++; // Awal siklus nyala baru
      }
      prevPump = r.pumpStatus;
    }

    const latest = records[records.length - 1];

    return {
      count,
      startTime: records[0].time,
      endTime: latest.time,
      soil: {
        avg: +(sumSoil / count).toFixed(1),
        min: minSoil,
        max: maxSoil,
        latest: latest.soilMoisture
      },
      temp: {
        avg: +(sumTemp / count).toFixed(1),
        min: minTemp,
        max: maxTemp,
        latest: latest.airTemp
      },
      hum: {
        avg: +(sumHum / count).toFixed(1),
        min: minHum,
        max: maxHum,
        latest: latest.airHumidity
      },
      batVolt: {
        avg: +(sumBatVolt / count).toFixed(2),
        min: minBatVolt,
        max: maxBatVolt,
        latest: latest.batteryVoltage
      },
      batPct: {
        avg: +(sumBatPct / count).toFixed(1),
        min: minBatPct,
        max: maxBatPct,
        latest: latest.batteryPercent
      },
      solarVolt: {
        avg: +(sumSolarVolt / count).toFixed(2),
        min: minSolarVolt,
        max: maxSolarVolt,
        latest: latest.solarVoltage
      },
      pumpActiveCount,
      pumpCycles,
      criticalSoilCount,
      lowBatteryLockCount
    };
  }

  // Membuat Workbook ExcelJS dengan 2 sheet rapi & bergaya profesional
  async generateWorkbook(dateStr, records) {
    const summary = this.computeSummary(records);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Smart Hydroponic IoT Gateway';
    workbook.created = new Date();

    // ==========================================
    // SHEET 1: RINGKASAN & RATA-RATA HARIAN
    // ==========================================
    const wsSummary = workbook.addWorksheet('Ringkasan Harian', {
      properties: { tabColor: { argb: 'FF107C41' } },
      views: [{ showGridLines: true }]
    });

    // Judul Utama Banner
    wsSummary.mergeCells('A1:G1');
    const titleCell = wsSummary.getCell('A1');
    titleCell.value = '🌱 SISTEM MONITORING HIDROPONIK OTOMATIS BERBASIS IOT';
    titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF107C41' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    wsSummary.getRow(1).height = 36;

    // Subtitle Info
    wsSummary.mergeCells('A2:G2');
    const subCell = wsSummary.getCell('A2');
    subCell.value = `Laporan Agregasi 24 Jam | Tanggal: ${dateStr} | Total Sampel Data: ${summary.count} titik | Rentang: ${summary.startTime} - ${summary.endTime}`;
    subCell.font = { name: 'Segoe UI', size: 11, italic: true, color: { argb: 'FFFFFFFF' } };
    subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E5631' } };
    subCell.alignment = { vertical: 'middle', horizontal: 'center' };
    wsSummary.getRow(2).height = 24;

    wsSummary.addRow([]); // Blank row 3

    // Header Bagian 1
    const sec1Row = wsSummary.addRow(['📊 TABEL RATA-RATA & STATISTIK SENSOR LINGKUNGAN']);
    wsSummary.mergeCells(`A4:G4`);
    sec1Row.getCell(1).font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FF107C41' } };
    sec1Row.height = 24;

    // Header Kolom Tabel Metrik
    const headerRow = wsSummary.addRow([
      'No',
      'Parameter Sensor',
      'Rata-rata (Avg)',
      'Nilai Min',
      'Nilai Max',
      'Nilai Terakhir',
      'Satuan / Standar Operasi'
    ]);
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF217346' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'medium', color: { argb: 'FF107C41' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
    });

    const metricsData = [
      [1, 'Kelembapan Tanah', summary.soil.avg, summary.soil.min, summary.soil.max, summary.soil.latest, '% (Ideal: 40% - 70%)'],
      [2, 'Suhu Udara', summary.temp.avg, summary.temp.min, summary.temp.max, summary.temp.latest, '°C (Ideal: 22°C - 30°C)'],
      [3, 'Kelembapan Udara (RH)', summary.hum.avg, summary.hum.min, summary.hum.max, summary.hum.latest, '% (Ideal: 55% - 75%)'],
      [4, 'Tegangan Baterai Aki', summary.batVolt.avg, summary.batVolt.min, summary.batVolt.max, summary.batVolt.latest, 'Volt (Aki 12V: 11.5V - 13.8V)'],
      [5, 'Level Kapasitas Baterai', summary.batPct.avg, summary.batPct.min, summary.batPct.max, summary.batPct.latest, '% (Cutoff Proteksi: < 15%)'],
      [6, 'Tegangan Panel Surya', summary.solarVolt.avg, summary.solarVolt.min, summary.solarVolt.max, summary.solarVolt.latest, 'Volt (Solar 18V Nominal)']
    ];

    metricsData.forEach((row, idx) => {
      const r = wsSummary.addRow(row);
      r.height = 22;
      const isEven = idx % 2 === 0;
      r.eachCell((cell, colNumber) => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.alignment = { vertical: 'middle', horizontal: colNumber === 2 || colNumber === 7 ? 'left' : 'center' };
        if (colNumber === 3) {
          cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF107C41' } };
        }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF6FAF6' }
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };
      });
    });

    wsSummary.addRow([]); // Blank row 12

    // Header Bagian 2: Ringkasan Pompa & Kejadian Sistem
    const sec2Row = wsSummary.addRow(['⚡ RINGKASAN AKTIVITAS POMPA & KESEHATAN SISTEM']);
    wsSummary.mergeCells(`A13:G13`);
    sec2Row.getCell(1).font = { name: 'Segoe UI', size: 12, bold: true, color: { argb: 'FF107C41' } };
    sec2Row.height = 24;

    const opHeaderRow = wsSummary.addRow([
      'No',
      'Indikator Operasional',
      'Nilai / Akumulasi',
      'Satuan',
      'Keterangan & Evaluasi Logika Otomatis',
      '',
      ''
    ]);
    wsSummary.mergeCells(`E14:G14`);
    opHeaderRow.height = 24;
    opHeaderRow.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D6A4F' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'medium', color: { argb: 'FF107C41' } }
      };
    });

    const estDurationSec = summary.pumpActiveCount * 2; // asumsi interval rata-rata 2 detik
    const estDurationMin = (estDurationSec / 60).toFixed(1);

    const operationalData = [
      [1, 'Total Rekaman Data (Samples)', summary.count, 'Titik', 'Jumlah paket telemetri sukses diterima server'],
      [2, 'Frekuensi Pompa Aktif (Siklus)', summary.pumpCycles, 'Kali', 'Berapa kali pompa menyala untuk menyiram tanaman'],
      [3, 'Total Durasi Pompa Bekerja', `${estDurationMin} m (${estDurationSec} s)`, 'Waktu', 'Estimasi total waktu pompa ON hari ini'],
      [4, 'Peringatan Tanah Kritis (<35%)', summary.criticalSoilCount, 'Kejadian', 'Frekuensi kondisi tanah sangat kering yang memicu siram darurat'],
      [5, 'Penguncian Baterai Lemah (<15%)', summary.lowBatteryLockCount, 'Kejadian', 'Proteksi deep discharge aki terpicu (pompa dikunci demi keamanan aki)']
    ];

    operationalData.forEach((row, idx) => {
      const r = wsSummary.addRow([row[0], row[1], row[2], row[3], row[4], '', '']);
      wsSummary.mergeCells(`E${r.number}:G${r.number}`);
      r.height = 22;
      const isEven = idx % 2 === 0;
      r.eachCell((cell, colNumber) => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.alignment = { vertical: 'middle', horizontal: colNumber === 2 || colNumber === 5 ? 'left' : 'center' };
        if (colNumber === 3) {
          cell.font = { name: 'Segoe UI', size: 10, bold: true };
        }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF6FAF6' }
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };
      });
    });

    // Lebar kolom Sheet Summary
    wsSummary.columns = [
      { width: 8 },  // No
      { width: 32 }, // Parameter
      { width: 18 }, // Avg / Value
      { width: 16 }, // Min / Unit
      { width: 16 }, // Max
      { width: 16 }, // Latest
      { width: 34 }  // Unit / Note
    ];

    // ==========================================
    // SHEET 2: DATA LOG RINCI (RAW TELEMETRY)
    // ==========================================
    const wsLog = workbook.addWorksheet('Log Data Rinci', {
      properties: { tabColor: { argb: 'FF217346' } },
      views: [{ showGridLines: true, state: 'frozen', ySplit: 1 }]
    });

    const rawHeaders = [
      'No',
      'Waktu',
      'Tanggal',
      'Kelembapan Tanah (%)',
      'Suhu (°C)',
      'Kelembapan Udara (%)',
      'Tegangan Baterai (V)',
      'Level Baterai (%)',
      'Tegangan Solar (V)',
      'Status Solar',
      'Pompa (Relay)',
      'Mode Sistem'
    ];

    const rawHeaderRow = wsLog.addRow(rawHeaders);
    rawHeaderRow.height = 26;
    rawHeaderRow.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF107C41' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'medium', color: { argb: 'FF0D5A30' } }
      };
    });

    records.forEach((r, idx) => {
      const dataRow = wsLog.addRow([
        idx + 1,
        r.time,
        r.date,
        r.soilMoisture,
        r.airTemp,
        r.airHumidity,
        r.batteryVoltage,
        r.batteryPercent,
        r.solarVoltage,
        r.solarStatus,
        r.pumpStatus ? 'ON (MENYIRAM)' : 'OFF',
        r.mode
      ]);

      const isEven = idx % 2 === 0;
      dataRow.eachCell((cell, colNum) => {
        cell.font = { name: 'Segoe UI', size: 9 };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF9FCF9' }
        };

        // Highlight jika pompa ON
        if (colNum === 11 && r.pumpStatus) {
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: 'FFB33A00' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBD6' } };
        }
      });
    });

    wsLog.columns = [
      { width: 8 },  // No
      { width: 12 }, // Waktu
      { width: 14 }, // Tanggal
      { width: 22 }, // Soil %
      { width: 14 }, // Temp °C
      { width: 22 }, // Hum %
      { width: 20 }, // Bat V
      { width: 18 }, // Bat %
      { width: 20 }, // Solar V
      { width: 16 }, // Solar Status
      { width: 18 }, // Pompa
      { width: 14 }  // Mode
    ];

    return workbook;
  }

  // Menyimpan file Excel harian ke disk
  async saveTodayExcel(dateStr = this.currentDate) {
    if (this.todayBuffer.length === 0) return null;

    try {
      const filePath = this.getExcelPath(dateStr);
      const workbook = await this.generateWorkbook(dateStr, this.todayBuffer);
      await workbook.xlsx.writeFile(filePath);
      this.isDirty = false;
      this.lastSaveTime = Date.now();
      console.log(`[ExcelLogger] Successfully saved daily Excel: ${filePath} (${this.todayBuffer.length} records)`);
      return filePath;
    } catch (err) {
      console.error('[ExcelLogger] Failed saving Excel file:', err);
      return null;
    }
  }

  // Mengambil daftar semua file Excel harian yang tersedia di folder records
  getAvailableReports() {
    try {
      const files = fs.readdirSync(this.recordsDir)
        .filter(f => f.endsWith('.xlsx'))
        .map(file => {
          const stats = fs.statSync(path.join(this.recordsDir, file));
          const dateMatch = file.match(/hydro_telemetry_(\d{4}-\d{2}-\d{2})\.xlsx/);
          const date = dateMatch ? dateMatch[1] : null;
          return {
            filename: file,
            date: date,
            sizeBytes: stats.size,
            sizeFormatted: (stats.size / 1024).toFixed(1) + ' KB',
            lastModified: stats.mtime.toISOString(),
            isToday: date === this.currentDate
          };
        })
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

      return files;
    } catch (err) {
      console.error('[ExcelLogger] Error reading available reports:', err);
      return [];
    }
  }

  // Mengambil statistik live hari ini untuk dashboard
  getTodayStats() {
    return {
      date: this.currentDate,
      summary: this.computeSummary(this.todayBuffer),
      recordsCount: this.todayBuffer.length,
      lastSaved: new Date(this.lastSaveTime).toISOString()
    };
  }
}

module.exports = new TelemetryExcelLogger();
