import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  getActiveGlobalNavigationItemId,
  globalNavigationItems,
} from './app-shell.ts';

const navigationSource = readFileSync(
  resolve(import.meta.dirname, '../components/tool-navigation.tsx'),
  'utf8',
);

test('global navigation defines desktop route destinations', () => {
  assert.deepEqual(
    globalNavigationItems.map((item) => item.id),
    ['home', 'tools', 'privacy', 'workflow'],
  );

  assert.deepEqual(
    globalNavigationItems.map((item) => item.href),
    ['/', '/#tools', '/#privacy', '/#workflow'],
  );

  assert.ok(globalNavigationItems.every((item) => item.description.length > 0));
});

test('global navigation marks active routes for home and converter pages', () => {
  assert.equal(getActiveGlobalNavigationItemId('/'), 'home');
  assert.equal(getActiveGlobalNavigationItemId('/converters/json-formatter'), 'tools');
  assert.equal(getActiveGlobalNavigationItemId('/converters/jwt-decoder'), 'tools');
  assert.equal(getActiveGlobalNavigationItemId('/unknown'), null);
});

test('converter desktop navigation renders global links with active page state', () => {
  assert.match(navigationSource, /aria-label="전역 탐색"/);
  assert.match(navigationSource, /md:flex/);
  assert.match(navigationSource, /globalNavigationItems\.map/);
  assert.match(navigationSource, /aria-current=\{isGlobalActive \? 'page' : undefined\}/);
  assert.match(navigationSource, /app-global-nav-link-active/);
});

test('converter tool navigation renders ordered registry links with active tool state', () => {
  assert.match(navigationSource, /getToolNavigationItems/);
  assert.match(navigationSource, /toolNavigationItems\.map/);
  assert.match(navigationSource, /href=\{tool\.href\}/);
  assert.match(navigationSource, /aria-current=\{isActive \? 'page' : undefined\}/);
  assert.match(navigationSource, /getToolByPath\(pathname\)/);
});
