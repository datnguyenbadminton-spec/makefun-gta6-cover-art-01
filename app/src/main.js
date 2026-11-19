// Vice Heat Cover Studio — the editor.
//
// Owns the state, the controls and the live preview. The drawing
// itself lives in cover.js. A `?shot=` query switches the page into
// a fixed screenshot scene instead (see shots.js).

import { SIZES, LAYOUTS, GRADES, findSize, findLayout, findGrade, layoutPanels, renderCover, ensureCoverFonts } from './cover.js';
import { runShotScene } from './shots.js';

// Photos shipped with the app: two kit samples (made with an image
// model for make.fun, free to use) and three AI-made photos of our own.
const SAMPLE_PHOTOS = [
  { id: 'driver', name: 'Driver at dusk', src: 'samples/driver.jpg' },
  { id: 'boardwalk', name: 'Boardwalk', src: 'samples/boardwalk.jpg' },
  { id: 'neon', name: 'Neon street', src: 'samples/neon.jpg' },
  { id: 'boulevard', name: 'Boulevard', src: 'samples/boulevard.jpg' },
  { id: 'pier', name: 'Pier', src: 'samples/pier.jpg' },
];

// The working state: which photos, which panel shows which photo and
// how it is cropped, which layout and grade, and the words.
export const state = {
  sizeId: 'wide',
  layoutId: 'keyart',
  gradeId: 'heatwave',
  title: 'VICE HEAT',
  subtitle: 'Coastline Nights',
  tagline: 'Summer 2026 • Vice City',
  badgeOn: true,
  badgeLine1: 'NEW',
  badgeLine2: 'SUMMER 2026',
  photos: [],
  panels: [],
  selectedPanel: 0,
};

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

// Give every panel a photo, cycling through the tray so the cover is
// full from the first paint.
export function assignDefaultPanels() {
  const count = findLayout(state.layoutId).panels.length;
  const ids = state.photos.map((p) => p.id);
  state.panels = Array.from({ length: count }, (_, i) => ({
    photoId: ids[i % ids.length],
    cx: 0.5,
    cy: 0.5,
    zoom: 1,
  }));
}

export async function loadSamplePhotos() {
  state.photos = [];
  for (const sample of SAMPLE_PHOTOS) {
    try {
      const img = await loadImage(sample.src);
      state.photos.push({ id: sample.id, name: sample.name, src: sample.src, img });
    } catch (err) {
      console.warn('sample photo failed', sample.id, err);
    }
  }
  assignDefaultPanels();
}

// --- preview -------------------------------------------------------------

const preview = document.getElementById('preview');
const previewCtx = preview.getContext('2d');
let previewQueued = false;

export function renderPreview() {
  const size = findSize(state.sizeId);
  const scale = Math.min(1, 960 / size.width);
  const w = Math.round(size.width * scale);
  const h = Math.round(size.height * scale);
  if (preview.width !== w) preview.width = w;
  if (preview.height !== h) preview.height = h;
  const ctx = previewCtx;
  ctx.clearRect(0, 0, w, h);
  const off = renderCover(state, w, h);
  ctx.drawImage(off, 0, 0);
  drawPanelSelection(ctx, w, h);
}

function queuePreview() {
  if (previewQueued) return;
  previewQueued = true;
  requestAnimationFrame(() => {
    previewQueued = false;
    renderPreview();
  });
}

// A dashed outline around the panel the user is editing.
function drawPanelSelection(ctx, width, height) {
  const rects = layoutPanels(state.layoutId, width, height);
  const rect = rects[state.selectedPanel];
  if (!rect) return;
  ctx.save();
  ctx.strokeStyle = '#ffd319';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 6]);
  ctx.strokeRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4);
  ctx.setLineDash([]);
  ctx.fillStyle = '#ffd319';
  ctx.fillRect(rect.x + rect.w - 162, rect.y + 2, 160, 24);
  ctx.fillStyle = '#0a0612';
  ctx.font = '700 13px Oswald, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(`PANEL ${state.selectedPanel + 1} · drag to pan`, rect.x + rect.w - 156, rect.y + 14);
  ctx.restore();
}

// --- controls ------------------------------------------------------------

const $ = (id) => document.getElementById(id);

function buildPicker(containerId, items, currentId, onPick) {
  const box = $(containerId);
  box.innerHTML = '';
  for (const item of items) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pick' + (item.id === currentId ? ' active' : '');
    btn.textContent = item.name || item.label;
    btn.addEventListener('click', () => {
      onPick(item.id);
      box.querySelectorAll('.pick').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
    box.appendChild(btn);
  }
}

function buildPhotoTray() {
  const tray = $('photo-tray');
  tray.innerHTML = '';
  state.photos.forEach((photo) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'thumb';
    btn.title = photo.name;
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.name;
    btn.appendChild(img);
    btn.addEventListener('click', () => {
      // A tray photo drops into the selected panel.
      state.panels[state.selectedPanel].photoId = photo.id;
      state.panels[state.selectedPanel].cx = 0.5;
      state.panels[state.selectedPanel].cy = 0.5;
      state.panels[state.selectedPanel].zoom = 1;
      setStatus(`${photo.name} → panel ${state.selectedPanel + 1}`);
      queuePreview();
    });
    tray.appendChild(btn);
  });
}

export function setStatus(text) {
  $('status').textContent = text;
}

