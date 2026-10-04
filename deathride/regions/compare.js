// Select matched captures made by the shipping renderer; no simulation runs in this page.
(() => {
  'use strict';
  const review = window.REGION_REVIEW;
  const camera = document.getElementById('camera');
  const materials = document.getElementById('materials');
  const viewNames = { driving: 'driving scale', overview: 'whole course', banner: 'division banner' };
  const modeNames = { candidate: 'approved G1 ground', 'tint-fallback': 'original materials + tint', procedural: 'fully procedural fallback' };
  function update() {
    document.querySelectorAll('[data-region]').forEach(card => {
      const capture = review.captures.find(c => c.region === card.dataset.region && c.view === camera.value && c.mode === materials.value);
      if (!capture) throw new Error('Missing matched region capture');
      const img = card.querySelector('.region-render');
      img.src = '../' + capture.path;
      img.alt = `${card.dataset.label}: ${review.course}, ${viewNames[camera.value]}, ${modeNames[materials.value]}`;
      card.querySelector('.render-link').href = img.src;
      card.querySelector('.render-caption').textContent = `Desktop GL · ${viewNames[camera.value]} · ${modeNames[materials.value]} · ${capture.weatherLive} weather slots live`;
      card.dataset.samples = `${card.dataset.region}; course ${review.course}; region.csv SHA-256 ${review.authoritySha256}; desktop GL; ${camera.value} / ${materials.value}; capture SHA-256 ${capture.sha256}; Stick pending-busy`;
    });
  }
  camera.addEventListener('change', update);
  materials.addEventListener('change', update);
  update();
})();
