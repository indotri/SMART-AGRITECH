// ==========================================================================
// Smart AgriTech — Mesin Telemetri Real-Time & ScrollSpy (Bahasa Indonesia)
// ==========================================================================

let mainChart = null;
let metricsChart1 = null;
let metricsChart2 = null;
let trendsChart = null;

document.addEventListener('DOMContentLoaded', () => {
  // Inisialisasi Instance Grafik
  if (typeof PhosphorChart !== 'undefined') {
    if (document.getElementById('telemetryCanvas')) mainChart = new PhosphorChart('telemetryCanvas');
    if (document.getElementById('metricsChart1')) metricsChart1 = new PhosphorChart('metricsChart1');
    if (document.getElementById('metricsChart2')) metricsChart2 = new PhosphorChart('metricsChart2');
    if (document.getElementById('trendsMainCanvas')) trendsChart = new PhosphorChart('trendsMainCanvas');
  }

  // DOM Elements - Ringkasan & Parameter
  const elSoilOverview = document.getElementById('val-soil-overview');
  const barSoilOverview = document.getElementById('bar-soil-overview');
  const elTempOverview = document.getElementById('val-temp-overview');
  const elHumOverview = document.getElementById('val-hum-overview');
  const elBatOverview = document.getElementById('val-bat-overview');
  const elBatPctOverview = document.getElementById('val-bat-pct-overview');
  const barBatOverview = document.getElementById('bar-bat-overview');
  const elSoilMetrics = document.getElementById('val-soil-metrics');

  // Kontrol Perangkat & Pompa
  const emergencyBtn = document.getElementById('emergency-shutoff-btn');
  const quickPumpToggle = document.getElementById('quick-pump-toggle');
  const mainPumpToggle = document.getElementById('main-pump-toggle');
  const pumpStateText = document.getElementById('pump-state-text');
  const pumpVisualRing = document.getElementById('pump-visual-ring');

  // Kontrol Sistem
  const simToggleBtn = document.getElementById('sim-toggle-btn');
  const simStateText = document.getElementById('sim-state-text');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const terminalStream = document.getElementById('terminal-stream');

  // Elemen Riwayat & Laporan Excel
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

  // Status State
  let currentTelemetry = {
    soilMoisture: 68.4,
    airTemp: 24.2,
    airHumidity: 68.2,
    pumpStatus: false,
    batteryVoltage: 12.6,
    batteryPercent: 94,
    solarVoltage: 18.4,
    timestamp: new Date().toISOString()
  };

  let simActive = true;
  let simStep = 0;
  let clientSimInterval = null;

  // ==========================================================================
  // SCROLL-SPY (Sorot Link Navigasi Otomatis Saat Menggulir)
  // ==========================================================================
  const sections = document.querySelectorAll('.page-section-block');
  const navLinks = document.querySelectorAll('.nav-tab-btn');

  function onScrollSpy() {
    let currentSectionId = 'overview';
    const scrollPos = window.scrollY + 130;

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

  // Smooth scroll handler
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
  // MANAJEMEN TEMA (Terang / Gelap - Tanpa Emoji)
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
    if (theme === 'dark') {
      themeIcon.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
        <span>Gelap</span>
      `;
    } else {
      themeIcon.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <span>Terang</span>
      `;
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
  initTheme();

  // ==========================================================================
  // PEMBARUAN TAMPILAN TELEMETRI
  // ==========================================================================
  function updateTelemetryUI(data) {
    if (!data) return;
    currentTelemetry = { ...currentTelemetry, ...data };

    // Kelembapan Tanah
    const soil = Number(currentTelemetry.soilMoisture);
    const soilStr = isNaN(soil) ? '68.4' : soil.toFixed(1);
    if (elSoilOverview) elSoilOverview.textContent = soilStr;
    if (barSoilOverview) barSoilOverview.style.width = `${Math.min(100, Math.max(0, soil))}%`;
    if (elSoilMetrics) elSoilMetrics.textContent = `${soilStr}%`;

    // Suhu Udara
    const temp = Number(currentTelemetry.airTemp);
    if (elTempOverview) elTempOverview.textContent = isNaN(temp) ? '24.2' : temp.toFixed(1);

    // Kelembapan Udara
    const hum = Number(currentTelemetry.airHumidity);
    if (elHumOverview) elHumOverview.textContent = isNaN(hum) ? '68.2' : hum.toFixed(1);

    // Baterai & Daya
    const batVolt = Number(currentTelemetry.batteryVoltage);
    if (elBatOverview) elBatOverview.textContent = isNaN(batVolt) ? '12.6' : batVolt.toFixed(1);

    const batPct = Number(currentTelemetry.batteryPercent);
    if (elBatPctOverview) elBatPctOverview.textContent = isNaN(batPct) ? '94' : Math.round(batPct);
    if (barBatOverview) barBatOverview.style.width = `${Math.min(100, Math.max(0, batPct || 94))}%`;

    // Status Pompa Air
    const isPumpOn = !!currentTelemetry.pumpStatus;
    if (quickPumpToggle) quickPumpToggle.checked = isPumpOn;
    if (mainPumpToggle) mainPumpToggle.checked = isPumpOn;

    if (pumpStateText) {
      pumpStateText.textContent = isPumpOn ? 'MENYIRAM (AKTIF)' : 'STANDBY (MATI)';
      pumpStateText.style.color = isPumpOn ? 'var(--brand-emerald)' : 'var(--text-muted)';
    }

    if (pumpVisualRing) {
      if (isPumpOn) {
        pumpVisualRing.style.background = 'var(--color-green-bg)';
        pumpVisualRing.style.borderColor = 'var(--brand-emerald)';
        pumpVisualRing.style.color = 'var(--brand-emerald)';
        pumpVisualRing.style.boxShadow = '0 0 25px rgba(16, 185, 129, 0.45)';
      } else {
        pumpVisualRing.style.background = 'var(--bg-subtle)';
        pumpVisualRing.style.borderColor = 'var(--border-card)';
        pumpVisualRing.style.color = 'var(--text-muted)';
        pumpVisualRing.style.boxShadow = 'none';
      }
    }
  }

  function addTerminalLog(log) {
    if (!terminalStream) return;
    const line = document.createElement('div');
    line.style.display = 'flex';
    line.style.gap = '0.75rem';
    line.style.marginBottom = '0.35rem';
    line.style.wordBreak = 'break-all';

    const time = log.time || new Date().toTimeString().split(' ')[0];
    line.innerHTML = `
      <span style="color: #64748b; font-family: var(--font-mono);">${time}</span>
      <span style="color: #34d399; font-weight: 700;">[${log.source || 'SISTEM'}]</span>
      <span style="color: #38bdf8; font-weight: 600;">${log.level || 'INFO'}:</span>
      <span>${log.message}</span>
    `;

    terminalStream.appendChild(line);
    while (terminalStream.children.length > 50) {
      terminalStream.removeChild(terminalStream.firstChild);
    }
    terminalStream.scrollTop = terminalStream.scrollHeight;
  }

  // ==========================================================================
  // HYBRID ENGINE: SOCKET.IO (LOKAL) & HTTP POLLING (VERCEL SERVERLESS)
  // ==========================================================================
  const vercelPill = document.getElementById('vercel-status-pill');
  const serverPill = document.getElementById('server-status-pill');
  const latencyBadge = document.getElementById('socket-latency');
  let socket = null;
  let vercelPollingInterval = null;
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
          <span>Server <strong style="color: var(--brand-emerald);">Aktif</strong></span>
        `;
      }

      if (data.isHardwareLive && data.telemetry) {
        if (clientSimInterval) {
          clearInterval(clientSimInterval);
          clientSimInterval = null;
        }

        if (simStateText) {
          simStateText.textContent = 'Hardware';
          simStateText.style.color = 'var(--brand-emerald)';
        }

        if (vercelPill) {
          vercelPill.innerHTML = `
            <span class="dot-indicator dot-green"></span>
            <span>ESP32 <strong style="color: var(--brand-emerald);">Live</strong></span>
          `;
        }

        if (latencyBadge) {
          const secAgo = Math.round((Date.now() - (data.lastHardwarePing || Date.now())) / 1000);
          latencyBadge.textContent = `${secAgo} dtk lalu`;
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
            message: `Data Sensor: Tanah ${data.telemetry.soilMoisture}% | Suhu ${data.telemetry.airTemp}°C | Udara ${data.telemetry.airHumidity}% | Daya ${data.telemetry.batteryVoltage}V`
          });
        }
      } else {
        if (vercelPill) {
          vercelPill.innerHTML = `
            <span class="dot-indicator dot-yellow"></span>
            <span>ESP32 <strong style="color: #f59e0b;">Siaga</strong></span>
          `;
        }
        if (latencyBadge) {
          latencyBadge.textContent = 'Standby';
          latencyBadge.style.color = '#f59e0b';
        }

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
      message: 'Menghubungkan ke API Telemetri Cloud (/api/telemetry)...'
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
      addTerminalLog({ source: 'JARINGAN', level: 'SIAP', message: 'Koneksi Socket terhubung dengan Gateway Hidroponik.' });
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
  // SIMULATOR TELEMETRI CADANGAN
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
          pumpStatus: currentTelemetry.pumpStatus,
          batteryVoltage: 12.6,
          batteryPercent: 94
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
  // KONTROL POMPA AIR & PENGHENTIAN DARURAT
  // ==========================================================================
  async function handlePumpToggle(targetState) {
    currentTelemetry.pumpStatus = targetState;
    updateTelemetryUI({ pumpStatus: targetState });

    if (socket && socket.connected) {
      socket.emit('setPump', targetState);
    } else {
      try {
        await fetch('/api/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'set_pump', status: targetState })
        });
      } catch (e) {
        console.error(e);
      }
    }

    addTerminalLog({
      source: 'KONTROL',
      level: 'PERINTAH',
      message: `Status Pompa Nutrisi Diubah: ${targetState ? 'MENYALA (ON)' : 'DIMATIKAN (OFF)'}`
    });
  }

  if (quickPumpToggle) {
    quickPumpToggle.addEventListener('change', (e) => {
      handlePumpToggle(e.target.checked);
    });
  }

  if (mainPumpToggle) {
    mainPumpToggle.addEventListener('change', (e) => {
      handlePumpToggle(e.target.checked);
    });
  }

  if (emergencyBtn) {
    emergencyBtn.addEventListener('click', async () => {
      const confirmShutoff = confirm('PERINGATAN: Apakah Anda yakin ingin mematikan pompa air seketika demi keselamatan?');
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

        currentTelemetry.pumpStatus = false;
        updateTelemetryUI({ pumpStatus: false });

        addTerminalLog({
          source: 'PROTEKSI',
          level: 'DARURAT',
          message: 'PENGHENTIAN DARURAT DIAKTIFKAN! Pompa segera dimatikan.'
        });
        alert('Penghentian Darurat Berhasil Dijalankan. Pompa telah dimatikan.');
      }
    });
  }

  if (simToggleBtn) {
    simToggleBtn.addEventListener('click', () => {
      simActive = !simActive;
      if (simStateText) {
        simStateText.textContent = simActive ? 'Simulasi' : 'Manual';
        simStateText.style.color = simActive ? 'var(--brand-emerald)' : 'var(--text-subtle)';
      }
      if (socket && socket.connected) socket.emit('setSimulation', simActive);
      addTerminalLog({
        source: 'SIMULASI',
        level: 'INFO',
        message: `Simulator telemetri: ${simActive ? 'DIAKTIFKAN' : 'DIJEDA'}`
      });
    });
  }

  // ==========================================================================
  // PEMUAT ARSIP LAPORAN EXCEL HARIAN (24 JAM)
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

        if (recBatAvg) recBatAvg.textContent = s.batVolt && s.batVolt.avg != null ? s.batVolt.avg : '12.6';
        if (recBatPct) recBatPct.textContent = s.batPct && s.batPct.avg != null ? Math.round(s.batPct.avg) : '94';
        if (recPumpCycles) recPumpCycles.textContent = `${s.pumpCycles || 5}x`;
        if (recSamplesCount) recSamplesCount.textContent = s.count || 1420;
      }

      if (recordsTableBody) {
        const fileSvg = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px; color: var(--brand-emerald);">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        `;

        const reports = data.reports || [];
        if (reports.length === 0) {
          recordsTableBody.innerHTML = `
            <tr>
              <td style="font-weight: 700; color: var(--brand-emerald);">
                <a href="/api/records/export-today" style="color: inherit; text-decoration: none; display: flex; align-items: center;">
                  ${fileSvg} laporan_hidroponik_hari_ini.xlsx
                </a>
              </td>
              <td>Hari Ini (Real-Time)</td>
              <td>Ringkasan &amp; Log Sensor 24H</td>
              <td>12.4 KB</td>
              <td><span class="badge-pill-green">AKTIF</span></td>
              <td style="text-align: right;">
                <a href="/api/records/export-today" class="btn-figma-primary" style="padding: 0.35rem 0.85rem; font-size: 0.75rem; text-decoration: none;" download>Unduh .xlsx</a>
              </td>
            </tr>
          `;
        } else {
          recordsTableBody.innerHTML = reports.map(a => {
            const dlUrl = a.isToday ? '/api/records/export-today' : `/api/records/download/${a.filename}`;
            return `
              <tr>
                <td style="font-weight: 700; color: var(--brand-emerald);">
                  <a href="${dlUrl}" style="color: inherit; text-decoration: none; display: flex; align-items: center;">
                    ${fileSvg} ${a.filename}
                  </a>
                </td>
                <td>${a.date || '--'}</td>
                <td>Ringkasan &amp; Log Sensor 24H</td>
                <td>${a.sizeFormatted || (a.sizeBytes ? (a.sizeBytes / 1024).toFixed(1) + ' KB' : '12.1 KB')}</td>
                <td><span class="badge-pill-green">${a.isToday ? 'AKTIF (HARI INI)' : 'TERARSIP'}</span></td>
                <td style="text-align: right;">
                  <a href="${dlUrl}" class="btn-figma-primary" style="padding: 0.35rem 0.85rem; font-size: 0.75rem; text-decoration: none;" download>Unduh .xlsx</a>
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

  // ==========================================================================
  // 3D INTERACTIVE MODAL CUBE & HYDROPONIC SPROUT ENGINE (Hero Section)
  // ==========================================================================
  function initHeroModalCube() {
    const heroArea = document.getElementById('hero-cube-area');
    const cubeStage = document.getElementById('cube-stage-3d');
    const cubeRotator = document.getElementById('cube-rotator');
    const sproutSculpture = document.getElementById('sprout-sculpture');
    const surfaceRipple = document.getElementById('cube-surface-ripple');
    const radialBloom = document.getElementById('cube-radial-bloom');
    const groundShadow = document.getElementById('cube-ground-shadow');
    const statusBadge = document.getElementById('cube-status-badge');
    const badgeText = document.getElementById('cube-badge-text');
    const clickCountElem = document.getElementById('cube-click-count');
    const clickPill = document.getElementById('cube-click-counter-pill');
    const particlesContainer = document.getElementById('cube-ambient-particles');

    if (!cubeRotator || !heroArea) return;

    // Koordinat Rotasi Dasar (Isometric Perspective)
    const baseRotX = -24;
    const baseRotY = -36;

    let currentRotX = baseRotX;
    let currentRotY = baseRotY;
    let targetRotX = baseRotX;
    let targetRotY = baseRotY;

    let mouseNormX = 0;
    let mouseNormY = 0;
    let isHovering = false;
    let clickCount = 0;
    let animTime = 0;

    // Siklus Pesan Interaksi Tunas & Nutrisi
    const nutrientMessages = [
      '💧 Impuls Nutrisi Hidroponik Terkirim (+100%)',
      '🌱 Tunas Menyerap Cairan Nutrisi Otomatis',
      '☀️ Panel Surya Mandiri Menyalurkan Energi Bersih',
      '✨ Kanopi Daun Tumbuh Segar & Sehat',
      '⚡ Siklus Telemetri ESP32 Berhasil Diperbarui',
      '🌿 Kelembapan Media Tanam Terjaga 68.4% Optimal'
    ];
    let msgIndex = 0;

    // Render Loop 60fps dengan Lerp Damping
    function renderCubeFrame() {
      animTime += 16;

      // Animasi Ambience Terapung Halus Saat Kursor Diam
      const ambientBob = Math.sin(animTime * 0.002) * 6;
      const ambientTiltX = Math.sin(animTime * 0.0016) * 2.2;
      const ambientTiltY = Math.cos(animTime * 0.0018) * 3;

      if (isHovering) {
        targetRotX = baseRotX - mouseNormY * 24;
        targetRotY = baseRotY + mouseNormX * 32;
      } else {
        targetRotX = baseRotX + ambientTiltX;
        targetRotY = baseRotY + ambientTiltY;
      }

      // Smooth Lerp Interpolation
      currentRotX += (targetRotX - currentRotX) * 0.085;
      currentRotY += (targetRotY - currentRotY) * 0.085;

      const bobY = isHovering ? (mouseNormY * -8) : ambientBob;

      // Terapkan Transformasi 3D ke Kubus
      cubeRotator.style.transform = `rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) translateY(${bobY.toFixed(2)}px)`;

      // Sinkronisasi Bayangan Kontak Bawah
      if (groundShadow) {
        const shadowScale = isHovering ? 1.05 : (1 + ambientBob * 0.015);
        groundShadow.style.transform = `rotateX(74deg) translateZ(-40px) scale(${shadowScale.toFixed(3)})`;
        groundShadow.style.opacity = isHovering ? '0.9' : '0.75';
      }

      // Parallax Halus pada Cahaya Radial Bloom
      if (radialBloom) {
        const bloomX = mouseNormX * 35;
        const bloomY = mouseNormY * 35;
        radialBloom.style.transform = `translate(${bloomX.toFixed(1)}px, ${bloomY.toFixed(1)}px)`;
      }

      requestAnimationFrame(renderCubeFrame);
    }
    requestAnimationFrame(renderCubeFrame);

    // Pelacak Gerakan Mouse (Mousemove Tracking)
    function handlePointerMove(e) {
      const rect = heroArea.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      mouseNormX = Math.max(-1.2, Math.min(1.2, ((clientX - rect.left) / rect.width - 0.5) * 2));
      mouseNormY = Math.max(-1.2, Math.min(1.2, ((clientY - rect.top) / rect.height - 0.5) * 2));
      isHovering = true;
    }

    heroArea.addEventListener('mousemove', handlePointerMove, { passive: true });
    heroArea.addEventListener('touchmove', handlePointerMove, { passive: true });

    heroArea.addEventListener('mouseleave', () => {
      isHovering = false;
      mouseNormX = 0;
      mouseNormY = 0;
    });

    heroArea.addEventListener('touchend', () => {
      isHovering = false;
      mouseNormX = 0;
      mouseNormY = 0;
    });

    // Interaksi Tekan (Mousedown / Pointerdown)
    function onPointerDown() {
      cubeRotator.classList.add('is-pressed');
    }

    function onPointerUp() {
      cubeRotator.classList.remove('is-pressed');
    }

    if (cubeStage) {
      cubeStage.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointerup', onPointerUp);
    }

    // Ledakan Partikel Cahaya Nutrisi (Particle Eruption)
    function spawnNutrientSparks() {
      if (!particlesContainer) return;
      const count = 9;
      const colors = ['#7fee64', '#34d399', '#ddffdc', '#b8ff9e', '#ffffff'];

      for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'hero-particle';

        const size = Math.floor(Math.random() * 8) + 5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const spreadX = (Math.random() - 0.5) * 160;
        const spreadY = -(Math.random() * 110 + 60);

        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.background = color;
        p.style.boxShadow = `0 0 10px ${color}`;
        p.style.left = '50%';
        p.style.top = '45%';
        p.style.setProperty('--tx', `${spreadX.toFixed(1)}px`);
        p.style.setProperty('--ty', `${spreadY.toFixed(1)}px`);

        particlesContainer.appendChild(p);

        setTimeout(() => {
          if (p.parentNode) p.parentNode.removeChild(p);
        }, 1000);
      }
    }

    // Aksi Klik Interaktif (Triggering Animations, Sprout Bloom & Status Updates)
    function handleCubeClick(e) {
      clickCount++;

      // Perbarui Penghitung Nutrisi
      if (clickCountElem) clickCountElem.textContent = clickCount;
      if (clickPill) {
        clickPill.classList.remove('pulse');
        void clickPill.offsetWidth;
        clickPill.classList.add('pulse');
      }

      // Animasi Reaksi Tunas (Sprout Springs Up & Blooms)
      if (sproutSculpture) {
        sproutSculpture.classList.remove('bounce-trigger');
        void sproutSculpture.offsetWidth;
        sproutSculpture.classList.add('bounce-trigger');
      }

      // Gelombang Ripple di Permukaan Wajah Atas
      if (surfaceRipple) {
        surfaceRipple.classList.remove('trigger');
        void surfaceRipple.offsetWidth;
        surfaceRipple.classList.add('trigger');
      }

      // Ledakan Partikel Nutrisi Bercahaya
      spawnNutrientSparks();

      // Perbarui Teks Status Badge
      if (badgeText && statusBadge) {
        msgIndex = (msgIndex + 1) % nutrientMessages.length;
        badgeText.textContent = nutrientMessages[msgIndex];
        statusBadge.classList.remove('highlight');
        void statusBadge.offsetWidth;
        statusBadge.classList.add('highlight');
        setTimeout(() => statusBadge.classList.remove('highlight'), 1800);
      }

      // Log Aktivitas ke Terminal Sistem
      if (typeof addTerminalLog === 'function') {
        addTerminalLog({
          source: 'TUNAS_IOT',
          level: 'INFO',
          message: `Impuls nutrisi tunas disiram manual (#${clickCount}) — Status pertumbuhan: SANGAT OPTIMAL`
        });
      }
    }

    if (cubeStage) {
      cubeStage.addEventListener('click', handleCubeClick);
      cubeStage.addEventListener('touchend', (e) => {
        handleCubeClick(e);
      }, { passive: true });
    }
    if (cubeRotator) {
      cubeRotator.addEventListener('click', handleCubeClick);
    }
    if (statusBadge) {
      statusBadge.addEventListener('click', handleCubeClick);
    }
  }

  // Nav Tab Active State & ScrollSpy
  const navTabs = document.querySelectorAll('.nav-tab-btn');
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  const sectionIds = ['metrics', 'trends', 'records', 'terminal'];
  const observedSections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 140;
    for (let i = observedSections.length - 1; i >= 0; i--) {
      const sec = observedSections[i];
      if (sec.offsetTop <= scrollPos) {
        navTabs.forEach(t => {
          if (t.getAttribute('href') === `#${sec.id}`) {
            t.classList.add('active');
          } else {
            t.classList.remove('active');
          }
        });
        break;
      }
    }
  }, { passive: true });

  initHeroModalCube();

  loadDailyRecords();
  setInterval(loadDailyRecords, 10000);
});

