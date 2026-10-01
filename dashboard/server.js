const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const excelLogger = require('./excelLogger');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// State Store
let state = {
  telemetry: {
    soilMoisture: 42,
    airTemp: 28.4,
    airHumidity: 58.2,
    pumpStatus: false,
    batteryVoltage: 12.6,
    batteryPercent: 88,
    solarVoltage: 18.2,
    solarStatus: 'CHARGING', // 'CHARGING' | 'DISCHARGING' | 'FLOAT'
    timestamp: new Date().toISOString()
  },
  mode: 'auto', // 'auto' | 'manual'
  thresholds: {
    soilSafeLimit: 50,       // >= 50%: Safe (Pump OFF)
    soilCriticalLimit: 35,   // < 35%: Critical (Pump ON)
    airHumDryLimit: 60.0     // < 60%: Dry air condition
  },
  simulationEnabled: true,
  lastHardwarePing: null
};

// Historical buffer for graphs (last 40 points)
let history = [];
const MAX_HISTORY = 40;

// Log buffer for terminal code-window
let logs = [];
const MAX_LOGS = 60;

function addLog(source, level, message) {
  const time = new Date().toTimeString().split(' ')[0];
  const entry = { id: Date.now() + Math.random(), time, source, level, message };
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs.shift();
  io.emit('log', entry);
}

// Initial seed data
const now = Date.now();
for (let i = MAX_HISTORY; i >= 0; i--) {
  const t = new Date(now - i * 3000).toLocaleTimeString();
  history.push({
    time: t,
    soilMoisture: 40 + Math.floor(Math.sin(i * 0.4) * 8),
    airTemp: +(28 + Math.cos(i * 0.3) * 1.5).toFixed(1),
    airHumidity: +(58 + Math.sin(i * 0.5) * 5).toFixed(1),
    pumpStatus: false,
    batteryVoltage: +(12.5 + Math.sin(i * 0.2) * 0.2).toFixed(2),
    batteryPercent: 85 + Math.floor(Math.sin(i * 0.2) * 8),
    solarVoltage: 18.1
  });
}

addLog('SYS', 'INFO', 'Hydroponic IoT Gateway initialized on port ' + PORT);
addLog('CORE', 'READY', 'Loaded control thresholds: Safe=50%, Critical=35%, AirDry=60%');
addLog('TELEMETRY', 'SIM', 'Virtual telemetry simulator active (standing by for ESP32 packets)');

// Logic evaluation function (identical to ESP32 main.cpp)
function evaluateIrrigation(soilMoisture, airHumidity) {
  if (state.mode === 'manual') return false;

  let trigger = false;
  if (soilMoisture < state.thresholds.soilSafeLimit) {
    if (soilMoisture < state.thresholds.soilCriticalLimit) {
      trigger = true;
    } else if (airHumidity < state.thresholds.airHumDryLimit) {
      trigger = true;
    }
  }
  return trigger;
}

// REST Endpoints for ESP32 & Web Clients
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    state,
    uptime: process.uptime(),
    clientsCount: io.engine.clientsCount
  });
});

app.get('/api/history', (req, res) => {
  res.json({ success: true, history });
});

app.get('/api/logs', (req, res) => {
  res.json({ success: true, logs });
});

// Excel Records & Daily Tracker Endpoints
app.get('/api/records', (req, res) => {
  res.json({
    success: true,
    today: excelLogger.getTodayStats(),
    reports: excelLogger.getAvailableReports()
  });
});

