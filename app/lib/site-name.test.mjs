import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const appShellSource = readFileSync(resolve(import.meta.dirname, '../components/AppShell.tsx'), 'utf8');
const layoutSource = readFileSync(resolve(import.meta.dirname, '../layout.tsx'), 'utf8');
const appShellModelSource = readFileSync(resolve(import.meta.dirname, './app-shell.ts'), 'utf8');

test('사이트 표시명은 DevTools를 사용한다', () => {
  assert.doesNotMatch(appShellSource, /ConvertApp/);
  assert.doesNotMatch(layoutSource, /ConvertApp/);
  assert.doesNotMatch(appShellModelSource, /ConvertApp/);

  assert.match(appShellSource, /DevTools/);
  assert.match(layoutSource, /title: "DevTools"/);
  assert.match(appShellModelSource, /DevTools 첫 화면으로 이동/);
});
