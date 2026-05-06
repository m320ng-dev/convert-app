import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  getActiveGlobalNavigationItemId,
  globalNavigationItems,
} from './app-shell.ts';
import { getToolNavigationItems } from './tool-registry.ts';

const appShellSource = readFileSync(
  resolve(import.meta.dirname, '../components/AppShell.tsx'),
  'utf8',
);
const workspaceSource = readFileSync(
  resolve(import.meta.dirname, '../components/tool-workspace-shell.tsx'),
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

test('앱 셸은 /converters 경로 도구를 사이드바 링크로 렌더링한다', () => {
  assert.match(appShellSource, /converterGroups\.map/);
  assert.match(appShellSource, /converters\s*\n\s*\.filter\(\(converter\) => converter\.group === group\)/);
  assert.match(appShellSource, /href=\{converter\.path\}/);
  assert.match(appShellSource, /pathname === converter\.path/);
  assert.match(appShellSource, /onClick=\{closeDrawer\}/);
});

test('도구 작업 영역은 레지스트리 링크로 다른 실행 화면에 이동한다', () => {
  assert.match(workspaceSource, /getToolNavigationItems/);
  assert.doesNotMatch(workspaceSource, /toolNavigationItems\.slice\(/);
  assert.match(workspaceSource, /toolNavigationItems\.map/);
  assert.match(workspaceSource, /href=\{tool\.href\}/);
  assert.match(workspaceSource, /aria-current=\{isActive \? 'page' : undefined\}/);
  assert.match(workspaceSource, /getToolByPath\(pathname\)/);

  const navigationItems = getToolNavigationItems();
  for (const item of navigationItems) {
    assert.match(item.href, /^\/converters\/[a-z0-9-]+$/);
  }
});
