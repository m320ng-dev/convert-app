import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve(import.meta.dirname, '../globals.css'), 'utf8');
const pageSource = readFileSync(resolve(import.meta.dirname, '../page.tsx'), 'utf8');

test('first screen shell contains horizontal overflow at the page boundary', () => {
  assert.match(css, /\.app-page-shell\s*{[^}]*overflow-x:\s*clip/s);
  assert.match(css, /\.app-page-container\s*{[^}]*box-sizing:\s*border-box/s);
  assert.match(css, /\.app-panel\s*{[^}]*max-width:\s*100%/s);
});

test('first screen controls can shrink or wrap on narrow mobile viewports', () => {
  assert.match(css, /\.app-button\s*{[^}]*max-width:\s*100%/s);
  assert.match(css, /@media\s*\(max-width:\s*360px\)\s*{[^}]*\.app-button\s*{[^}]*white-space:\s*normal/s);
  assert.match(pageSource, /className="[^"]*flex[^"]*min-w-0[^"]*items-center[^"]*justify-between/);
  assert.match(pageSource, /className="[^"]*app-button app-button-primary[^"]*w-full[^"]*sm:w-auto/);
  assert.match(pageSource, /className="[^"]*app-button app-button-secondary[^"]*w-full[^"]*sm:w-auto/);
});

