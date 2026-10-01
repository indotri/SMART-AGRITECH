// Frontend Application Logic & Hybrid Cloud Engine
document.addEventListener('DOMContentLoaded', () => {
  const chart = new PhosphorChart('telemetryCanvas');

  // DOM Elements
  const elSoil = document.getElementById('val-soil');
  const elHum = document.getElementById('val-humidity');
  const elTemp = document.getElementById('val-temp');

  const barSoil = document.getElementById('soil-bar');
  const barHum = document.getElementById('hum-bar');
  const barTemp = document.getElementById('temp-bar');

  const badgeSoil = document.getElementById('soil-badge');
  const badgeHum = document.getElementById('hum-badge');
  const badgeTemp = document.getElementById('temp-badge');

  const elBattery = document.getElementById('val-battery');
  const elBatteryVolt = document.getElementById('val-battery-volt');
  const elSolarVolt = document.getElementById('val-solar-volt');
  const barBattery = document.getElementById('battery-bar');
  const badgeBattery = document.getElementById('battery-badge');

  const pumpLed = document.getElementById('pump-led');
  const pumpText = document.getElementById('pump-text');
  const pumpSub = document.getElementById('pump-sub');
  const togglePumpBtn = document.getElementById('toggle-pump-action');
  const quickPumpBtn = document.getElementById('hero-quick-pump-btn');
  const panelResumeAutoBtn = document.getElementById('panel-resume-auto-btn');

  const modeAutoBtn = document.getElementById('mode-auto-btn');
  const modeManualBtn = document.getElementById('mode-manual-btn');

  const inpSoilSafe = document.getElementById('inp-soil-safe');
  const inpSoilCrit = document.getElementById('inp-soil-crit');
  const inpAirDry = document.getElementById('inp-air-dry');
  const formThresholds = document.getElementById('thresholds-form');

  const terminalStream = document.getElementById('terminal-stream');
  const simToggleBtn = document.getElementById('sim-toggle-btn');
  const simStateText = document.getElementById('sim-state-text');
  const gatewayStatus = document.getElementById('gateway-status');
  const gatewayStatusText = document.getElementById('gateway-status-text');
  const btnExportToday = document.getElementById('btn-export-today');

  // Local State Store
  let currentPumpStatus = false;
  let currentMode = 'auto';
  let thresholds = {
    soilSafeLimit: 50,
    soilCriticalLimit: 35,
    airHumDryLimit: 60.0
  };
  let currentTelemetry = {
    soilMoisture: 42,
    airTemp: 28.4,
    airHumidity: 58.2,
    pumpStatus: false,
    batteryVoltage: 12.6,
    batteryPercent: 88,
    solarVoltage: 18.2,
    solarStatus: 'CHARGING',
    timestamp: new Date().toISOString()
  };

  let isStandaloneDemo = false;
  let clientSimInterval = null;
  let simActive = true;
  let simStep = 0;

  // Helper to render telemetry cards
  function updateTelemetryUI(data) {
    if (!data) return;
    currentTelemetry = { ...currentTelemetry, ...data };

    // Soil Moisture
    const soil = Number(data.soilMoisture);
    elSoil.textContent = isNaN(soil) ? '--' : Math.round(soil);
    barSoil.style.width = `${Math.min(100, Math.max(0, soil))}%`;

    if (soil < thresholds.soilCriticalLimit) {
      badgeSoil.textContent = 'CRITICAL DRY';
      badgeSoil.style.color = '#e54d2e';
      badgeSoil.style.borderColor = '#e54d2e';
      barSoil.style.backgroundColor = '#e54d2e';
    } else if (soil < thresholds.soilSafeLimit) {
      badgeSoil.textContent = 'MODERATE DRY';
      badgeSoil.style.color = '#ffc53d';
      badgeSoil.style.borderColor = '#ffc53d';
      barSoil.style.backgroundColor = '#ffc53d';
    } else {
      badgeSoil.textContent = 'OPTIMAL';
      badgeSoil.style.color = 'var(--color-lime-pulse)';
      badgeSoil.style.borderColor = 'var(--color-circuit-border)';
      barSoil.style.backgroundColor = 'var(--color-lime-pulse)';
    }

    // Humidity
    const hum = Number(data.airHumidity);
    elHum.textContent = isNaN(hum) ? '--' : hum.toFixed(1);
    barHum.style.width = `${Math.min(100, Math.max(0, hum))}%`;
    if (hum < thresholds.airHumDryLimit) {
      badgeHum.textContent = 'LOW / DRY';
      badgeHum.style.color = '#ffc53d';
    } else {
      badgeHum.textContent = 'COMFORT';
      badgeHum.style.color = 'var(--color-moss-80)';
    }

    // Temperature
    const temp = Number(data.airTemp);
    elTemp.textContent = isNaN(temp) ? '--' : temp.toFixed(1);
    const tempNorm = Math.min(100, Math.max(0, (temp / 45) * 100));
    barTemp.style.width = `${tempNorm}%`;

    // Solar Battery & Accumulator
    const batPct = Number(data.batteryPercent);
    const batVolt = Number(data.batteryVoltage);
    const solarVolt = Number(data.solarVoltage);

    if (elBattery) elBattery.textContent = isNaN(batPct) ? '--' : Math.round(batPct);
    if (elBatteryVolt) elBatteryVolt.textContent = isNaN(batVolt) ? '--' : batVolt.toFixed(2);
    if (elSolarVolt) elSolarVolt.textContent = isNaN(solarVolt) ? '--' : solarVolt.toFixed(1);
    
    if (barBattery) {
      const pctClamped = Math.min(100, Math.max(0, isNaN(batPct) ? 0 : batPct));
      barBattery.style.width = `${pctClamped}%`;
      if (pctClamped < 20) {
        barBattery.style.backgroundColor = '#e54d2e';
        if (badgeBattery) {
          badgeBattery.textContent = 'CRITICAL (<20%)';
          badgeBattery.style.color = '#e54d2e';
        }
      } else if (pctClamped < 50) {
        barBattery.style.backgroundColor = '#ffc53d';
        if (badgeBattery) {
          badgeBattery.textContent = data.solarStatus || 'DISCHARGING';
          badgeBattery.style.color = '#ffc53d';
        }
      } else {
        barBattery.style.backgroundColor = 'var(--color-lime-pulse)';
        if (badgeBattery) {
          badgeBattery.textContent = data.solarStatus || 'CHARGING';
          badgeBattery.style.color = 'var(--color-lime-pulse)';
        }
      }
    }

    // Pump state
    setPumpUI(data.pumpStatus);
  }

  function setPumpUI(isActive) {
    currentPumpStatus = !!isActive;

    if (currentPumpStatus) {
      pumpLed.className = 'relay-led active';
      pumpText.textContent = 'PUMP ACTIVE (SPRAYING)';
      pumpText.style.color = 'var(--color-phosphor-white)';
      pumpSub.textContent = 'GPIO 2 (DIGITAL HIGH) — FLOWING WATER';
      togglePumpBtn.textContent = 'STOP PUMP';
      togglePumpBtn.style.borderColor = 'var(--color-lime-pulse)';
      togglePumpBtn.style.color = 'var(--color-lime-pulse)';
    } else {
      pumpLed.className = 'relay-led';
      pumpText.textContent = 'PUMP STANDBY';
      pumpText.style.color = 'var(--color-phosphor-white)';
      pumpSub.textContent = 'GPIO 2 (DIGITAL LOW)';
      togglePumpBtn.textContent = 'ENGAGE PUMP';
      togglePumpBtn.style.borderColor = 'var(--color-phosphor-white)';
      togglePumpBtn.style.color = 'var(--color-phosphor-white)';
    }
    if (panelResumeAutoBtn) panelResumeAutoBtn.style.display = (currentMode === 'manual') ? 'inline-flex' : 'none';
  }

  function setModeUI(mode) {
    currentMode = mode;
    if (mode === 'manual') {
      modeManualBtn.classList.add('active');
      modeAutoBtn.classList.remove('active');
      if (panelResumeAutoBtn) panelResumeAutoBtn.style.display = 'inline-flex';
    } else {
      modeAutoBtn.classList.add('active');
      modeManualBtn.classList.remove('active');
      if (panelResumeAutoBtn) panelResumeAutoBtn.style.display = 'none';
    }
  }

  function appendLogLine(log) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    const isWarn = log.level === 'WARN' || log.level === 'CRIT' || log.level === 'ALERT';

    line.innerHTML = `
      <span class="term-time">[${log.time}]</span>
      <span class="term-tag ${isWarn ? 'warn' : ''}">[${log.source}::${log.level}]</span>
      <span class="term-msg">${log.message}</span>
    `;

    terminalStream.appendChild(line);
    while (terminalStream.children.length > 80) {
      terminalStream.removeChild(terminalStream.firstChild);
    }
    terminalStream.scrollTop = terminalStream.scrollHeight;
  }

  // ==========================================
  // Hybrid Connection Setup (Local / Render / Vercel)
  // ==========================================
  const urlParams = new URLSearchParams(window.location.search);
  const customBackend = urlParams.get('backend') || localStorage.getItem('hidro_backend_url');
  const targetServer = customBackend || window.location.origin;

  let socket = null;
  let socketConnected = false;

  // Add Backend Switcher button to navigation bar
  const navActions = document.querySelector('.nav-actions');
  if (navActions) {
    const backendBtn = document.createElement('button');
    backendBtn.className = 'tag-pill outline';
    backendBtn.id = 'backend-url-btn';
    backendBtn.title = 'Sambungkan ke URL Server Backend (Render / VPS)';
    backendBtn.style.cursor = 'pointer';
    backendBtn.innerHTML = `SERVER: <span style="color:var(--color-lime-pulse)">${customBackend ? 'CLOUD' : 'AUTO'}</span>`;
    backendBtn.addEventListener('click', () => {
      const current = localStorage.getItem('hidro_backend_url') || '';
      const input = prompt(
        'Masukkan URL Backend Render (contoh: https://hidro-backend.onrender.com)\nAtau kosongkan untuk mode otomatis / simulasi lokal:',
        current
      );
      if (input !== null) {
        if (input.trim()) {
          let cleanUrl = input.trim();
          if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = 'https://' + cleanUrl;
          }
          localStorage.setItem('hidro_backend_url', cleanUrl);
        } else {
          localStorage.removeItem('hidro_backend_url');
        }
        window.location.reload();
      }
    });
    navActions.prepend(backendBtn);
  }

  try {
    if (typeof io !== 'undefined') {
      socket = io(targetServer, {
        timeout: 3000,
        reconnectionAttempts: 2
      });

      socket.on('connect', () => {
        socketConnected = true;
        isStandaloneDemo = false;
        if (clientSimInterval) clearInterval(clientSimInterval);

        gatewayStatusText.textContent = 'SYSTEM LIVE';
        gatewayStatus.classList.remove('outline');
        gatewayStatus.classList.add('live-accent');
        appendLogLine({
          time: new Date().toTimeString().split(' ')[0],
          source: 'WS',
          level: 'CONNECTED',
          message: `Connected to active IoT gateway on ${targetServer}`
        });
      });

      socket.on('disconnect', () => {
        socketConnected = false;
        gatewayStatusText.textContent = 'DISCONNECTED';
        gatewayStatus.classList.add('outline');
        gatewayStatus.classList.remove('live-accent');
      });

      socket.on('init', (payload) => {
        if (payload.state) {
          if (payload.state.thresholds) {
            thresholds = payload.state.thresholds;
            inpSoilSafe.value = thresholds.soilSafeLimit;
            inpSoilCrit.value = thresholds.soilCriticalLimit;
            inpAirDry.value = thresholds.airHumDryLimit;
          }
          setModeUI(payload.state.mode);
          updateTelemetryUI(payload.state.telemetry);
          if (payload.state.simulationEnabled !== undefined) {
            simActive = payload.state.simulationEnabled;
            simStateText.textContent = simActive ? 'ON' : 'OFF';
            simStateText.style.color = simActive ? 'var(--color-lime-pulse)' : 'var(--color-sage-40)';
          }
        }

        if (payload.history) {
          chart.setData(payload.history);
        }

        if (payload.logs) {
          terminalStream.innerHTML = '';
          payload.logs.forEach(appendLogLine);
        }
      });

      socket.on('telemetry', (telemetry) => {
        updateTelemetryUI(telemetry);
      });

      socket.on('history_point', (point) => {
        chart.addPoint(point);
      });

      socket.on('state_update', (data) => {
        if (data.mode) setModeUI(data.mode);
        if (data.telemetry) updateTelemetryUI(data.telemetry);
      });

      socket.on('log', (logEntry) => {
        appendLogLine(logEntry);
      });

      socket.on('thresholds_update', (t) => {
        thresholds = t;
        inpSoilSafe.value = t.soilSafeLimit;
        inpSoilCrit.value = t.soilCriticalLimit;
        inpAirDry.value = t.airHumDryLimit;
      });

      socket.on('sim_update', (data) => {
        simActive = data.enabled;
        simStateText.textContent = data.enabled ? 'ON' : 'OFF';
        simStateText.style.color = data.enabled ? 'var(--color-lime-pulse)' : 'var(--color-sage-40)';
      });
    }
  } catch (err) {
    console.warn('Socket.IO connection attempt failed:', err);
  }

  // ==========================================
  // Client-Side Standalone Simulation Engine (For Vercel)
  // ==========================================
  function startClientSimulator() {
    if (socketConnected || isStandaloneDemo) return;
    isStandaloneDemo = true;

    gatewayStatusText.textContent = 'VERCEL LIVE (CLIENT SIM)';
    gatewayStatus.classList.remove('outline');
    gatewayStatus.classList.add('live-accent');

    // Populate initial inputs
    inpSoilSafe.value = thresholds.soilSafeLimit;
    inpSoilCrit.value = thresholds.soilCriticalLimit;
    inpAirDry.value = thresholds.airHumDryLimit;

    // Seed 40 historical points for the chart
    const initialHistory = [];
    const now = Date.now();
    for (let i = 40; i >= 0; i--) {
      const t = new Date(now - i * 3000).toLocaleTimeString();
      initialHistory.push({
        time: t,
        soilMoisture: 42 + Math.floor(Math.sin(i * 0.4) * 8),
        airTemp: +(28 + Math.cos(i * 0.3) * 1.5).toFixed(1),
        airHumidity: +(58 + Math.sin(i * 0.5) * 5).toFixed(1),
        pumpStatus: false,
        batteryVoltage: +(12.5 + Math.sin(i * 0.2) * 0.2).toFixed(2),
        batteryPercent: 86 + Math.floor(Math.sin(i * 0.2) * 6),
        solarVoltage: 18.2
      });
    }
    chart.setData(initialHistory);

    // Initial logs
    appendLogLine({
      time: new Date().toTimeString().split(' ')[0],
      source: 'SYS',
      level: 'INFO',
      message: 'Vercel static cloud detected. Client-Side Telemetry Simulator online.'
    });
    appendLogLine({
      time: new Date().toTimeString().split(' ')[0],
      source: 'CORE',
      level: 'READY',
      message: `Thresholds loaded: Safe=${thresholds.soilSafeLimit}%, Crit=${thresholds.soilCriticalLimit}%, AirDry=${thresholds.airHumDryLimit}%`
    });

    updateTelemetryUI(currentTelemetry);

    // Run simulation loop every 2.5 seconds
    clientSimInterval = setInterval(() => {
      if (!simActive) return;
      simStep++;

      let soil = currentTelemetry.soilMoisture;
      let temp = +(28.2 + Math.sin(simStep * 0.2) * 1.6 + (Math.random() * 0.3 - 0.15)).toFixed(1);
      let hum = +(58.5 + Math.cos(simStep * 0.15) * 4.5 + (Math.random() * 0.4 - 0.2)).toFixed(1);
      let batVolt = +(12.55 + Math.sin(simStep * 0.1) * 0.15).toFixed(2);
      let batPct = Math.round(85 + Math.sin(simStep * 0.1) * 8);
      let solarVolt = +(18.1 + Math.sin(simStep * 0.3) * 0.4).toFixed(1);

      // Hydration physics
      if (currentPumpStatus) {
        soil = Math.min(80, +(soil + 3.0 + Math.random() * 1.5).toFixed(1));
      } else {
        soil = Math.max(22, +(soil - (0.4 + Math.random() * 0.3)).toFixed(1));
      }

      // Autonomous irrigation evaluation
      if (currentMode === 'auto') {
        if (soil < thresholds.soilSafeLimit) {
          if (soil < thresholds.soilCriticalLimit && !currentPumpStatus) {
            setPumpUI(true);
            appendLogLine({
              time: new Date().toTimeString().split(' ')[0],
              source: 'AUTO',
              level: 'ALERT',
              message: `Kelembapan tanah kritis (${soil}% < ${thresholds.soilCriticalLimit}%). Pompa otomatis AKTIF!`
            });
          } else if (hum < thresholds.airHumDryLimit && !currentPumpStatus) {
            setPumpUI(true);
            appendLogLine({
              time: new Date().toTimeString().split(' ')[0],
              source: 'AUTO',
              level: 'WARN',
              message: `Udara kering (${hum}% RH). Pompa otomatis AKTIF!`
            });
          }
        } else if (soil >= thresholds.soilSafeLimit && currentPumpStatus) {
          setPumpUI(false);
          appendLogLine({
            time: new Date().toTimeString().split(' ')[0],
            source: 'AUTO',
            level: 'INFO',
            message: `Kelembapan tanah optimal (${soil}% >= ${thresholds.soilSafeLimit}%). Pompa STANDBY.`
          });
        }
      }

      currentTelemetry = {
        soilMoisture: soil,
        airTemp: temp,
        airHumidity: hum,
        pumpStatus: currentPumpStatus,
        batteryVoltage: batVolt,
        batteryPercent: batPct,
        solarVoltage: solarVolt,
        solarStatus: 'CHARGING',
        timestamp: new Date().toISOString()
      };

      updateTelemetryUI(currentTelemetry);

      const timeStr = new Date().toLocaleTimeString();
      chart.addPoint({
        time: timeStr,
        ...currentTelemetry
      });

      // Occasional heartbeat log
      if (simStep % 6 === 0) {
        appendLogLine({
          time: new Date().toTimeString().split(' ')[0],
          source: 'TELEMETRY',
          level: 'STREAM',
          message: `Soil: ${soil}%, Air: ${temp}°C, Hum: ${hum}% RH, Pump: ${currentPumpStatus ? 'ON' : 'OFF'}`
        });
      }
    }, 2500);
  }

  // If Socket.IO hasn't connected after 1.8 seconds, activate Client Simulator
  setTimeout(() => {
    if (!socketConnected) {
      startClientSimulator();
    }
  }, 1800);

  // ==========================================
  // User Actions (Pump, Mode, Thresholds)
  // ==========================================
  function triggerResumeAuto() {
    if (socketConnected && socket) {
      socket.emit('resume_auto');
    }
    setModeUI('auto');
    appendLogLine({
      time: new Date().toTimeString().split(' ')[0],
      source: 'CONTROL',
      level: 'MODE',
      message: 'Mode otomatis diaktifkan kembali.'
    });
  }

  function triggerPumpToggle() {
    const next = !currentPumpStatus;
    if (socketConnected && socket) {
      socket.emit('set_pump', { status: next });
    } else {
      setModeUI('manual');
      setPumpUI(next);
      appendLogLine({
        time: new Date().toTimeString().split(' ')[0],
        source: 'MANUAL',
        level: next ? 'START' : 'STOP',
        message: `Override Pompa: ${next ? 'DIAKTIFKAN (MENYIRAM)' : 'DIMATIKAN (STANDBY)'}.`
      });
    }
  }

  togglePumpBtn.addEventListener('click', triggerPumpToggle);
  quickPumpBtn.addEventListener('click', triggerPumpToggle);
  if (panelResumeAutoBtn) panelResumeAutoBtn.addEventListener('click', triggerResumeAuto);

  modeAutoBtn.addEventListener('click', () => {
    if (socketConnected && socket) {
      socket.emit('set_mode', 'auto');
    } else {
      setModeUI('auto');
      appendLogLine({
        time: new Date().toTimeString().split(' ')[0],
        source: 'CONTROL',
        level: 'MODE',
        message: 'Beralih ke mode kontrol Autonomous.'
      });
    }
  });

  modeManualBtn.addEventListener('click', () => {
    if (socketConnected && socket) {
      socket.emit('set_mode', 'manual');
    } else {
      setModeUI('manual');
      appendLogLine({
        time: new Date().toTimeString().split(' ')[0],
        source: 'CONTROL',
        level: 'MODE',
        message: 'Beralih ke mode kontrol Manual Override.'
      });
    }
  });

  simToggleBtn.addEventListener('click', async () => {
    if (socketConnected) {
      try {
        await fetch(`${targetServer}/api/simulation`, { method: 'POST' });
      } catch (err) {
        console.error('Error toggling server simulation:', err);
      }
    } else {
      simActive = !simActive;
      simStateText.textContent = simActive ? 'ON' : 'OFF';
      simStateText.style.color = simActive ? 'var(--color-lime-pulse)' : 'var(--color-sage-40)';
      appendLogLine({
        time: new Date().toTimeString().split(' ')[0],
        source: 'SIM',
        level: 'TOGGLE',
        message: `Virtual telemetry simulator ${simActive ? 'diaktifkan' : 'dijeda'}.`
      });
    }
  });

  formThresholds.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      soilSafeLimit: Number(inpSoilSafe.value),
      soilCriticalLimit: Number(inpSoilCrit.value),
      airHumDryLimit: Number(inpAirDry.value)
    };
    thresholds = payload;

    if (socketConnected && socket) {
      socket.emit('update_thresholds', payload);
    } else {
      appendLogLine({
        time: new Date().toTimeString().split(' ')[0],
        source: 'CONFIG',
        level: 'SAVED',
        message: `Ambang batas disimpan: Safe=${payload.soilSafeLimit}%, Crit=${payload.soilCriticalLimit}%, DryAir=${payload.airHumDryLimit}%.`
      });
    }
  });

  // ==========================================
  // Daily Track Record & Excel Export Handler
  // ==========================================
  const recSoilAvg = document.getElementById('rec-soil-avg');
  const recSoilMin = document.getElementById('rec-soil-min');
  const recSoilMax = document.getElementById('rec-soil-max');

  const recTempAvg = document.getElementById('rec-temp-avg');
  const recTempMin = document.getElementById('rec-temp-min');
  const recTempMax = document.getElementById('rec-temp-max');

  const recHumAvg = document.getElementById('rec-hum-avg');
  const recHumMin = document.getElementById('rec-hum-min');
  const recHumMax = document.getElementById('rec-hum-max');

  const recBatAvg = document.getElementById('rec-bat-avg');
  const recBatPct = document.getElementById('rec-bat-pct');
  const recPumpCycles = document.getElementById('rec-pump-cycles');
  const recSamplesCount = document.getElementById('rec-samples-count');
  const recordsTableBody = document.getElementById('records-table-body');
  const recSyncStatus = document.getElementById('rec-sync-status');

  async function loadExcelRecords() {
    try {
      const res = await fetch(`${targetServer}/api/records`);
      if (!res.ok) throw new Error('Endpoint not available');
      const data = await res.json();
      if (!data.success) return;

      const { today, reports } = data;
      const s = today.summary;

      if (recSoilAvg) recSoilAvg.textContent = s.soil.avg;
      if (recSoilMin) recSoilMin.textContent = `${s.soil.min}%`;
      if (recSoilMax) recSoilMax.textContent = `${s.soil.max}%`;

      if (recTempAvg) recTempAvg.textContent = s.temp.avg;
      if (recTempMin) recTempMin.textContent = `${s.temp.min}°C`;
      if (recTempMax) recTempMax.textContent = `${s.temp.max}°C`;

      if (recHumAvg) recHumAvg.textContent = s.hum.avg;
      if (recHumMin) recHumMin.textContent = `${s.hum.min}%`;
      if (recHumMax) recHumMax.textContent = `${s.hum.max}%`;

      if (recBatAvg) recBatAvg.textContent = s.batVolt.avg;
      if (recBatPct) recBatPct.textContent = s.batPct.avg;
      if (recPumpCycles) recPumpCycles.textContent = `${s.pumpCycles}x`;
      if (recSamplesCount) recSamplesCount.textContent = today.recordsCount;

      if (recSyncStatus) {
        recSyncStatus.textContent = `Sinkron: ${new Date().toLocaleTimeString()} (${today.recordsCount} data tercatat)`;
      }

      if (recordsTableBody && reports && reports.length > 0) {
        recordsTableBody.innerHTML = reports.map(file => `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.2s;">
            <td style="padding: 12px; color: var(--color-phosphor-white); font-weight: 500;">
              <span style="color: var(--color-lime-pulse);">📊</span> ${file.filename}
            </td>
            <td style="padding: 12px; color: var(--color-mint-frost);">${file.date || '-'}</td>
            <td style="padding: 12px; color: var(--color-sage-60);">Ringkasan Rata-rata + Log Rinci</td>
            <td style="padding: 12px; color: var(--color-sage-60);">${file.sizeFormatted}</td>
            <td style="padding: 12px;">
              ${file.isToday ? '<span class="badge" style="font-size: 10px; padding: 2px 6px; border-radius: 4px; border: 1px solid var(--color-circuit-border); color: var(--color-lime-pulse);">AKTIF HARI INI</span>' : '<span style="color: var(--color-sage-40);">ARSIP 24 JAM</span>'}
            </td>
            <td style="padding: 12px; text-align: right;">
              <a href="${targetServer}/api/records/download/${encodeURIComponent(file.filename)}" class="btn-ghost-outline" style="padding: 4px 10px; font-size: 11px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Unduh .xlsx
              </a>
            </td>
          </tr>
        `).join('');
      }
    } catch (err) {
      // Fallback display for Vercel Static Demo
      if (recSoilAvg && (!recSoilAvg.textContent || recSoilAvg.textContent === '--')) {
        recSoilAvg.textContent = '44.8%';
        if (recSoilMin) recSoilMin.textContent = '32%';
        if (recSoilMax) recSoilMax.textContent = '58%';
        if (recTempAvg) recTempAvg.textContent = '28.6°C';
        if (recTempMin) recTempMin.textContent = '26.8°C';
        if (recTempMax) recTempMax.textContent = '30.5°C';
        if (recHumAvg) recHumAvg.textContent = '59.2%';
        if (recHumMin) recHumMin.textContent = '52%';
        if (recHumMax) recHumMax.textContent = '67%';
        if (recBatAvg) recBatAvg.textContent = '12.6V';
        if (recBatPct) recBatPct.textContent = '88%';
        if (recPumpCycles) recPumpCycles.textContent = '6x';
        if (recSamplesCount) recSamplesCount.textContent = '480';
        if (recSyncStatus) recSyncStatus.textContent = 'Mode Demo Vercel: Data Rekap Realtime Virtual';

        if (recordsTableBody) {
          const todayDate = new Date().toISOString().split('T')[0];
          recordsTableBody.innerHTML = `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
              <td style="padding: 12px; color: var(--color-phosphor-white);"><span style="color: var(--color-lime-pulse);">📊</span> hydro_telemetry_${todayDate}.xlsx</td>
              <td style="padding: 12px; color: var(--color-mint-frost);">${todayDate}</td>
              <td style="padding: 12px; color: var(--color-sage-60);">Ringkasan Rata-rata + Log Rinci</td>
              <td style="padding: 12px; color: var(--color-sage-60);">42.5 KB</td>
              <td style="padding: 12px;"><span class="badge" style="font-size: 10px; padding: 2px 6px; border-radius: 4px; border: 1px solid var(--color-circuit-border); color: var(--color-lime-pulse);">DEMO AKTIF</span></td>
              <td style="padding: 12px; text-align: right;">
                <button id="btn-demo-download" class="btn-ghost-outline" style="padding: 4px 10px; font-size: 11px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                  Unduh .csv
                </button>
              </td>
            </tr>
          `;
          const demoBtn = document.getElementById('btn-demo-download');
          if (demoBtn) demoBtn.addEventListener('click', downloadClientCsvReport);
        }
      }
    }
  }

  // Client-side CSV generator for Vercel demo
  function downloadClientCsvReport(e) {
    if (e) e.preventDefault();
    const headers = 'Waktu,KelembapanTanah,Suhu,KelembapanUdara,PompaStatus,BateraiVolt,BateraiPersen,PanelSuryaVolt\n';
    let rows = '';
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const d = new Date(now - i * 60000).toISOString();
      const s = (40 + Math.sin(i) * 6).toFixed(1);
      const t = (28 + Math.cos(i) * 1.2).toFixed(1);
      const h = (58 + Math.sin(i * 0.8) * 4).toFixed(1);
      rows += `${d},${s}%,${t}C,${h}%,${i % 7 === 0 ? 'ON' : 'OFF'},12.6V,88%,18.2V\n`;
    }
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hydro_telemetry_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (btnExportToday) {
    btnExportToday.addEventListener('click', (e) => {
      if (isStandaloneDemo) {
        e.preventDefault();
        downloadClientCsvReport();
      }
    });
  }

  loadExcelRecords();
  setInterval(loadExcelRecords, 8000);

  // Mobile Bottom Navigation active state tracking
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
  if (mobileNavItems.length > 0) {
    mobileNavItems.forEach(item => {
      item.addEventListener('click', () => {
        mobileNavItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });

    const sectionIds = ['overview', 'telemetry', 'actuators', 'chart-section', 'records-section', 'terminal-section'];
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
    window.addEventListener('scroll', () => {
      let currentSection = '';
      const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
      sections.forEach(sec => {
        const top = sec.offsetTop - 120;
        const height = sec.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentSection = sec.getAttribute('id');
        }
      });
      if (currentSection) {
        mobileNavItems.forEach(item => {
          if (item.getAttribute('href') === `#${currentSection}`) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    }, { passive: true });
  }
});
