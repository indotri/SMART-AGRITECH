// Vercel Serverless Function: /api/records
globalThis.__telemetryState = globalThis.__telemetryState || {};

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const state = globalThis.__telemetryState || {};
  const history = state.history || [];
  const tel = state.telemetry || { soilMoisture: 45, airTemp: 28, airHumidity: 60, batteryVoltage: 12.6, batteryPercent: 88, pumpStatus: false };

  const todayStr = new Date().toISOString().split('T')[0];

  return res.status(200).json({
    success: true,
    today: {
      date: todayStr,
      recordsCount: Math.max(history.length, 1),
      summary: {
        soil: { avg: `${tel.soilMoisture}%`, min: tel.soilMoisture, max: tel.soilMoisture },
        temp: { avg: `${tel.airTemp}°C`, min: tel.airTemp, max: tel.airTemp },
        hum: { avg: `${tel.airHumidity}%`, min: tel.airHumidity, max: tel.airHumidity },
        batVolt: { avg: `${tel.batteryVoltage}V` },
        batPct: { avg: `${tel.batteryPercent}%` },
        pumpCycles: tel.pumpStatus ? 1 : 0
      }
    },
    reports: [
      {
        filename: `hydro_telemetry_${todayStr}.xlsx`,
        date: todayStr,
        sizeFormatted: '45.2 KB',
        isToday: true
      }
    ]
  });
};
