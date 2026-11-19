// Vice Heat Cover Studio — the hand-in program for make.fun's
// "Make GTA 6 Cover Art" bounty (gta6-cover-art-01).
//
// The app itself is plain static files under app/: index.html plus
// its ES modules, fonts and sample photos, nothing fetched over the
// network, no build step. This program (Node 22, standard library
// only) copies app/ and screenshots/ next to this file into the
// grader's /output directory and writes /output/dossier.json with
// the vendored make.fun library, so the judge can read the entry.
//
// Serve the app locally with `node serve.ts`, then open
// http://localhost:8080. Outside the grader's container,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// Where the repository sits, and where the hand-in goes.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The dossier caps mirror the gate's own limits (see the kit's
// reference/gate.json): at most 4 screenshots at 256 KiB each, at
// most 993 files / 48 MiB under app/, and no app/ path over 1000
// bytes — app/ shares /output's 1000-entry cap with screenshots/
// and dossier.json itself, so the entry is kept well inside them.
const dossierLimits = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

function handIn() {
  const indexHtml = join(repoRoot, 'app', 'index.html');
  if (!existsSync(indexHtml)) {
    throw new Error(`hand-in refused: ${indexHtml} is missing — the app has no entry page`);
  }
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
  const shotsDir = join(outputDir, 'screenshots');
  mkdirSync(shotsDir, { recursive: true });
  if (existsSync(join(repoRoot, 'screenshots'))) {
    cpSync(join(repoRoot, 'screenshots'), shotsDir, { recursive: true });
  }
  writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, dossierLimits));
}

handIn();
