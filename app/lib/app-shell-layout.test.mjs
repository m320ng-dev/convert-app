import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve(import.meta.dirname, '../globals.css'), 'utf8');
const homeSource = readFileSync(resolve(import.meta.dirname, '../page.tsx'), 'utf8');
const navigationSource = readFileSync(
  resolve(import.meta.dirname, '../components/tool-navigation.tsx'),
  'utf8',
);
const workspaceSource = readFileSync(
  resolve(import.meta.dirname, '../components/tool-workspace-shell.tsx'),
  'utf8',
);

test('global shell exposes responsive spacing tokens for mobile and desktop layouts', () => {
  assert.match(css, /--app-shell-container-max:\s*80rem/);
  assert.match(css, /--app-shell-gutter:\s*clamp\(0\.875rem,\s*4vw,\s*1rem\)/);
  assert.match(css, /--app-shell-section-gap:\s*clamp\(1rem,\s*4vw,\s*1\.25rem\)/);
  assert.match(css, /--app-shell-panel-padding:\s*clamp\(1rem,\s*4vw,\s*1\.25rem\)/);

  assert.match(
    css,
    /@media\s*\(min-width:\s*640px\)\s*{[^}]*:root\s*{[^}]*--app-shell-gutter:\s*1\.5rem[^}]*--app-shell-section-gap:\s*1\.5rem[^}]*--app-shell-panel-padding:\s*1\.5rem/s,
  );
  assert.match(
    css,
    /@media\s*\(min-width:\s*1024px\)\s*{[^}]*:root\s*{[^}]*--app-shell-gutter:\s*2rem[^}]*--app-shell-section-gap:\s*1\.5rem/s,
  );
});

test('global shell containers centralize width and responsive gutters', () => {
  assert.match(css, /\.app-shell-container\s*{[^}]*max-width:\s*var\(--app-shell-container-max\)/s);
  assert.match(css, /\.app-shell-container\s*{[^}]*padding-inline:\s*var\(--app-shell-gutter\)/s);
  assert.match(css, /\.app-shell-main\s*{[^}]*padding-block:\s*var\(--app-shell-main-padding-block\)/s);
  assert.match(css, /\.app-layout-grid\s*{[^}]*gap:\s*var\(--app-shell-section-gap\)/s);
  assert.match(css, /\.app-stack\s*{[^}]*gap:\s*var\(--app-shell-section-gap\)/s);
  assert.match(css, /\.app-panel-body\s*{[^}]*padding:\s*var\(--app-shell-panel-padding\)/s);
});

test('first screen and tool workspace use the shared shell container utilities', () => {
  assert.match(homeSource, /className="app-shell-container/);
  assert.match(homeSource, /className="app-shell-main app-shell-container app-layout-grid"/);
  assert.match(navigationSource, /className="app-shell-container/);
  assert.match(workspaceSource, /className="app-shell-main app-shell-container app-workspace-grid"/);
});

test('mobile navigation uses an explicit touch-friendly disclosure menu', () => {
  assert.match(navigationSource, /useState\(false\)/);
  assert.match(navigationSource, /aria-expanded=\{isMobileMenuOpen\}/);
  assert.match(navigationSource, /aria-controls="mobile-tool-menu"/);
  assert.match(navigationSource, /id="mobile-tool-menu"/);
  assert.match(navigationSource, /className=\{`app-mobile-tool-menu/);
  assert.match(navigationSource, /getToolNavigationItems/);
  assert.match(navigationSource, /toolNavigationItems\.map/);
});

test('mobile shell CSS defines minimum touch targets and compact small-screen rows', () => {
  assert.match(css, /--app-touch-target:\s*2\.75rem/);
  assert.match(css, /\.app-mobile-nav-link\s*{[^}]*min-height:\s*var\(--app-touch-target\)/s);
  assert.match(css, /\.app-mobile-tool-menu\s*{[^}]*max-height:\s*min\(65vh,\s*28rem\)/s);
  assert.match(css, /@media\s*\(max-width:\s*639px\)/);
  assert.match(css, /\.app-tool-row\s*{[^}]*grid-template-columns:\s*2\.75rem\s+minmax\(0,\s*1fr\)/s);
  assert.match(css, /\.app-tool-row-action\s*{[^}]*grid-column:\s*1\s*\/\s*-1/s);
});