app.get('/api/records/export-today', async (req, res) => {
  try {
    await excelLogger.saveTodayExcel();
    const filePath = excelLogger.getExcelPath(excelLogger.currentDate);
    if (fs.existsSync(filePath)) {
      res.download(filePath, `hydro_telemetry_${excelLogger.currentDate}.xlsx`);
    } else {
      res.status(404).json({ error: 'Belum ada data rekaman untuk hari ini' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/records/download/:filename', (req, res) => {
  const safeFilename = path.basename(req.params.filename);
  const filePath = path.join(excelLogger.recordsDir, safeFilename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File laporan tidak ditemukan' });
  }
});

// ESP32 Telemetry Push Endpoint
app.post('/api/telemetry', (req, res) => {
  const { soilMoisture, airTemp, airHumidity, pumpStatus, batteryVoltage, batteryPercent } = req.body;

  if (soilMoisture === undefined || airTemp === undefined || airHumidity === undefined) {
    return res.status(400).json({ error: 'Missing required fields: soilMoisture, airTemp, airHumidity' });
  }

  state.lastHardwarePing = Date.now();
  state.simulationEnabled = false; // Disable simulator if real hardware pushes

  let evaluatedPump;
  if (state.mode === 'manual') {
    // In manual mode, Web state is the single source of truth!
    evaluatedPump = !!state.telemetry.pumpStatus;
  } else {
    evaluatedPump = evaluateIrrigation(soilMoisture, airHumidity);
  }

  const batVolt = batteryVoltage !== undefined ? Number(batteryVoltage) : state.telemetry.batteryVoltage;
  const batPct = batteryPercent !== undefined ? Number(batteryPercent) : state.telemetry.batteryPercent;
  const solarVolt = batPct >= 98 ? 13.8 : 18.2;
  const solarState = batVolt >= 13.6 ? 'FLOAT' : (batVolt < 11.2 ? 'CRITICAL' : 'CHARGING');

  state.telemetry = {
    soilMoisture: Number(soilMoisture),
    airTemp: Number(airTemp),
    airHumidity: Number(airHumidity),
    pumpStatus: evaluatedPump,
    batteryVoltage: batVolt,
    batteryPercent: batPct,
    solarVoltage: solarVolt,
    solarStatus: solarState,
    timestamp: new Date().toISOString()
  };

  const point = {
    time: new Date().toLocaleTimeString(),
    soilMoisture: state.telemetry.soilMoisture,
    airTemp: state.telemetry.airTemp,
    airHumidity: state.telemetry.airHumidity,
    pumpStatus: state.telemetry.pumpStatus,
    batteryVoltage: state.telemetry.batteryVoltage,
    batteryPercent: state.telemetry.batteryPercent,
    solarVoltage: state.telemetry.solarVoltage
  };
  history.push(point);
  if (history.length > MAX_HISTORY) history.shift();

  addLog('ESP32', evaluatedPump ? 'WARN' : 'INFO', 
    `Soil:${soilMoisture}% | RH:${airHumidity}% | Temp:${airTemp}°C | Bat:${batVolt}V (${batPct}%) | Relay:${evaluatedPump ? 'ON' : 'OFF'} [${state.mode.toUpperCase()}]`);

  io.emit('telemetry', state.telemetry);
  io.emit('history_point', point);

  // Catat rekaman telemetri ke logger harian Excel
  excelLogger.record(state.telemetry, state.mode);

  res.json({
    success: true,
    pumpTarget: evaluatedPump,
    mode: state.mode,
    thresholds: state.thresholds
  });
});

// Manual Pump Control Endpoint
app.post('/api/pump', (req, res) => {
  const { action, mode } = req.body;

  if (action === 'resume_auto' || mode === 'auto') {
    state.mode = 'auto';
    state.telemetry.pumpStatus = evaluateIrrigation(state.telemetry.soilMoisture, state.telemetry.airHumidity);
    addLog('USER', 'OK', 'Mode Otomatis dipulihkan (AUTONOMOUS loop aktif).');
  } else {
    if (mode) {
      state.mode = mode === 'auto' ? 'auto' : 'manual';
      addLog('USER', 'ACTION', `Switched mode to [${state.mode.toUpperCase()}]`);
    }

    if (action !== undefined) {
      const nextState = (action === 'on' || action === true);
      state.telemetry.pumpStatus = nextState;
      addLog('USER', nextState ? 'WARN' : 'INFO', `Manual override pump: ${nextState ? 'ENGAGED (HIGH)' : 'DISENGAGED (LOW)'}`);
    }
  }

  io.emit('state_update', {
    mode: state.mode,
    telemetry: state.telemetry
  });

  res.json({ success: true, mode: state.mode, pumpStatus: state.telemetry.pumpStatus });
});

// Dynamic Threshold Update Endpoint
app.post('/api/thresholds', (req, res) => {
  const { soilSafeLimit, soilCriticalLimit, airHumDryLimit } = req.body;
  if (soilSafeLimit !== undefined) state.thresholds.soilSafeLimit = Number(soilSafeLimit);
  if (soilCriticalLimit !== undefined) state.thresholds.soilCriticalLimit = Number(soilCriticalLimit);
  if (airHumDryLimit !== undefined) state.thresholds.airHumDryLimit = Number(airHumDryLimit);

  addLog('CONFIG', 'UPDATE', `Thresholds reconfigured: Safe=${state.thresholds.soilSafeLimit}% Crit=${state.thresholds.soilCriticalLimit}% AirDry=${state.thresholds.airHumDryLimit}%`);

  io.emit('thresholds_update', state.thresholds);
  res.json({ success: true, thresholds: state.thresholds });
});

// Toggle Simulator
app.post('/api/simulation', (req, res) => {
  state.simulationEnabled = !state.simulationEnabled;
  addLog('SYS', 'CONFIG', `Virtual Telemetry Simulator: ${state.simulationEnabled ? 'ENABLED' : 'DISABLED'}`);
  io.emit('sim_update', { enabled: state.simulationEnabled });
  res.json({ success: true, simulationEnabled: state.simulationEnabled });
});

// Socket.IO Handling
io.on('connection', (socket) => {
  socket.emit('init', {
    state,
    history,
    logs
  });

  socket.on('resume_auto', () => {
    state.mode = 'auto';
    state.telemetry.pumpStatus = evaluateIrrigation(state.telemetry.soilMoisture, state.telemetry.airHumidity);
    addLog('SOCKET', 'OK', 'Mode Otomatis dipulihkan via Web');
    io.emit('state_update', { mode: state.mode, telemetry: state.telemetry });
  });

  socket.on('set_pump', (data) => {
    state.mode = 'manual';
    state.telemetry.pumpStatus = !!data.status;
    addLog('SOCKET', data.status ? 'WARN' : 'INFO', `Socket request: Pump -> ${data.status ? 'ON' : 'OFF'} (Mode=MANUAL)`);
    io.emit('state_update', { mode: state.mode, telemetry: state.telemetry });
  });

  socket.on('set_mode', (mode) => {
    state.mode = mode === 'manual' ? 'manual' : 'auto';
    if (state.mode === 'auto') {
      state.telemetry.pumpStatus = evaluateIrrigation(state.telemetry.soilMoisture, state.telemetry.airHumidity);
    }
    addLog('SOCKET', 'ACTION', `Socket mode change -> ${state.mode.toUpperCase()}`);
    io.emit('state_update', { mode: state.mode, telemetry: state.telemetry });
  });

  socket.on('update_thresholds', (newThresholds) => {
    Object.assign(state.thresholds, newThresholds);
    addLog('SOCKET', 'CONFIG', `Thresholds updated via socket`);
    io.emit('thresholds_update', state.thresholds);
  });
});

// Simulation Engine (generates smooth natural variation when hardware is not streaming)
let simTick = 0;
setInterval(() => {
  if (!state.simulationEnabled) return;

  simTick++;
  // Subtle drift in soil moisture
  let currentSoil = state.telemetry.soilMoisture;
  if (state.telemetry.pumpStatus) {
    // Soil gets wet when pump is on
    currentSoil = Math.min(65, currentSoil + 3);
  } else {
    // Soil dries gradually
    currentSoil = Math.max(25, currentSoil - (simTick % 4 === 0 ? 1 : 0));
  }

  const currentTemp = +(27.5 + Math.sin(simTick * 0.1) * 1.8).toFixed(1);
  const currentHum = +(58.0 + Math.cos(simTick * 0.12) * 5.0).toFixed(1);

  const prevPump = state.telemetry.pumpStatus;
  let nextPump;
  if (state.mode === 'manual') {
    nextPump = state.telemetry.pumpStatus;
  } else {
    nextPump = evaluateIrrigation(currentSoil, currentHum);
  }

  // Solar & Battery dynamic simulation
  let currentBat = state.telemetry.batteryVoltage || 12.5;
  const solarCycle = Math.sin(simTick * 0.08);
  const isDaylight = solarCycle > -0.2;
  const simSolarVolt = isDaylight ? +(16.0 + solarCycle * 2.8).toFixed(1) : 0.0;

  if (nextPump) {
    // Pump active draws significant power
    currentBat = Math.max(10.8, +(currentBat - 0.04).toFixed(2));
  } else if (isDaylight) {
    // Sun is charging battery
    currentBat = Math.min(13.8, +(currentBat + 0.02).toFixed(2));
  } else {
    // Idle nighttime discharge
    currentBat = Math.max(11.2, +(currentBat - 0.005).toFixed(2));
  }

  const simBatPct = Math.min(100, Math.max(0, Math.round(((currentBat - 11.0) / (12.7 - 11.0)) * 100)));
  const simSolarStatus = isDaylight ? (currentBat >= 13.6 ? 'FLOAT' : 'CHARGING') : 'DISCHARGING';

  state.telemetry = {
    soilMoisture: currentSoil,
    airTemp: currentTemp,
    airHumidity: currentHum,
    pumpStatus: nextPump,
    batteryVoltage: currentBat,
    batteryPercent: simBatPct,
    solarVoltage: simSolarVolt,
    solarStatus: simSolarStatus,
    timestamp: new Date().toISOString()
  };

  if (nextPump !== prevPump) {
    addLog('LOGIC', nextPump ? 'WARN' : 'OK', 
      nextPump 
        ? `AUTOMATION: Soil dropped to ${currentSoil}% (below limit). PUMP TRIGGERED.` 
        : `AUTOMATION: Soil reached ${currentSoil}%. PUMP STOPPED.`);
  }

  const point = {
    time: new Date().toLocaleTimeString(),
    soilMoisture: state.telemetry.soilMoisture,
    airTemp: state.telemetry.airTemp,
    airHumidity: state.telemetry.airHumidity,
    pumpStatus: state.telemetry.pumpStatus,
    batteryVoltage: state.telemetry.batteryVoltage,
    batteryPercent: state.telemetry.batteryPercent,
    solarVoltage: state.telemetry.solarVoltage
  };

  history.push(point);
  if (history.length > MAX_HISTORY) history.shift();

  io.emit('telemetry', state.telemetry);
  io.emit('history_point', point);

  // Catat ke logger harian Excel saat simulasi aktif
  excelLogger.record(state.telemetry, state.mode);
}, 2500);

server.listen(PORT, () => {
  console.log(`[Phosphor Dashboard] Server running at http://localhost:${PORT}`);
});
