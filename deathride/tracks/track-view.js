/* Shared map view. All geometry comes from Course's JVM bake, not a second spline implementation. */
(() => {
  'use strict';
  const colors = ['#23877e', '#3682aa', '#7772b4', '#ba687e', '#d67930', '#bf3f31'];
  const heatColor = t => `hsl(${210 - Math.max(0, Math.min(1, t)) * 205} 76% 49%)`;
  const point = (course, fraction, lane = 0) => {
    const ribbon = course.ribbon, length = ribbon.at(-1)[3], s = ((fraction % 1) + 1) % 1 * length;
    let i = 0; while (i + 1 < ribbon.length - 1 && ribbon[i + 1][3] <= s) i++;
    const a = ribbon[i], b = ribbon[i + 1], distance = b[3] - a[3], t = (s - a[3]) / distance;
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
    return [a[0] + dx * t - dy / len * lane, a[1] + dy * t + dx / len * lane, Math.atan2(dy, dx)];
  };
  function draw(canvas, course, {heat = null, layer = 'map', nodes = false, selected = -1, cars = null} = {}) {
    const ratio = window.devicePixelRatio || 1, width = Math.max(240, canvas.clientWidth || 640), height = Math.max(200, canvas.clientHeight || 360);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    const ctx = canvas.getContext('2d'); ctx.scale(ratio, ratio);
    const xs = course.ribbon.map(p => p[0]), ys = course.ribbon.map(p => p[1]);
    const padding = Math.max(...course.ribbon.map(p => p[2])) + 18;
    const bounds = [Math.min(...xs) - padding, Math.min(...ys) - padding, Math.max(...xs) + padding, Math.max(...ys) + padding];
    const scale = Math.min(width / (bounds[2] - bounds[0]), height / (bounds[3] - bounds[1]));
    const cx = (bounds[0] + bounds[2]) / 2, cy = (bounds[1] + bounds[3]) / 2;
    const xy = (x, y) => [width / 2 + (x - cx) * scale, height / 2 - (y - cy) * scale];
    canvas.trackTransform = {toWorld: (x, y) => [(x - width / 2) / scale + cx, cy - (y - height / 2) / scale], xy, scale};
    const dark = getComputedStyle(document.documentElement).colorScheme === 'dark' || document.documentElement.dataset.theme === 'dark';
    ctx.fillStyle = dark ? '#191e22' : '#e4dfd1'; ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = dark ? '#282f34' : '#d3ccbc'; ctx.lineWidth = 1;
    for (let x = Math.ceil(bounds[0] / 50) * 50; x < bounds[2]; x += 50) { const p = xy(x, 0); ctx.beginPath(); ctx.moveTo(p[0], 0); ctx.lineTo(p[0], height); ctx.stroke(); }
    for (let y = Math.ceil(bounds[1] / 50) * 50; y < bounds[3]; y += 50) { const p = xy(0, y); ctx.beginPath(); ctx.moveTo(0, p[1]); ctx.lineTo(width, p[1]); ctx.stroke(); }
    let values = null, unit = '';
    if (heat) {
      if (layer === 'contacts') { values = heat.contactsPerCarMinute; unit = 'contact episodes / car-minute'; }
      if (layer === 'wrecks') { values = heat.wrecksPerCarMinute; unit = 'wrecks / car-minute'; }
      if (layer === 'spins') { values = heat.spins.map((n, i) => heat.exposureCarSeconds[i] > 0 ? n * 60 / heat.exposureCarSeconds[i] : null); unit = 'spin entries / car-minute'; }
      if (layer === 'speed') { values = heat.meanSpeedMps; unit = 'm/s'; }
      if (layer === 'traps') { values = heat.trapOpportunities.map((n, i) => heat.exposureCarSeconds[i] ? n : null); unit = 'trap opportunity episodes (proxy)'; }
    }
    const maximum = Math.max(0, ...(values || []).filter(Number.isFinite));
    const ribbon = course.ribbon, length = ribbon.at(-1)[3];
    ctx.lineCap = 'round';
    for (let border = 1; border >= 0; border--) for (let i = 0; i < ribbon.length - 1; i++) {
      const a = ribbon[i], b = ribbon[i + 1], [ax, ay] = xy(a[0], a[1]), [bx, by] = xy(b[0], b[1]);
      const bin = Math.min(47, Math.floor((a[3] + b[3]) / 2 / length * 48));
      ctx.lineWidth = (a[2] + b[2]) * scale + (border ? 2 : 0);
      const surface = course.nodes[Math.min(course.nodes.length - 2, Math.floor(i / ((ribbon.length - 1) / (course.nodes.length - 1))))][3];
      const roadColor = layer === 'map' ? ({Asphalt: '#51575c', Gravel: '#ae9164', Oil: '#28232f', Ice: '#a4ccd3'}[surface] || '#51575c') : '#51575c';
      ctx.strokeStyle = border ? (dark ? '#ded5bf' : '#5e6057') : values ? (values[bin] === null ? '#939393' : heatColor(maximum ? values[bin] / maximum : 0)) : roadColor;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    }
    // Surface bands, hazard and pickup silhouettes remain visible on the map layer.
    if (layer === 'map') {
      for (const f of course.features) {
        const n = Math.max(8, Math.ceil((f[2] - f[1]) * 150)); ctx.strokeStyle = f[0] === 'shortcut' ? '#be9955' : '#63b8a1'; ctx.lineWidth = Math.max(2, f[4] * scale);
        ctx.beginPath(); for (let i = 0; i <= n; i++) { const p = point(course, f[1] + (f[2] - f[1]) * i / n, f[3]); const s = xy(p[0], p[1]); if (i) ctx.lineTo(...s); else ctx.moveTo(...s); } ctx.stroke();
      }
      for (const o of course.bakedObstacles) { const [x, y] = xy(o.x, o.y); ctx.save(); ctx.translate(x, y); ctx.rotate(-o.heading); ctx.fillStyle = o.effect === 'SOLID' ? '#de7147' : o.effect === 'DRAG' ? '#ac9545' : '#81948a'; ctx.beginPath(); ctx.ellipse(0, 0, Math.max(2, o.rx * scale), Math.max(2, o.ry * scale), 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
      for (const s of course.spots.filter(s => ['ammo', 'repair', 'cash', 'hazard'].includes(s[0]))) {
        const p = point(course, course.startFraction + s[1], s[2]), [x, y] = xy(p[0], p[1]);
        ctx.fillStyle = {ammo: '#f3d173', repair: '#72dbc8', cash: '#edeee0', hazard: '#221f25'}[s[0]]; ctx.fillRect(x - 3, y - 3, 6, 6);
      }
    }
    if (layer === 'lines' && heat) {
      const max = Math.max(1, ...heat.lineOccupancy.flat());
      for (let i = 0; i < 48; i++) for (let j = 0; j < 9; j++) if (heat.lineOccupancy[i][j]) {
        const fraction = (i + .5) / 48, center = point(course, fraction), index = ribbon.findIndex(p => p[3] >= fraction * length), half = ribbon[Math.max(0, index)][2];
        const p = point(course, fraction, ((j + .5) / 9 * 2 - 1) * half), [x, y] = xy(p[0], p[1]);
        ctx.fillStyle = heatColor(heat.lineOccupancy[i][j] / max); ctx.beginPath(); ctx.arc(x, y, Math.max(2, half * scale / 6), 0, Math.PI * 2); ctx.fill();
      }
      unit = 'lateral occupancy samples · edge bins include off-road';
    }
    const start = point(course, course.startFraction), [sx, sy] = xy(start[0], start[1]);
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(-start[2]); ctx.fillStyle = '#fff'; ctx.fillRect(-1, -8, 3, 16); ctx.restore();
    if (nodes) course.nodes.slice(0, -1).forEach((p, i) => { const [x, y] = xy(p[0], p[1]); ctx.fillStyle = i === selected ? '#ffe77d' : '#fff'; ctx.strokeStyle = '#171b1e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, i === selected ? 7 : 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.font = '12px system-ui'; ctx.fillStyle = dark ? '#fff' : '#111'; ctx.fillText(i, x + 8, y - 7); });
    if (cars) cars.forEach((car, i) => { const [x, y] = xy(car[0], car[1]); ctx.save(); ctx.translate(x, y); ctx.rotate(-car[2]); ctx.fillStyle = car[3] ? '#3a2524' : colors[i]; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-5, -3); ctx.lineTo(-5, 3); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); });
    canvas.setAttribute('aria-label', `${course.name}. ${layer} map. ${unit || 'Road, start, obstacles and pickups'}.`);
    return values ? `Blue 0 → red ${maximum.toFixed(2)} ${unit}. Gray: unmeasured.` : layer === 'lines' ? unit : 'White: start · teal: repair · yellow: ammo · orange: solid · ochre: drag · tan: gravel · pale blue: ice';
  }
  window.TrackView = {draw, point};
})();
