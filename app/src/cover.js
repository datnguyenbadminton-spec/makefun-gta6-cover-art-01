// Vice Heat Cover Studio — the cover renderer.
//
// Everything that turns photos + words into a poster lives here:
// panel layouts, colour grades, lettering and badges. The editor
// (main.js) owns state and controls; this file only draws.
//
// A cover is two zones: a photo area on top and a title band along
// the bottom. The photo area is split into panels; each panel shows
// one photo, cropped and graded. The title band carries the big
// gradient title, the neon script subtitle and the tagline bar.

export const SIZES = [
  { id: 'square', label: '1080 × 1080', width: 1080, height: 1080 },
  { id: 'portrait', label: '1080 × 1350', width: 1080, height: 1350 },
  { id: 'wide', label: '1920 × 1080', width: 1920, height: 1080 },
];

// Each layout is a list of panels, given as fractions of the photo
// area (x, y, w, h in 0..1). The title band height is a fraction of
// the whole cover.
export const LAYOUTS = [
  {
    id: 'keyart',
    name: 'Key Art',
    titleBand: 0.30,
    panels: [
      { x: 0.0, y: 0.0, w: 0.54, h: 1.0 },
      { x: 0.54, y: 0.0, w: 0.46, h: 0.5 },
      { x: 0.54, y: 0.5, w: 0.46, h: 0.5 },
    ],
  },
  {
    id: 'comic',
    name: 'Comic Grid',
    titleBand: 0.30,
    panels: [
      { x: 0.0, y: 0.0, w: 0.34, h: 1.0 },
      { x: 0.34, y: 0.0, w: 0.33, h: 0.52 },
      { x: 0.34, y: 0.52, w: 0.33, h: 0.48 },
      { x: 0.67, y: 0.0, w: 0.33, h: 1.0 },
    ],
  },
  {
    id: 'strip',
    name: 'Hero + Strip',
    titleBand: 0.30,
    panels: [
      { x: 0.0, y: 0.0, w: 1.0, h: 0.58 },
      { x: 0.0, y: 0.58, w: 0.34, h: 0.42 },
      { x: 0.34, y: 0.58, w: 0.33, h: 0.42 },
      { x: 0.67, y: 0.58, w: 0.33, h: 0.42 },
    ],
  },
  {
    id: 'nine',
    name: 'Nine Panel',
    titleBand: 0.28,
    panels: [
      { x: 0.0, y: 0.0, w: 0.34, h: 0.34 },
      { x: 0.34, y: 0.0, w: 0.33, h: 0.34 },
      { x: 0.67, y: 0.0, w: 0.33, h: 0.34 },
      { x: 0.0, y: 0.34, w: 0.34, h: 0.33 },
      { x: 0.34, y: 0.34, w: 0.33, h: 0.33 },
      { x: 0.67, y: 0.34, w: 0.33, h: 0.33 },
      { x: 0.0, y: 0.67, w: 0.34, h: 0.33 },
      { x: 0.34, y: 0.67, w: 0.33, h: 0.33 },
      { x: 0.67, y: 0.67, w: 0.33, h: 0.33 },
    ],
  },
  {
    id: 'split5',
    name: 'Split Five',
    titleBand: 0.30,
    panels: [
      { x: 0.0, y: 0.0, w: 0.4, h: 0.62 },
      { x: 0.4, y: 0.0, w: 0.3, h: 0.62 },
      { x: 0.7, y: 0.0, w: 0.3, h: 0.62 },
      { x: 0.0, y: 0.62, w: 0.5, h: 0.38 },
      { x: 0.5, y: 0.62, w: 0.5, h: 0.38 },
    ],
  },
  {
    id: 'poster',
    name: 'One Photo',
    titleBand: 0.30,
    panels: [{ x: 0.0, y: 0.0, w: 1.0, h: 1.0 }],
  },
];

