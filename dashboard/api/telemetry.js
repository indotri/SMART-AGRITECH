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
    airHumDryLimit: 60.0,
    tempMaxLimit: 31.0
  },
  lastHardwarePing: null,
  history: []
};

function evaluateIrrigation(soilMoisture, airHumidity, airTemp, thresholds) {
  const {
    soilSafeLimit = 50,
    soilCriticalLimit = 35,
    airHumDryLimit = 60.0,
    tempMaxLimit = 31.0
  } = thresholds || {};

  let trigger = false;
  if (soilMoisture < soilSafeLimit) {
    if (soilMoisture < soilCriticalLimit) {
      trigger = true; // Kondisi 1: Tanah kritis kering
    } else if (airHumidity < airHumDryLimit) {
      trigger = true; // Kondisi 2: Udara kering
    } else if (airTemp !== undefined && tempMaxLimit !== undefined && airTemp >= tempMaxLimit) {
      trigger = true; // Kondisi 3: Suhu melampaui batas panas
    }
  }
  return trigger;
}

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
          state.telemetry.pumpStatus = evaluateIrrigation(
            state.telemetry.soilMoisture,
            state.telemetry.airHumidity,
            state.telemetry.airTemp,
            state.thresholds
          );
          state.pumpTarget = state.telemetry.pumpStatus;
        }
      } else if (body.action === 'update_thresholds') {
        if (body.thresholds) {
          const t = body.thresholds;
          if (t.soilSafeLimit !== undefined) state.thresholds.soilSafeLimit = Number(t.soilSafeLimit);
          if (t.soilCriticalLimit !== undefined) state.thresholds.soilCriticalLimit = Number(t.soilCriticalLimit);
          if (t.airHumDryLimit !== undefined) state.thresholds.airHumDryLimit = Number(t.airHumDryLimit);
          if (t.tempMaxLimit !== undefined) state.thresholds.tempMaxLimit = Number(t.tempMaxLimit);

          if (state.mode === 'auto') {
            state.telemetry.pumpStatus = evaluateIrrigation(
              state.telemetry.soilMoisture,
              state.telemetry.airHumidity,
              state.telemetry.airTemp,
              state.thresholds
            );
            state.pumpTarget = state.telemetry.pumpStatus;
          }
        }
      }

      return res.status(200).json({
        success: true,
        mode: state.mode,
        pumpTarget: state.pumpTarget,
        pumpStatus: state.telemetry.pumpStatus,
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

      let evaluatedPump = pump;
      if (state.mode === 'auto') {
        evaluatedPump = evaluateIrrigation(soil, hum, temp, state.thresholds);
        state.pumpTarget = evaluatedPump;
      } else {
        evaluatedPump = state.pumpTarget;
      }

      state.telemetry = {
        soilMoisture: soil,
        airTemp: temp,
        airHumidity: hum,
        pumpStatus: evaluatedPump,
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

      // Balas ke ESP32 dengan instruksi mode, target pompa, dan thresholds
      return res.status(200).json({
        success: true,
        mode: state.mode,
        pumpTarget: evaluatedPump,
        thresholds: state.thresholds
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
