// ==========================================================================
// Vector Spline Area Chart Engine matching Figma Specification
// ==========================================================================

class PhosphorChart {
  constructor(canvasId) {
    this.id = canvasId;
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.data = [];
    this.hoverIdx = -1;
    this.setupResolution();
    this.bindEvents();
  }

  setupResolution() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const parent = this.canvas.parentElement;
    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Use parent container's actual dimensions
    this.width = Math.max(80, Math.floor(rect.width || parent.clientWidth || 300));
    
    // Check parent height
    const parentH = parent.clientHeight || Math.floor(rect.height);
    if (parentH && parentH > 40) {
      this.height = parentH;
    } else {
      this.height = window.innerWidth <= 640 ? 160 : 200;
    }

    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.canvas.style.display = 'block';

    this.ctx.resetTransform && this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.setupResolution();
      this.render();
    });

    if (window.ResizeObserver && this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver(() => {
        this.setupResolution();
        this.render();
      });
      this.resizeObserver.observe(this.canvas.parentElement);
    }

    const handlePointerMove = (e) => {
      if (!this.data || this.data.length < 2) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const isMobile = window.innerWidth <= 640;
      const isCompact = this.height < 200;
      const padding = isMobile 
        ? { top: 12, right: 12, bottom: 20, left: 32 }
        : (isCompact 
            ? { top: 14, right: 16, bottom: 22, left: 36 } 
            : { top: 20, right: 24, bottom: 28, left: 42 });

      const chartW = this.width - padding.left - padding.right;

      if (x >= padding.left && x <= this.width - padding.right) {
        const relX = x - padding.left;
        const stepX = chartW / (this.data.length - 1);
        this.hoverIdx = Math.round(relX / stepX);
        this.hoverIdx = Math.max(0, Math.min(this.data.length - 1, this.hoverIdx));
      } else {
        this.hoverIdx = -1;
      }
      this.render();
    };

    this.canvas.addEventListener('mousemove', handlePointerMove);
    this.canvas.addEventListener('mouseleave', () => {
      this.hoverIdx = -1;
      this.render();
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        handlePointerMove(e.touches[0]);
      }
    }, { passive: true });
    
    this.canvas.addEventListener('touchend', () => {
      this.hoverIdx = -1;
      this.render();
    });
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
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    if (!this.data || this.data.length < 2) {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.font = '12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Menunggu aliran data telemetri real-time...', w / 2, h / 2);
      return;
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const isMobile = window.innerWidth <= 640;
    const isCompact = h < 200;
    const padding = isMobile 
      ? { top: 12, right: 12, bottom: 20, left: 32 }
      : (isCompact 
          ? { top: 14, right: 16, bottom: 22, left: 36 } 
          : { top: 20, right: 24, bottom: 28, left: 42 });

    const chartW = Math.max(10, w - padding.left - padding.right);
    const chartH = Math.max(10, h - padding.top - padding.bottom);

    // 1. Draw Grid Lines & Y-axis labels
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
    const textLabelColor = isDark ? '#94a3b8' : '#64748b';

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    const divisions = isCompact ? 3 : 4;
    for (let i = 0; i <= divisions; i++) {
      const y = padding.top + (chartH / divisions) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // Labels on Y-axis
      ctx.fillStyle = textLabelColor;
      ctx.font = '10px "Fira Code", monospace';
      ctx.textAlign = 'right';

      let label = '';
      if (this.id === 'metricsChart2') {
        const tempVal = Math.round(40 - (i / divisions) * 40);
        label = `${tempVal}°C`;
      } else {
        const val = Math.round(100 - (i / divisions) * 100);
        label = `${val}%`;
      }
      ctx.fillText(label, padding.left - 6, y + 3.5);
    }

    // 2. Draw Multi-series Spline Area Curves based on chart identity
    if (this.id === 'metricsChart1') {
      // Substrate Moisture FDR Array: Primary & Secondary FDR Probes
      const primaryVWC = this.data.map(d => d.soilMoisture || 68.4);
      const secondaryVWC = this.data.map(d => Math.max(40, (d.soilMoisture || 68.4) * 0.94 + 2.5));

      this.drawSmoothSpline(
        primaryVWC,
        '#10b981',
        isDark ? 'rgba(16, 185, 129, 0.28)' : 'rgba(16, 185, 129, 0.16)',
        2.2, chartW, chartH, padding, 0, 100
      );

      this.drawSmoothSpline(
        secondaryVWC,
        '#0ea5e9',
        isDark ? 'rgba(14, 165, 233, 0.20)' : 'rgba(14, 165, 233, 0.10)',
        1.8, chartW, chartH, padding, 0, 100
      );

    } else if (this.id === 'metricsChart2') {
      // Micro-Climate: Air Temp (Sky Blue) vs Reservoir Temp (Emerald)
      const airTemps = this.data.map(d => d.airTemp || 24.2);
      const resTemps = this.data.map(d => Math.max(16, (d.airTemp || 24.2) * 0.88 + 0.2));

      this.drawSmoothSpline(
        airTemps,
        '#0ea5e9',
        isDark ? 'rgba(14, 165, 233, 0.24)' : 'rgba(14, 165, 233, 0.14)',
        2.2, chartW, chartH, padding, 0, 40
      );

      this.drawSmoothSpline(
        resTemps,
        '#10b981',
        isDark ? 'rgba(16, 185, 129, 0.24)' : 'rgba(16, 185, 129, 0.12)',
        2, chartW, chartH, padding, 0, 40
      );

    } else {
      // Default: Overview & Trends (Soil Moisture, Air Humidity, Air Temp)
      // Series 1: Soil Moisture (Emerald Green)
      this.drawSmoothSpline(
        this.data.map(d => d.soilMoisture),
        '#10b981',
        isDark ? 'rgba(16, 185, 129, 0.28)' : 'rgba(16, 185, 129, 0.18)',
        2.2, chartW, chartH, padding, 0, 100
      );

      // Series 2: Air Humidity (Sky Blue)
      this.drawSmoothSpline(
        this.data.map(d => d.airHumidity),
        '#0ea5e9',
        isDark ? 'rgba(14, 165, 233, 0.22)' : 'rgba(14, 165, 233, 0.12)',
        1.8, chartW, chartH, padding, 0, 100
      );

      // Series 3: Air Temperature (Warm Amber scaled 0-50°C to 0-100%)
      this.drawSmoothSpline(
        this.data.map(d => (d.airTemp / 50) * 100),
        '#f59e0b',
        isDark ? 'rgba(245, 158, 11, 0.18)' : 'rgba(245, 158, 11, 0.08)',
        1.8, chartW, chartH, padding, 0, 100
      );
    }

    // 3. Draw Hover Crosshair Tooltip if active
    if (this.hoverIdx >= 0 && this.hoverIdx < this.data.length) {
      const d = this.data[this.hoverIdx];
      const stepX = chartW / (this.data.length - 1);
      const crossX = padding.left + this.hoverIdx * stepX;

      // Vertical guide line
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(crossX, padding.top);
      ctx.lineTo(crossX, padding.top + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Tooltip Dimensions
      let tooltipW = 145;
      let tooltipH = 60;
      if (this.id !== 'metricsChart1' && this.id !== 'metricsChart2') {
        tooltipH = 74;
      }

      let ttX = crossX + 10;
      if (ttX + tooltipW > w - padding.right) {
        ttX = crossX - tooltipW - 10;
      }
      let ttY = padding.top + 6;

      ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.96)';
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      
      // Rounded rect for tooltip
      this.roundRect(ctx, ttX, ttY, tooltipW, tooltipH, 6, true, true);

      // Tooltip Text
      ctx.font = 'bold 9.5px "Fira Code", monospace';
      ctx.textAlign = 'left';

      if (this.id === 'metricsChart1') {
        ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
        ctx.fillText(`⏱ ${d.time || '--'}`, ttX + 8, ttY + 14);

        ctx.fillStyle = '#10b981';
        ctx.fillText(`● FDR-01 VWC: ${Number(d.soilMoisture || 68.4).toFixed(1)}%`, ttX + 8, ttY + 30);

        ctx.fillStyle = '#0ea5e9';
        ctx.fillText(`● FDR-02 VWC: ${(Number(d.soilMoisture || 68.4) * 0.94 + 2.5).toFixed(1)}%`, ttX + 8, ttY + 46);

      } else if (this.id === 'metricsChart2') {
        ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
        ctx.fillText(`⏱ ${d.time || '--'}`, ttX + 8, ttY + 14);

        ctx.fillStyle = '#0ea5e9';
        ctx.fillText(`● Air Temp: ${Number(d.airTemp || 24.2).toFixed(1)}°C`, ttX + 8, ttY + 30);

        ctx.fillStyle = '#10b981';
        ctx.fillText(`● Root Bed: ${(Number(d.airTemp || 24.2) * 0.88 + 0.2).toFixed(1)}°C`, ttX + 8, ttY + 46);

      } else {
        ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
        ctx.fillText(`⏱ ${d.time || '--'}`, ttX + 8, ttY + 14);

        ctx.fillStyle = '#10b981';
        ctx.fillText(`● Tanah: ${d.soilMoisture}%`, ttX + 8, ttY + 29);

        ctx.fillStyle = '#0ea5e9';
        ctx.fillText(`● Udara: ${d.airHumidity}%`, ttX + 8, ttY + 44);

        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`● Suhu: ${d.airTemp}°C`, ttX + 8, ttY + 59);
      }
    }
  }

  drawSmoothSpline(values, strokeColor, fillGradientColor, strokeWidth, chartW, chartH, padding, minVal, maxVal) {
    const ctx = this.ctx;
    const count = values.length;
    if (count < 2) return;

    const stepX = chartW / (count - 1);
    const points = [];

    for (let i = 0; i < count; i++) {
      const clamped = Math.max(minVal, Math.min(maxVal, values[i]));
      const normalized = (clamped - minVal) / (maxVal - minVal || 1);
      const x = padding.left + i * stepX;
      const y = padding.top + chartH - normalized * chartH;
      points.push({ x, y });
    }

    // 1. Draw Area Fill Under Curve
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartH);
    ctx.lineTo(points[0].x, points[0].y);

    for (let i = 0; i < count - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midX = (p0.x + p1.x) / 2;
      ctx.bezierCurveTo(midX, p0.y, midX, p1.y, p1.x, p1.y);
    }

    ctx.lineTo(points[count - 1].x, padding.top + chartH);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, fillGradientColor);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();

    // 2. Draw Stroke Path
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < count - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midX = (p0.x + p1.x) / 2;
      ctx.bezierCurveTo(midX, p0.y, midX, p1.y, p1.x, p1.y);
    }
    ctx.stroke();

    // Subtle end-cap node
    const lastP = points[count - 1];
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(lastP.x, lastP.y, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }
}

window.PhosphorChart = PhosphorChart;
