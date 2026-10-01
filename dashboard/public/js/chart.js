// Phosphor CRT Vector Canvas Chart
class PhosphorChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.data = [];
    this.setupResolution();
    window.addEventListener('resize', () => {
      this.setupResolution();
      this.render();
    });
  }

  setupResolution() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = 260;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(dpr, dpr);
  }

  setData(dataList) {
    this.data = dataList || [];
    this.render();
  }

  addPoint(point) {
    this.data.push(point);
    if (this.data.length > 40) this.data.shift();
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    if (!this.data || this.data.length < 2) {
      ctx.fillStyle = '#677d64';
      ctx.font = '12px "Fira Mono"';
      ctx.fillText('Awaiting telemetry stream...', 20, h / 2);
      return;
    }

    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Draw grid lines
    ctx.strokeStyle = '#1f2a33';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // Labels on Y-axis
      ctx.fillStyle = '#677d64';
      ctx.font = '10px "Fira Mono"';
      ctx.textAlign = 'right';
      const val = 100 - i * 25;
      ctx.fillText(`${val}%`, padding.left - 8, y + 3);
    }

    const count = this.data.length;
    const stepX = chartW / (count - 1);

    // Draw Soil Moisture (Lime Pulse: #7fee64)
    this.drawLineSeries(this.data.map(d => d.soilMoisture), '#7fee64', 2, chartW, chartH, padding, 0, 100);

    // Draw Humidity (Phosphor White: #ddffdc)
    this.drawLineSeries(this.data.map(d => d.airHumidity), '#8cab87', 1.5, chartW, chartH, padding, 0, 100);

    // Draw Temperature (Warm Accent: #ffc53d scaled 0-50 -> 0-100)
    this.drawLineSeries(this.data.map(d => (d.airTemp / 50) * 100), '#ffc53d', 1.5, chartW, chartH, padding, 0, 100);

    // Draw latest timestamp
    const last = this.data[this.data.length - 1];
    if (last && last.time) {
      ctx.fillStyle = '#677d64';
      ctx.font = '10px "Fira Mono"';
      ctx.textAlign = 'right';
      ctx.fillText(`LATEST: ${last.time}`, w - padding.right, h - 8);
    }
  }

  drawLineSeries(values, color, strokeWidth, chartW, chartH, padding, minVal, maxVal) {
    const ctx = this.ctx;
    const count = values.length;
    const stepX = chartW / (count - 1);

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;

    values.forEach((val, idx) => {
      const clamped = Math.max(minVal, Math.min(maxVal, val));
      const normalized = (clamped - minVal) / (maxVal - minVal);
      const x = padding.left + idx * stepX;
      const y = padding.top + chartH - normalized * chartH;

      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Subtle glow on endpoint
    const lastVal = values[values.length - 1];
    const lastNorm = (Math.max(minVal, Math.min(maxVal, lastVal)) - minVal) / (maxVal - minVal);
    const lastX = padding.left + (count - 1) * stepX;
    const lastY = padding.top + chartH - lastNorm * chartH;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
window.PhosphorChart = PhosphorChart;
