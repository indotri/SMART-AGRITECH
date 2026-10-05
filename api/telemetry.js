// Vercel Serverless Function: /api/telemetry
// Bi-directional telemetry gateway for ESP32 and Web Dashboard

globalThis.__telemetryState = globalThis.__telemetryState || {
  telemetry: {
    soilMoisture: 45,
    airTemp: 28.5,
    airHumidity: 60.0,
    pumpStatus: false,
    batteryVoltage: 12.6,
    batteryPercent: 88,
    solarVoltage: 18.2,
    solarStatus: 'CHARGING',
    timestamp: new Date().toISOString()
  },
  mode: 'auto',
  pumpTarget: false,
  thresholds: {
    soilSafeLimit: 50,
    soilCriticalLimit: 35,
    airHumDryLimit: 60.0
  },
  lastHardwarePing: null,
  history: []
};

const MAX_HISTORY = 40;

module.exports = (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const state = globalThis.__telemetryState;

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    body = body || {};

    // 1. Kasus A: Kontrol dari Web Dashboard (Manual Pump, Mode, Thresholds)
    if (body.action) {
      if (body.action === 'set_pump') {
        state.mode = 'manual';
        state.pumpTarget = !!body.status;
        state.telemetry.pumpStatus = state.pumpTarget;
      } else if (body.action === 'set_mode') {
        state.mode = body.mode === 'manual' ? 'manual' : 'auto';
        if (state.mode === 'auto') {
          state.pumpTarget = false;
        }
      } else if (body.action === 'update_thresholds') {
        if (body.thresholds) {
          state.thresholds = { ...state.thresholds, ...body.thresholds };
        }
      }

      return res.status(200).json({
        success: true,
        mode: state.mode,
        pumpTarget: state.pumpTarget,
        thresholds: state.thresholds
      });
    }

    // 2. Kasus B: Data Telemetri Masuk dari ESP32
    if (body.soilMoisture !== undefined || body.airTemp !== undefined) {
      const now = new Date();
      state.lastHardwarePing = Date.now();

      const soil = Number(body.soilMoisture) || 0;
      const temp = Number(body.airTemp) || 0;
      const hum = Number(body.airHumidity) || 0;
      const pump = Boolean(body.pumpStatus);
      const batVolt = Number(body.batteryVoltage) || 12.6;
      const batPct = Number(body.batteryPercent) || 85;

      state.telemetry = {
        soilMoisture: soil,
        airTemp: temp,
        airHumidity: hum,
        pumpStatus: state.mode === 'manual' ? state.pumpTarget : pump,
        batteryVoltage: batVolt,
        batteryPercent: batPct,
        solarVoltage: 18.2,
        solarStatus: 'CHARGING',
        timestamp: now.toISOString()
      };

      // Tambahkan ke riwayat history grafik
      state.history.push({
        time: now.toLocaleTimeString(),
        ...state.telemetry
      });
      if (state.history.length > MAX_HISTORY) {
        state.history.shift();
      }

      // Balas ke ESP32 dengan instruksi mode dan target pompa
      return res.status(200).json({
        success: true,
        mode: state.mode,
        pumpTarget: state.pumpTarget
      });
    }

    return res.status(200).json({ success: true, message: 'No telemetry payload parsed' });
  }

  // GET request: Ambil status telemetri terbaru
  const isHardwareLive = state.lastHardwarePing && (Date.now() - state.lastHardwarePing < 20000);

  return res.status(200).json({
    success: true,
    isHardwareLive: !!isHardwareLive,
    lastHardwarePing: state.lastHardwarePing,
    mode: state.mode,
    pumpTarget: state.pumpTarget,
    thresholds: state.thresholds,
    telemetry: state.telemetry,
    history: state.history
  });
};
