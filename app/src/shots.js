// Fixed scenes for screenshots and shareable presets.
//
// ?shot=cover   — the cover alone, full-bleed, for the cover shot.
// ?shot=editor  — the editor with a sample photo loaded.
// ?shot=export  — the exported cover, drawn by the app at its export
//                 size and shown scaled down, as the PNG it writes.
// ?shot=square / ?shot=portrait — the cover in that post size.
//
// Extra params: photo (sample id), caption (title), sub (subtitle),
// tag (tagline), layout, grade, size. window.__shotReady is set once
// the scene has painted, so a screenshot runner can wait on it.

import { state, loadImage, loadSamplePhotos, assignDefaultPanels, renderPreview, setStatus, bootEditor } from './main.js';
import { findSize, renderCover, ensureCoverFonts } from './cover.js';

function applyParams(query) {
  if (query.get('caption')) state.title = query.get('caption');
  if (query.get('sub')) state.subtitle = query.get('sub');
  if (query.get('tag')) state.tagline = query.get('tag');
  if (query.get('layout')) state.layoutId = query.get('layout');
  if (query.get('grade')) state.gradeId = query.get('grade');
  if (query.get('size')) state.sizeId = query.get('size');
  const photo = query.get('photo');
  if (photo) {
    // Put the named sample in the hero panel first.
    state.panels.forEach((panel, i) => {
      if (i === 0) panel.photoId = photo;
    });
    // Never show the same photo twice on one cover: step a repeated
    // panel on to the next photo in the tray.
    const seen = new Set();
    state.panels.forEach((panel) => {
      if (seen.has(panel.photoId)) {
        const at = state.photos.findIndex((p) => p.id === panel.photoId);
        panel.photoId = state.photos[(at + 1) % state.photos.length].id;
      }
      seen.add(panel.photoId);
    });
  }
}

function markReady() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
    document.documentElement.dataset.ready = '1';
  }));
}

async function showCoverAlone(query) {
  document.body.classList.add('shot-cover');
  const size = findSize(query.get('size') || state.sizeId);
  await ensureCoverFonts();
  await loadSamplePhotos();
  applyParams(query);
  const canvas = document.getElementById('preview');
  const shot = renderCover(state, size.width, size.height);
  canvas.width = size.width;
  canvas.height = size.height;
  canvas.getContext('2d').drawImage(shot, 0, 0);
  // Fill the window with the cover, keeping its aspect.
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.objectFit = 'contain';
  markReady();
}

async function showEditor(query) {
  document.body.classList.add('shot-editor');
  await bootEditor(() => applyParams(query));
  document.getElementById('title-input').value = state.title;
  document.getElementById('subtitle-input').value = state.subtitle;
  document.getElementById('tagline-input').value = state.tagline;
  setStatus('Photo loaded — drag a panel to pan it, scroll to zoom.');
  markReady();
}

async function showExport(query) {
  document.body.classList.add('shot-export');
  const size = findSize(query.get('size') || state.sizeId);
  await ensureCoverFonts();
  await loadSamplePhotos();
  applyParams(query);
  const shot = renderCover(state, size.width, size.height);
  const stage = document.getElementById('export-stage');
  const canvas = document.getElementById('export-canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  canvas.getContext('2d').drawImage(shot, 0, 0);
  stage.hidden = false;
  document.getElementById('export-caption').textContent =
    `Exported PNG — ${size.width} × ${size.height} — vice-heat-cover-${size.width}x${size.height}.png`;
  markReady();
}

export async function runShotScene(shot, query) {
  try {
    if (shot === 'cover' || shot === 'square' || shot === 'portrait') {
      if (shot === 'square') query.set('size', 'square');
      if (shot === 'portrait') query.set('size', 'portrait');
      await showCoverAlone(query);
    } else if (shot === 'export') {
      await showExport(query);
    } else {
      await showEditor(query);
    }
  } catch (err) {
    console.error('shot scene failed', err);
    document.documentElement.dataset.ready = 'error';
  }
}
