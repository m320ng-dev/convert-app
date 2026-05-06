import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve(import.meta.dirname, '../globals.css'), 'utf8');
const homeSource = readFileSync(resolve(import.meta.dirname, '../page.tsx'), 'utf8');
const appShellSource = readFileSync(
  resolve(import.meta.dirname, '../components/AppShell.tsx'),
  'utf8',
);
const workspaceSource = readFileSync(
  resolve(import.meta.dirname, '../components/tool-workspace-shell.tsx'),
  'utf8',
);

test('전역 셸은 모바일 헤더와 데스크톱 사이드바 레이아웃을 제공한다', () => {
  assert.match(appShellSource, /lg:hidden/);
  assert.match(appShellSource, /aria-label="사이드바 열기"/);
  assert.match(appShellSource, /aria-expanded=\{isOpen\}/);
  assert.match(appShellSource, /fixed inset-y-0 left-0/);
  assert.match(appShellSource, /lg:translate-x-0/);
  assert.match(appShellSource, /lg:pl-72/);
});

test('전역 셸은 등록된 converter 그룹과 라우트 링크를 렌더링한다', () => {
  assert.match(appShellSource, /converterGroups\.map/);
  assert.match(appShellSource, /converters\s*\n\s*\.filter\(\(converter\) => converter\.group === group\)/);
  assert.match(appShellSource, /href=\{converter\.path\}/);
  assert.match(appShellSource, /pathname === converter\.path/);
  assert.match(appShellSource, /currentTool = converters\.find\(\(converter\) => converter\.path === pathname\)/);
});

test('첫 화면과 도구 작업 영역은 카드 목록과 작업 영역 컨테이너를 제공한다', () => {
  assert.match(homeSource, /browserLocalToolCatalog\.map\(\(converter\) =>/);
  assert.match(homeSource, /href=\{converter\.href\}/);
  assert.match(homeSource, /data-tool-id=\{converter\.id\}/);
  assert.match(workspaceSource, /className="app-shell-main app-shell-container app-workspace-grid"/);
});

test('도구 작업 영역은 실행 화면 간 전환 링크를 제공한다', () => {
  assert.match(workspaceSource, /getToolNavigationItems/);
  assert.doesNotMatch(workspaceSource, /toolNavigationItems\.slice\(/);
  assert.match(workspaceSource, /toolNavigationItems\.map/);
  assert.match(workspaceSource, /href=\{tool\.href\}/);
  assert.match(workspaceSource, /aria-current=\{isActive \? 'page' : undefined\}/);
});

test('전역 스타일은 대시보드 콘텐츠가 실행 화면 안에 자연스럽게 들어오도록 보정한다', () => {
  assert.match(css, /\.dashboard-content > \.min-h-screen/);
  assert.match(css, /\.dashboard-content \.max-w-4xl/);
  assert.match(css, /\.dashboard-content h1:not\(header h1\)/);
  assert.match(css, /\.dashboard-content textarea/);
  assert.match(css, /\.dashboard-content pre/);
});
