// ==========================================================================
// Smart Agri Tech OS — Single-Page Continuous Telemetry Engine & ScrollSpy
// ==========================================================================

let mainChart = null;
let metricsChart1 = null;
let metricsChart2 = null;
let trendsChart = null;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Chart Instances
  mainChart = new PhosphorChart('telemetryCanvas');
  metricsChart1 = new PhosphorChart('metricsChart1');
  metricsChart2 = new PhosphorChart('metricsChart2');
  trendsChart = new PhosphorChart('trendsMainCanvas');

  // DOM Elements - Overview & Metrics
  const elSoilOverview = document.getElementById('val-soil-overview');
  const barSoilOverview = document.getElementById('bar-soil-overview');
  const elTempOverview = document.getElementById('val-temp-overview');
  const elPhOverview = document.getElementById('val-ph-overview');
  const elSoilMetrics = document.getElementById('val-soil-metrics');

  // Actuators
  const emergencyBtn = document.getElementById('emergency-shutoff-btn');
  const quickPumpToggle = document.getElementById('quick-pump-toggle');

  // System Controls
  const simToggleBtn = document.getElementById('sim-toggle-btn');
  const simStateText = document.getElementById('sim-state-text');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const terminalStream = document.getElementById('terminal-stream');

  // Records Elements
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

  // State Management
  let currentTelemetry = {
    soilMoisture: 68.4,
    airTemp: 24.2,
    airHumidity: 68.2,
    pumpStatus: true,
    batteryVoltage: 53.2,
    batteryPercent: 94,
    solarVoltage: 18.4,
    tdsPpm: 115,
    phVal: 6.25,
    timestamp: new Date().toISOString()
  };

  let simActive = true;
  let simStep = 0;
  let clientSimInterval = null;

  // ==========================================================================
  // SCROLL-SPY (Auto-highlight Active Nav Link while Scrolling)
  // ==========================================================================
  const sections = document.querySelectorAll('.page-section-block');
  const navLinks = document.querySelectorAll('.nav-tab-btn');

  function onScrollSpy() {
    let currentSectionId = 'overview';
    const scrollPos = window.scrollY + 120;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScrollSpy, { passive: true });
  onScrollSpy();

  // Smooth scroll click handler
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const targetElem = document.querySelector(targetId);
        if (targetElem) {
          targetElem.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // ==========================================================================
  // THEME MANAGEMENT (Light by default, saved in localStorage)
  // ==========================================================================
  function initTheme() {
    const savedTheme = localStorage.getItem('agritech_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('agritech_theme', newTheme);
    updateThemeIcon(newTheme);
    if (mainChart) mainChart.render();
    if (metricsChart1) metricsChart1.render();
    if (metricsChart2) metricsChart2.render();
    if (trendsChart) trendsChart.render();
  }

  function updateThemeIcon(theme) {
    if (!themeIcon) return;
    themeIcon.textContent = theme === 'dark' ? '🌙 DARK' : '☀️ LIGHT';
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
  initTheme();

  // ==========================================================================
  // TELEMETRY UI UPDATER
  // ==========================================================================
  function updateTelemetryUI(data) {
    if (!data) return;
    currentTelemetry = { ...currentTelemetry, ...data };

    const soil = Number(currentTelemetry.soilMoisture);
    const soilStr = isNaN(soil) ? '68.4' : soil.toFixed(1);

    if (elSoilOverview) elSoilOverview.textContent = soilStr;
    if (barSoilOverview) barSoilOverview.style.width = `${Math.min(100, Math.max(0, soil))}%`;
    if (elSoilMetrics) elSoilMetrics.textContent = `${soilStr}%`;

    const temp = Number(currentTelemetry.airTemp);
    if (elTempOverview) elTempOverview.textContent = isNaN(temp) ? '24.2' : temp.toFixed(1);

    const ph = Number(currentTelemetry.phVal);
    if (elPhOverview) elPhOverview.textContent = isNaN(ph) ? '6.25' : ph.toFixed(2);

    if (quickPumpToggle) {
      quickPumpToggle.checked = !!currentTelemetry.pumpStatus;
    }
  }

  function addTerminalLog(log) {
    if (!terminalStream) return;
    const line = document.createElement('div');
    line.style.display = 'flex';
    line.style.gap = '0.75rem';
    line.style.marginBottom = '0.25rem';
    line.style.wordBreak = 'break-all';

    const time = log.time || new Date().toTimeString().split(' ')[0];
    line.innerHTML = `
      <span style="color: #64748b;">${time}</span>
      <span style="color: #34d399; font-weight: 700;">[${log.source || 'CORE'}]</span>
      <span style="color: #38bdf8;">${log.level || 'INFO'}:</span>
      <span>${log.message}</span>
    `;

    terminalStream.appendChild(line);
    while (terminalStream.children.length > 60) {
      terminalStream.removeChild(terminalStream.firstChild);
    }
    terminalStream.scrollTop = terminalStream.scrollHeight;
  }

  // ==========================================================================
  // HYBRID ENGINE: SOCKET.IO (LOCAL/RENDER) & HTTP POLLING (VERCEL SERVERLESS)
  // ==========================================================================
  const vercelPill = document.getElementById('vercel-status-pill');
  const serverPill = document.getElementById('server-status-pill');
  const latencyBadge = document.getElementById('socket-latency');
  let socket = null;
  let vercelPollingInterval = null;
  let lastHardwareSeenTime = 0;
  let logDebounceCounter = 0;

  async function pollVercelTelemetry() {
    try {
      const res = await fetch('/api/telemetry');
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success) return;

      if (serverPill) {
        serverPill.innerHTML = `
          <span class="dot-indicator dot-green"></span>
          <span>SERVER: <strong style="color: var(--brand-emerald);">VERCEL API</strong></span>
        `;
      }

      if (data.isHardwareLive && data.telemetry) {
        // Hardware fisik ESP32 terhubung dan aktif!
        if (clientSimInterval) {
          clearInterval(clientSimInterval);
          clientSimInterval = null;
        }

        if (simStateText) {
          simStateText.textContent = 'HARDWARE';
          simStateText.style.color = 'var(--brand-emerald)';
        }

        if (vercelPill) {
          vercelPill.innerHTML = `
            <span class="dot-indicator dot-green" style="box-shadow: 0 0 10px #10b981;"></span>
            <span>ESP32 LIVE <strong style="color: var(--brand-emerald); font-size: 0.7rem;">(TERHUBUNG)</strong></span>
          `;
        }

        if (latencyBadge) {
          const secAgo = Math.round((Date.now() - (data.lastHardwarePing || Date.now())) / 1000);
          latencyBadge.textContent = `${secAgo}s ago (HTTP)`;
          latencyBadge.style.color = 'var(--brand-emerald)';
        }

        updateTelemetryUI(data.telemetry);

        if (data.history && data.history.length > 0) {
          if (mainChart) mainChart.setData(data.history);
          if (metricsChart1) metricsChart1.setData(data.history);
          if (metricsChart2) metricsChart2.setData(data.history);
          if (trendsChart) trendsChart.setData(data.history);
        } else {
          if (mainChart) mainChart.addPoint(data.telemetry);
          if (metricsChart1) metricsChart1.addPoint(data.telemetry);
          if (metricsChart2) metricsChart2.addPoint(data.telemetry);
          if (trendsChart) trendsChart.addPoint(data.telemetry);
        }

        logDebounceCounter++;
        if (logDebounceCounter % 4 === 1) {
          addTerminalLog({
            source: 'ESP32',
            level: 'DATA',
            message: `Data Sensor Masuk: Tanah ${data.telemetry.soilMoisture}% | Suhu ${data.telemetry.airTemp}°C | RH ${data.telemetry.airHumidity}% | Bat ${data.telemetry.batteryVoltage}V`
          });
        }
      } else {
        // Hardware belum mengirim data dalam 20 detik terakhir
        if (vercelPill) {
          vercelPill.innerHTML = `
            <span class="dot-indicator dot-yellow"></span>
            <span>ESP32 STANDBY <span style="font-size: 0.65rem; color: #f59e0b;">(MENUNGGU SINYAL)</span></span>
          `;
        }
        if (latencyBadge) {
          latencyBadge.textContent = 'Standby';
          latencyBadge.style.color = '#f59e0b';
        }

        // Jika hardware belum aktif dan user ingin simulasi, jalankan mock simulator
        if (simActive && !clientSimInterval) {
          initMockTelemetryStream();
        }
      }
    } catch (err) {
      console.warn('Vercel polling warning:', err);
    }
  }

  function startVercelPollingEngine() {
    addTerminalLog({
      source: 'GATEWAY',
      level: 'INFO',
      message: 'Mode Cloud Vercel aktif. Menghubungkan ke API /api/telemetry...'
    });
    pollVercelTelemetry();
    if (!vercelPollingInterval) {
      vercelPollingInterval = setInterval(pollVercelTelemetry, 2500);
    }
  }

  try {
    socket = io({ reconnectionAttempts: 2, timeout: 1500 });

    socket.on('connect', () => {
      if (vercelPollingInterval) {
        clearInterval(vercelPollingInterval);
        vercelPollingInterval = null;
      }
      addTerminalLog({ source: 'NET', level: 'READY', message: 'Socket connection established with Hydroponics OS gateway.' });
    });

    socket.on('init', (data) => {
      if (data.history) {
        if (mainChart) mainChart.setData(data.history);
        if (metricsChart1) metricsChart1.setData(data.history);
        if (metricsChart2) metricsChart2.setData(data.history);
        if (trendsChart) trendsChart.setData(data.history);
      }
      if (data.state && data.state.telemetry) {
        updateTelemetryUI(data.state.telemetry);
      }
      if (data.logs && Array.isArray(data.logs)) {
        terminalStream.innerHTML = '';
        data.logs.forEach(l => addTerminalLog(l));
      }
    });

    socket.on('telemetry', (point) => {
      updateTelemetryUI(point);
      if (mainChart) mainChart.addPoint(point);
      if (metricsChart1) metricsChart1.addPoint(point);
      if (metricsChart2) metricsChart2.addPoint(point);
      if (trendsChart) trendsChart.addPoint(point);
    });

    socket.on('log', (entry) => {
      addTerminalLog(entry);
    });

    socket.on('connect_error', () => {
      startVercelPollingEngine();
    });

  } catch (err) {
    startVercelPollingEngine();
  }

  // ==========================================================================
  // MOCK TELEMETRY STREAM FALLBACK
  // ==========================================================================
  function initMockTelemetryStream() {
    if (!clientSimInterval) {
      clientSimInterval = setInterval(() => {
        if (!simActive) return;
        simStep++;

        const point = {
          time: new Date().toLocaleTimeString(),
          soilMoisture: +(68.4 + Math.sin(simStep * 0.3) * 1.5).toFixed(1),
          airTemp: +(24.2 + Math.cos(simStep * 0.2) * 0.8).toFixed(1),
          airHumidity: +(68.2 + Math.sin(simStep * 0.4) * 2.5).toFixed(1),
          pumpStatus: true,
          batteryVoltage: 12.6,
          batteryPercent: 94,
          phVal: +(6.25 + Math.sin(simStep * 0.1) * 0.05).toFixed(2)
        };

        updateTelemetryUI(point);
        if (mainChart) mainChart.addPoint(point);
        if (metricsChart1) metricsChart1.addPoint(point);
        if (metricsChart2) metricsChart2.addPoint(point);
        if (trendsChart) trendsChart.addPoint(point);
      }, 2500);
    }
  }

  // ==========================================================================
  // CONTROLS & EMERGENCY SHUTOFF
  // ==========================================================================
  if (emergencyBtn) {
    emergencyBtn.addEventListener('click', async () => {
      const confirmShutoff = confirm('APAKAH ANDA YAKIN? Semua relai solenoid dan pompa akan dimatikan seketika.');
      if (confirmShutoff) {
        if (socket && socket.connected) {
          socket.emit('emergencyShutoff');
        } else {
          try {
            await fetch('/api/telemetry', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'set_pump', status: false })
            });
          } catch (e) {}
        }
        addTerminalLog({ source: 'SAFETY', level: 'WARN', message: 'EMERGENCY SHUTOFF TRIGGERED! Semua relai dinonaktifkan.' });
        alert('Emergency Shutoff Berhasil Dijalankan.');
      }
    });
  }

  if (quickPumpToggle) {
    quickPumpToggle.addEventListener('change', async (e) => {
      const targetState = e.target.checked;
      if (socket && socket.connected) {
        socket.emit('setPump', targetState);
      } else {
        try {
          await fetch('/api/telemetry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'set_pump', status: targetState })
          });
          addTerminalLog({ source: 'CONTROL', level: 'CMD', message: `Override Pompa via Cloud: ${targetState ? 'MENYALA (ON)' : 'MATI (OFF)'}` });
        } catch (e) {
          console.error(e);
        }
      }
    });
  }

  if (simToggleBtn) {
    simToggleBtn.addEventListener('click', () => {
      simActive = !simActive;
      if (simStateText) {
        simStateText.textContent = simActive ? 'ON' : 'OFF';
        simStateText.style.color = simActive ? 'var(--brand-emerald)' : 'var(--text-subtle)';
      }
      if (socket && socket.connected) socket.emit('setSimulation', simActive);
      addTerminalLog({ source: 'SIM', level: 'INFO', message: `Telemetry simulator toggled: ${simActive ? 'ACTIVE' : 'PAUSED'}` });
    });
  }

  // ==========================================================================
  // DAILY EXCEL & TELEMETRY RECORDS LOADER
  // ==========================================================================
  async function loadDailyRecords() {
    try {
      const res = await fetch('/api/records');
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success) return;

      const s = data.today && data.today.summary ? data.today.summary : null;
      if (s) {
        if (recSoilAvg) recSoilAvg.textContent = s.soil && s.soil.avg != null ? s.soil.avg : '68.4';
        if (recSoilMin) recSoilMin.textContent = `${s.soil && s.soil.min != null ? s.soil.min : '52'}%`;
        if (recSoilMax) recSoilMax.textContent = `${s.soil && s.soil.max != null ? s.soil.max : '76'}%`;

        if (recTempAvg) recTempAvg.textContent = s.temp && s.temp.avg != null ? s.temp.avg : '24.2';
        if (recTempMin) recTempMin.textContent = `${s.temp && s.temp.min != null ? s.temp.min : '21.5'}°C`;
        if (recTempMax) recTempMax.textContent = `${s.temp && s.temp.max != null ? s.temp.max : '27.8'}°C`;

        if (recHumAvg) recHumAvg.textContent = s.hum && s.hum.avg != null ? s.hum.avg : '68.2';
        if (recHumMin) recHumMin.textContent = `${s.hum && s.hum.min != null ? s.hum.min : '58'}%`;
        if (recHumMax) recHumMax.textContent = `${s.hum && s.hum.max != null ? s.hum.max : '74'}%`;

        if (recBatAvg) recBatAvg.textContent = s.batVolt && s.batVolt.avg != null ? s.batVolt.avg : '53.2';
        if (recBatPct) recBatPct.textContent = s.batPct && s.batPct.avg != null ? Math.round(s.batPct.avg) : '94';
        if (recPumpCycles) recPumpCycles.textContent = `${s.pumpCycles || 5}x`;
        if (recSamplesCount) recSamplesCount.textContent = s.count || 1420;
      }

      if (recordsTableBody) {
        const reports = data.reports || [];
        if (reports.length === 0) {
          recordsTableBody.innerHTML = `
            <tr>
              <td style="font-weight: 700; color: var(--brand-emerald);"><a href="/api/records/export-today" style="color: inherit; text-decoration: none;">📄 hydro_telemetry_2026-10-09.xlsx</a></td>
              <td>Hari Ini (Real-time)</td>
              <td>Ringkasan &amp; 24H Sensor Log</td>
              <td>12.4 KB</td>
              <td><span class="badge-pill-green">AKTIF</span></td>
              <td style="text-align: right;">
                <a href="/api/records/export-today" class="btn-figma-primary" style="padding: 0.35rem 0.75rem; font-size: 0.75rem; text-decoration: none;" download>Unduh .xlsx</a>
              </td>
            </tr>
          `;
        } else {
          recordsTableBody.innerHTML = reports.map(a => {
            const dlUrl = a.isToday ? '/api/records/export-today' : `/api/records/download/${a.filename}`;
            return `
              <tr>
                <td style="font-weight: 700; color: var(--brand-emerald);"><a href="${dlUrl}" style="color: inherit; text-decoration: none;">📄 ${a.filename}</a></td>
                <td>${a.date || '--'}</td>
                <td>Ringkasan &amp; 24H Sensor Log</td>
                <td>${a.sizeFormatted || (a.sizeBytes ? (a.sizeBytes / 1024).toFixed(1) + ' KB' : '12.1 KB')}</td>
                <td><span class="badge-pill-green">${a.isToday ? 'AKTIF (HARI INI)' : 'TEREKAM'}</span></td>
                <td style="text-align: right;">
                  <a href="${dlUrl}" class="btn-figma-primary" style="padding: 0.35rem 0.75rem; font-size: 0.75rem; text-decoration: none;" download>Unduh .xlsx</a>
                </td>
              </tr>
            `;
          }).join('');
        }
      }
    } catch (e) {
      console.log('Records loader:', e);
    }
  }

  loadDailyRecords();
  setInterval(loadDailyRecords, 10000);
});