function bindControls() {
  buildPicker('layout-picker', LAYOUTS, state.layoutId, (id) => {
    state.layoutId = id;
    assignDefaultPanels();
    state.selectedPanel = 0;
    queuePreview();
  });
  buildPicker('grade-picker', GRADES, state.gradeId, (id) => {
    state.gradeId = id;
    queuePreview();
  });
  buildPicker('size-picker', SIZES, state.sizeId, (id) => {
    state.sizeId = id;
    queuePreview();
  });

  $('title-input').addEventListener('input', (e) => {
    state.title = e.target.value;
    queuePreview();
  });
  $('subtitle-input').addEventListener('input', (e) => {
    state.subtitle = e.target.value;
    queuePreview();
  });
  $('tagline-input').addEventListener('input', (e) => {
    state.tagline = e.target.value;
    queuePreview();
  });
  $('badge-toggle').addEventListener('change', (e) => {
    state.badgeOn = e.target.checked;
    queuePreview();
  });

  $('zoom-slider').addEventListener('input', (e) => {
    const panel = state.panels[state.selectedPanel];
    panel.zoom = Number(e.target.value);
    queuePreview();
  });
  $('fill-all').addEventListener('click', () => {
    const panel = state.panels[state.selectedPanel];
    state.panels.forEach((p) => {
      p.photoId = panel.photoId;
      p.cx = panel.cx;
      p.cy = panel.cy;
      p.zoom = panel.zoom;
    });
    setStatus(`Panel ${state.selectedPanel + 1} photo fills every panel`);
    queuePreview();
  });
  $('reset-crop').addEventListener('click', () => {
    const panel = state.panels[state.selectedPanel];
    panel.cx = 0.5;
    panel.cy = 0.5;
    panel.zoom = 1;
    $('zoom-slider').value = '1';
    queuePreview();
  });

  $('photo-upload').addEventListener('change', async (e) => {
    for (const file of e.target.files) {
      if (!file.type.startsWith('image/')) continue;
      const url = URL.createObjectURL(file);
      try {
        const img = await loadImage(url);
        const id = `upload-${Date.now()}-${state.photos.length}`;
        state.photos.push({ id, name: file.name, src: url, img });
        state.panels[state.selectedPanel].photoId = id;
        buildPhotoTray();
        setStatus(`${file.name} loaded into panel ${state.selectedPanel + 1}`);
      } catch (err) {
        setStatus(`Could not read ${file.name}`);
      }
    }
    queuePreview();
  });

  $('export-current').addEventListener('click', () => exportCover(state.sizeId));
  $('export-all').addEventListener('click', async () => {
    for (const size of SIZES) {
      exportCover(size.id);
      await new Promise((r) => setTimeout(r, 250));
    }
  });
}

// --- panel picking: click to select, drag to pan, wheel to zoom ---------

function panelAtPoint(px, py) {
  const rects = layoutPanels(state.layoutId, preview.width, preview.height);
  const scaleX = preview.width / preview.getBoundingClientRect().width;
  const scaleY = preview.height / preview.getBoundingClientRect().height;
  const x = px * scaleX;
  const y = py * scaleY;
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i];
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
  }
  return -1;
}

function bindCanvas() {
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  preview.addEventListener('pointerdown', (e) => {
    const box = preview.getBoundingClientRect();
    const hit = panelAtPoint(e.clientX - box.left, e.clientY - box.top);
    if (hit < 0) return;
    state.selectedPanel = hit;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    preview.setPointerCapture(e.pointerId);
    queuePreview();
  });
  preview.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const panel = state.panels[state.selectedPanel];
    const rects = layoutPanels(state.layoutId, preview.width, preview.height);
    const rect = rects[state.selectedPanel];
    const scaleX = preview.width / preview.getBoundingClientRect().width;
    const scaleY = preview.height / preview.getBoundingClientRect().height;
    const dx = (e.clientX - lastX) * scaleX;
    const dy = (e.clientY - lastY) * scaleY;
    lastX = e.clientX;
    lastY = e.clientY;
    // Pan the photo inside its panel: moving right shows the left.
    panel.cx = clamp(panel.cx - dx / Math.max(1, rect.w), 0, 1);
    panel.cy = clamp(panel.cy - dy / Math.max(1, rect.h), 0, 1);
    queuePreview();
  });
  preview.addEventListener('pointerup', () => {
    dragging = false;
  });
  preview.addEventListener('wheel', (e) => {
    e.preventDefault();
    const panel = state.panels[state.selectedPanel];
    panel.zoom = clamp(panel.zoom * (e.deltaY > 0 ? 0.92 : 1.09), 1, 3);
    $('zoom-slider').value = String(panel.zoom);
    queuePreview();
  }, { passive: false });
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

// --- export --------------------------------------------------------------

// Render the cover at its full export size and download it as a PNG.
export function exportCover(sizeId) {
  const size = findSize(sizeId);
  const canvas = renderCover(state, size.width, size.height);
  canvas.toBlob((blob) => {
    if (!blob) {
      setStatus('Export failed — the browser could not make the PNG');
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-heat-cover-${size.width}x${size.height}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    setStatus(`Exported vice-heat-cover-${size.width}x${size.height}.png`);
  }, 'image/png');
}

// --- boot ----------------------------------------------------------------

export async function bootEditor(setup) {
  bindControls();
  bindCanvas();
  await ensureCoverFonts();
  await loadSamplePhotos();
  if (setup) setup();
  buildPhotoTray();
  renderPreview();
  setStatus('Pick a panel, drag to pan, scroll to zoom — then export.');
}

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShotScene(shot, query);
} else {
  bootEditor();
}

// Handy in the console and for the screenshot scenes.
window.ViceHeat = { state, renderCover, ensureCoverFonts, loadSamplePhotos, renderPreview };
