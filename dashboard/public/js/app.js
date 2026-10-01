// Frontend Application Logic
document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
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
  const gatewayStatusText = document.getElementById('gateway-status-text');

  let currentPumpStatus = false;
  let currentMode = 'auto';

  // Helper to render telemetry cards
  function updateTelemetryUI(data) {
    if (!data) return;

    // Soil Moisture
    const soil = Number(data.soilMoisture);
    elSoil.textContent = isNaN(soil) ? '--' : soil;
    barSoil.style.width = `${Math.min(100, Math.max(0, soil))}%`;

    if (soil < 35) {
      badgeSoil.textContent = 'CRITICAL DRY';
      badgeSoil.style.color = '#e54d2e';
      badgeSoil.style.borderColor = '#e54d2e';
      barSoil.style.backgroundColor = '#e54d2e';
    } else if (soil < 50) {
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
    if (hum < 60) {
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
    const isWarn = log.level === 'WARN' || log.level === 'CRIT';

    line.innerHTML = `
      <span class="term-time">[${log.time}]</span>
      <span class="term-tag ${isWarn ? 'warn' : ''}">[${log.source}::${log.level}]</span>
      <span class="term-msg">${log.message}</span>
    `;

    terminalStream.appendChild(line);
    // Keep max 80 elements in DOM
    while (terminalStream.children.length > 80) {
      terminalStream.removeChild(terminalStream.firstChild);
    }
    terminalStream.scrollTop = terminalStream.scrollHeight;
  }

  // Socket.IO Events
  socket.on('connect', () => {
    gatewayStatusText.textContent = 'SYSTEM LIVE';
    document.getElementById('gateway-status').classList.remove('outline');
    document.getElementById('gateway-status').classList.add('live-accent');
  });

  socket.on('disconnect', () => {
    gatewayStatusText.textContent = 'DISCONNECTED';
    document.getElementById('gateway-status').classList.add('outline');
    document.getElementById('gateway-status').classList.remove('live-accent');
  });

  socket.on('init', (payload) => {
    if (payload.state) {
      setModeUI(payload.state.mode);
      updateTelemetryUI(payload.state.telemetry);
      if (payload.state.thresholds) {
        inpSoilSafe.value = payload.state.thresholds.soilSafeLimit;
        inpSoilCrit.value = payload.state.thresholds.soilCriticalLimit;
        inpAirDry.value = payload.state.thresholds.airHumDryLimit;
      }
      if (payload.state.simulationEnabled !== undefined) {
        simStateText.textContent = payload.state.simulationEnabled ? 'ON' : 'OFF';
        simStateText.style.color = payload.state.simulationEnabled ? 'var(--color-lime-pulse)' : 'var(--color-sage-40)';
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
    inpSoilSafe.value = t.soilSafeLimit;
    inpSoilCrit.value = t.soilCriticalLimit;
    inpAirDry.value = t.airHumDryLimit;
  });

  socket.on('sim_update', (data) => {
    simStateText.textContent = data.enabled ? 'ON' : 'OFF';
    simStateText.style.color = data.enabled ? 'var(--color-lime-pulse)' : 'var(--color-sage-40)';
  });

  function triggerResumeAuto() {
    socket.emit('resume_auto');
    setModeUI('auto');
  }

  function triggerPumpToggle() {
    const next = !currentPumpStatus;
    socket.emit('set_pump', { status: next });
  }

  togglePumpBtn.addEventListener('click', triggerPumpToggle);
  quickPumpBtn.addEventListener('click', triggerPumpToggle);
  if (panelResumeAutoBtn) panelResumeAutoBtn.addEventListener('click', triggerResumeAuto);

  modeAutoBtn.addEventListener('click', () => {
    socket.emit('set_mode', 'auto');
  });
  modeManualBtn.addEventListener('click', () => socket.emit('set_mode', 'manual'));

  simToggleBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/simulation', { method: 'POST' });
      const data = await res.json();
    } catch (err) {
      console.error('Error toggling simulation:', err);
    }
  });

  formThresholds.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      soilSafeLimit: Number(inpSoilSafe.value),
      soilCriticalLimit: Number(inpSoilCrit.value),
      airHumDryLimit: Number(inpAirDry.value)
    };
    socket.emit('update_thresholds', payload);
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
      const res = await fetch('/api/records');
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

      // Render table rows
      if (recordsTableBody) {
        if (!reports || reports.length === 0) {
          recordsTableBody.innerHTML = `
            <tr>
              <td colspan="6" style="padding: 16px; text-align: center; color: var(--color-sage-40);">
                File hari ini sedang mencatat aktif. Klik "Unduh Excel Hari Ini" untuk menyimpan instan.
              </td>
            </tr>
          `;
        } else {
          recordsTableBody.innerHTML = reports.map(file => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.2s;">
              <td style="padding: 12px; color: var(--color-phosphor-white); font-weight: 500;">
                <span style="color: var(--color-lime-pulse);">📊</span> ${file.filename}
              </td>
              <td style="padding: 12px; color: var(--color-mint-frost);">
                ${file.date || '-'}
              </td>
              <td style="padding: 12px; color: var(--color-sage-60);">
                Ringkasan Rata-rata + Log Rinci
              </td>
              <td style="padding: 12px; color: var(--color-sage-60);">
                ${file.sizeFormatted}
              </td>
              <td style="padding: 12px;">
                ${file.isToday ? '<span class="badge" style="font-size: 10px; padding: 2px 6px; border-radius: 4px; border: 1px solid var(--color-circuit-border); color: var(--color-lime-pulse);">AKTIF HARI INI</span>' : '<span style="color: var(--color-sage-40);">ARSIP 24 JAM</span>'}
              </td>
              <td style="padding: 12px; text-align: right;">
                <a href="/api/records/download/${encodeURIComponent(file.filename)}" class="btn-ghost-outline" style="padding: 4px 10px; font-size: 11px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
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
      }
    } catch (err) {
      console.error('Error fetching excel records:', err);
    }
  }

  // Load records on start and refresh every 5 seconds
  loadExcelRecords();
  setInterval(loadExcelRecords, 5000);
});
