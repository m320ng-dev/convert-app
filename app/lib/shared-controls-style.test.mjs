import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

test('shared productivity controls expose reusable button variants', () => {
  for (const selector of [
    '.app-button',
    '.app-button-primary',
    '.app-button-secondary',
    '.app-button-ghost',
  ]) {
    assert.match(css, new RegExp(selector.replace('.', '\\.')));
  }

  assert.match(css, /min-height:\s*2\.5rem/);
  assert.match(css, /focus-visible/);
  assert.match(css, /disabled/);
});

test('shared productivity controls style form fields and selection controls', () => {
  for (const selector of [
    '.app-field',
    '.app-field-mono',
    '.app-check-row',
    '.app-check-input',
    '.app-range',
    '.app-error-message',
  ]) {
    assert.match(css, new RegExp(selector.replace('.', '\\.')));
  }

  assert.match(css, /accent-color:\s*var\(--app-color-brand\)/);
  assert.match(css, /border-color:\s*var\(--app-color-danger\)/);
});

test('shared productivity surfaces define panels, cards, and tool list hierarchy', () => {
  for (const selector of [
    '.app-page-shell',
    '.app-page-container',
    '.app-layout-grid',
    '.app-workspace-grid',
    '.app-panel',
    '.app-panel-hero',
    '.app-panel-header',
    '.app-panel-body',
    '.app-panel-section',
    '.app-card',
    '.app-card-interactive',
    '.app-stat-row',
    '.app-chip',
    '.app-tool-list',
    '.app-tool-group-heading',
    '.app-tool-row',
    '.app-tool-badge',
  ]) {
    assert.match(css, new RegExp(selector.replace('.', '\\.')));
  }

  assert.match(css, /grid-template-columns:\s*16\.25rem minmax\(0, 1fr\)/);
  assert.match(css, /box-shadow:\s*var\(--app-shadow-md\)/);
  assert.match(css, /transform:\s*translateY\(-1px\)/);
});