// A grade is a look: a wash of colour over the photo, an optional
// posterize pass (few flat tones, comic-ink feel), an optional
// halftone dot screen, and the title band's own colours.
export const GRADES = [
  {
    id: 'sunset',
    name: 'Sunset',
    wash: ['rgba(255,122,26,0.20)', 'rgba(255,45,120,0.16)'],
    washMode: 'overlay',
    posterize: 0,
    halftone: 0,
    band: ['#2b0a3d', '#12041f'],
    bandAccent: '#ffb347',
    titleTop: '#ffe259',
    titleBottom: '#ff2975',
  },
  {
    id: 'neon',
    name: 'Neon Vice',
    wash: ['rgba(255,0,180,0.22)', 'rgba(0,220,255,0.20)'],
    washMode: 'overlay',
    posterize: 0,
    halftone: 0,
    band: ['#160b2e', '#05030f'],
    bandAccent: '#00e5ff',
    titleTop: '#7df9ff',
    titleBottom: '#ff2fb3',
  },
  {
    id: 'heatwave',
    name: 'Heatwave Ink',
    wash: ['rgba(255,90,0,0.16)', 'rgba(255,0,110,0.14)'],
    washMode: 'overlay',
    posterize: 5,
    halftone: 0.5,
    band: ['#3d0a2e', '#14041a'],
    bandAccent: '#ffd319',
    titleTop: '#ffe259',
    titleBottom: '#ff2975',
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    wash: ['rgba(255,180,60,0.22)', 'rgba(255,120,40,0.10)'],
    washMode: 'soft-light',
    posterize: 0,
    halftone: 0,
    band: ['#3a1c05', '#160a02'],
    bandAccent: '#ffb347',
    titleTop: '#fff3b0',
    titleBottom: '#ff7b00',
  },
  {
    id: 'afterdark',
    name: 'After Dark',
    wash: ['rgba(90,0,255,0.24)', 'rgba(0,10,60,0.22)'],
    washMode: 'overlay',
    posterize: 0,
    halftone: 0,
    band: ['#0d0b2e', '#030208'],
    bandAccent: '#ff2fb3',
    titleTop: '#c9b6ff',
    titleBottom: '#ff2fb3',
  },
  {
    id: 'coral',
    name: 'Coral Pop',
    wash: ['rgba(255,110,120,0.20)', 'rgba(0,200,190,0.16)'],
    washMode: 'overlay',
    posterize: 4,
    halftone: 0.25,
    band: ['#40102e', '#160410'],
    bandAccent: '#2de1c2',
    titleTop: '#ffe9a8',
    titleBottom: '#ff5e7a',
  },
];

export function findLayout(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}

export function findGrade(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}

export function findSize(id) {
  return SIZES.find((s) => s.id === id) || SIZES[0];
}

// Panel rectangles in absolute pixels for a cover of this size.
export function layoutPanels(layoutId, width, height) {
  const layout = findLayout(layoutId);
  const photoH = Math.round(height * (1 - layout.titleBand));
  const gap = Math.max(4, Math.round(width / 180));
  return layout.panels.map((p) => {
    const x = Math.round(p.x * width);
    const y = Math.round(p.y * photoH);
    const w = Math.round(p.w * width);
    const h = Math.round(p.h * photoH);
    return { x: x + gap / 2, y: y + gap / 2, w: w - gap, h: h - gap };
  });
}

export function titleBandRect(layoutId, width, height) {
  const layout = findLayout(layoutId);
  const top = Math.round(height * (1 - layout.titleBand));
  return { x: 0, y: top, w: width, h: height - top };
}

// --- photo drawing -------------------------------------------------------

// Draw one photo into a panel, cover-fitting it, then panning and
// zooming around the crop centre (cx, cy in 0..1, zoom >= 1).
export function drawPhotoInto(ctx, img, rect, crop) {
  const zoom = Math.max(1, crop.zoom || 1);
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const base = Math.max(rect.w / iw, rect.h / ih);
  const scale = base * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const cx = crop.cx ?? 0.5;
  const cy = crop.cy ?? 0.5;
  const dx = rect.x + (rect.w - dw) / 2 - (cx - 0.5) * (dw - rect.w);
  const dy = rect.y + (rect.h - dh) / 2 - (cy - 0.5) * (dh - rect.h);
  ctx.drawImage(img, dx, dy, dw, dh);
}

// Flatten the tones of the pixels inside rect to a few levels.
export function posterizeRect(ctx, rect, levels) {
  const data = ctx.getImageData(rect.x, rect.y, rect.w, rect.h);
  const px = data.data;
  const step = 255 / (levels - 1);
  for (let i = 0; i < px.length; i += 4) {
    px[i] = Math.round(px[i] / step) * step;
    px[i + 1] = Math.round(px[i + 1] / step) * step;
    px[i + 2] = Math.round(px[i + 2] / step) * step;
  }
  ctx.putImageData(data, rect.x, rect.y);
}

// A repeating dot screen, drawn over the panel for the print look.
let halftoneCache = null;
export function halftonePattern(ctx) {
  if (halftoneCache) return halftoneCache;
  const cell = 7;
  const tile = document.createElement('canvas');
  tile.width = cell;
  tile.height = cell;
  const t = tile.getContext('2d');
  t.fillStyle = '#000';
  t.beginPath();
  t.arc(cell / 2, cell / 2, 1.5, 0, Math.PI * 2);
  t.fill();
  halftoneCache = ctx.createPattern(tile, 'repeat');
  return halftoneCache;
}

// Wash a panel with the grade's colours, posterize and dot it.
export function gradePanel(ctx, rect, grade) {
  if (grade.posterize > 0) posterizeRect(ctx, rect, grade.posterize);
  const wash = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  wash.addColorStop(0, grade.wash[0]);
  wash.addColorStop(1, grade.wash[1]);
  ctx.save();
  ctx.globalCompositeOperation = grade.washMode;
  ctx.fillStyle = wash;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
  if (grade.halftone > 0) {
    ctx.save();
    ctx.globalAlpha = grade.halftone * 0.55;
    ctx.fillStyle = halftonePattern(ctx);
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  }
  // A soft vignette so the panel edges sit back behind the lettering.
  const vig = ctx.createRadialGradient(
    rect.x + rect.w / 2, rect.y + rect.h / 2, Math.min(rect.w, rect.h) * 0.35,
    rect.x + rect.w / 2, rect.y + rect.h / 2, Math.max(rect.w, rect.h) * 0.75,
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = vig;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  // Thick comic gutter around the panel.
  ctx.strokeStyle = '#0a0612';
  ctx.lineWidth = Math.max(3, Math.round(rect.w / 160));
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
}

// --- lettering -----------------------------------------------------------

// Pick the biggest Anton size that still fits the title in maxWidth.
export function fitTitleFont(ctx, text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `400 ${size}px Anton, sans-serif`;
  while (size > 24 && ctx.measureText(text).width > maxWidth) {
    size -= 4;
    ctx.font = `400 ${size}px Anton, sans-serif`;
  }
  return size;
}

// The big gradient title with a heavy outline and a drop shadow.
export function drawBigTitle(ctx, text, x, y, maxWidth, height, grade) {
  const size = fitTitleFont(ctx, text, maxWidth, Math.round(height * 0.70));
  const grad = ctx.createLinearGradient(0, y - size * 0.72, 0, y + size * 0.18);
  grad.addColorStop(0, grade.titleTop);
  grad.addColorStop(0.55, grade.titleBottom);
  grad.addColorStop(1, grade.titleBottom);
  ctx.save();
  ctx.font = `400 ${size}px Anton, sans-serif`;
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = Math.round(size * 0.06);
  ctx.strokeStyle = '#0a0612';
  ctx.lineWidth = Math.max(4, Math.round(size / 14));
  ctx.strokeText(text, x, y);
  ctx.fillStyle = grad;
  ctx.fillText(text, x, y);
  ctx.restore();
  return size;
}

// A spiky starburst sticker, the kind slapped on a poster corner.
export function drawStarburst(ctx, cx, cy, r, line1, line2, scale) {
  const spikes = 16;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.78;
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffd319';
  ctx.fill();
  ctx.lineWidth = Math.max(3, 4 * scale);
  ctx.strokeStyle = '#0a0612';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.fillStyle = '#0a0612';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `400 ${Math.round(r * 0.42)}px Anton, sans-serif`;
  ctx.fillText(line1, 0, -r * 0.16);
  ctx.font = `600 ${Math.round(r * 0.20)}px Oswald, sans-serif`;
  ctx.fillText(line2, 0, r * 0.30);
  ctx.restore();
}

// --- the whole cover -----------------------------------------------------

export function drawCover(ctx, state, width, height) {
  const grade = findGrade(state.gradeId);
  const scale = width / 1080;

  // Backdrop.
  ctx.fillStyle = '#0a0612';
  ctx.fillRect(0, 0, width, height);

  // Photo panels.
  const rects = layoutPanels(state.layoutId, width, height);
  rects.forEach((rect, i) => {
    const panel = state.panels[i] || {};
    const photo = state.photos.find((p) => p.id === panel.photoId) || state.photos[0];
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    if (photo && photo.img) {
      drawPhotoInto(ctx, photo.img, rect, panel);
      gradePanel(ctx, rect, grade);
    } else {
      const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
      g.addColorStop(0, '#ff7b00');
      g.addColorStop(1, '#ff2975');
      ctx.fillStyle = g;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    ctx.restore();
  });

  // Starburst badge, top-left over the hero panel.
  if (state.badgeOn !== false) {
    const r = Math.round(62 * scale);
    drawStarburst(ctx, r + 14 * scale, r + 12 * scale, r, state.badgeLine1 || 'NEW', state.badgeLine2 || 'SUMMER 2026', scale);
  }

  // Title band.
  const band = titleBandRect(state.layoutId, width, height);
  const bg = ctx.createLinearGradient(0, band.y, 0, band.y + band.h);
  bg.addColorStop(0, grade.band[0]);
  bg.addColorStop(1, grade.band[1]);
  ctx.fillStyle = bg;
  ctx.fillRect(band.x, band.y, band.w, band.h);
  ctx.fillStyle = grade.bandAccent;
  ctx.fillRect(band.x, band.y, band.w, Math.max(3, 5 * scale));

  const pad = Math.round(28 * scale);
  const titleY = band.y + Math.round(band.h * 0.50);
  const titleSize = drawBigTitle(
    ctx, (state.title || 'VICE HEAT').toUpperCase(),
    band.x + pad, titleY, band.w - pad * 2 - Math.round(150 * scale), band.h, grade,
  );

  // Neon script subtitle, tilted, tucked under the title.
  if (state.subtitle) {
    ctx.save();
    ctx.translate(band.x + pad + Math.round(8 * scale), band.y + Math.round(band.h * 0.80));
    ctx.rotate(-0.045);
    ctx.font = `${Math.round(titleSize * 0.36)}px Pacifico, cursive`;
    ctx.textBaseline = 'middle';
    ctx.shadowColor = grade.titleBottom;
    ctx.shadowBlur = Math.round(18 * scale);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(state.subtitle, 0, 0);
    ctx.restore();
  }

  // Tagline bar, bottom-right of the band.
  if (state.tagline) {
    ctx.save();
    const tagSize = Math.max(13, Math.round(24 * scale));
    ctx.font = `600 ${tagSize}px Oswald, sans-serif`;
    const tw = ctx.measureText(state.tagline.toUpperCase()).width;
    const bx = band.x + band.w - pad - tw - Math.round(26 * scale);
    const by = band.y + band.h - Math.round(46 * scale);
    ctx.fillStyle = '#0a0612';
    ctx.fillRect(bx, by, tw + Math.round(26 * scale), Math.round(34 * scale));
    ctx.fillStyle = '#ffd319';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.tagline.toUpperCase(), bx + Math.round(13 * scale), by + Math.round(18 * scale));
    ctx.restore();
  }

  // Small credit line, bottom-left.
  ctx.save();
  ctx.font = `500 ${Math.max(11, Math.round(13 * scale))}px Oswald, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.textBaseline = 'middle';
  ctx.fillText('A VICE HEAT ORIGINAL  •  MADE WITH VICE HEAT COVER STUDIO', band.x + pad, band.y + band.h - Math.round(13 * scale));
  ctx.restore();

  // Thin frame around the whole poster.
  ctx.strokeStyle = '#0a0612';
  ctx.lineWidth = Math.max(4, Math.round(8 * scale));
  ctx.strokeRect(0, 0, width, height);
}

// Render the cover at its export size and return the canvas.
export function renderCover(state, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  drawCover(canvas.getContext('2d', { willReadFrequently: true }), state, width, height);
  return canvas;
}

// Load the display fonts, then call back. The app never draws text
// before the fonts are ready, or the lettering falls back to a
// system sans and the cover looks wrong.
export async function ensureCoverFonts() {
  try {
    await Promise.all([
      document.fonts.load('400 80px Anton'),
      document.fonts.load('400 60px Pacifico'),
      document.fonts.load('600 24px Oswald'),
      document.fonts.load('500 15px Oswald'),
    ]);
    await document.fonts.ready;
  } catch (err) {
    // A font that fails still leaves a usable fallback; keep going.
    console.warn('cover fonts did not all load', err);
  }
}
