import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { browserLocalToolCatalog } from './converters.ts';
import { getToolByPath, getToolNavigationItems, tools } from './tool-registry.ts';

const homeSource = readFileSync(resolve(import.meta.dirname, '../page.tsx'), 'utf8');

const requiredNewToolIds = [
  'random-token-generator',
  'uuid-ulid-generator',
  'url-encoder-decoder',
  'jwt-decoder',
  'regex-tester',
  'string-case-converter',
  'qr-code-generator',
  'json-formatter',
  'base64-converter',
  'timestamp-converter',
  'sql-formatter',
  'svg-to-react',
];

test('신규 브라우저 로컬 도구는 검색 가능한 카드 텍스트와 링크 메타데이터로 노출된다', () => {
  for (const toolId of requiredNewToolIds) {
    const catalogTool = browserLocalToolCatalog.find((tool) => tool.id === toolId);
    const listedTool = tools.find((tool) => tool.id === toolId);

    assert.ok(catalogTool, `${toolId} 카탈로그 항목이 있어야 한다`);
    assert.ok(listedTool, `${toolId} 도구 목록 항목이 있어야 한다`);
    assert.equal(listedTool.href, catalogTool.path);
    assert.equal(listedTool.label, catalogTool.shortTitle);
    assert.equal(listedTool.localOnly, true);
    assert.equal(listedTool.hasCopyButton, true);
    assert.ok(listedTool.title.length > 0, `${toolId} 검색 제목이 있어야 한다`);
    assert.ok(listedTool.description.length > 0, `${toolId} 검색 설명이 있어야 한다`);
    assert.ok(listedTool.group.length > 0, `${toolId} 검색 분류명이 있어야 한다`);
    assert.ok(listedTool.shortcut.length > 0, `${toolId} 단축 표시가 있어야 한다`);
  }
});

test('신규 도구 카드 텍스트는 제목, 설명, 메타 정보 역할을 분리한다', () => {
  assert.match(homeSource, /<p className="app-tool-row-eyebrow">\{converter\.group\}<\/p>/);
  assert.match(homeSource, /<h3 className="app-tool-row-title">/);
  assert.match(homeSource, /<p className="app-tool-row-description">\{converter\.description\}<\/p>/);
  assert.match(homeSource, /<div className="app-tool-row-status">/);
  assert.match(homeSource, /<span>브라우저 로컬<\/span>/);
  assert.match(homeSource, /<span>복사 지원<\/span>/);

  for (const listedTool of tools) {
    assert.doesNotMatch(listedTool.title, /합니다\.$/, `${listedTool.id} 제목은 설명 문장이 아니라 도구명이어야 한다`);
    assert.match(listedTool.description, /다\.$/, `${listedTool.id} 설명은 기존 카드처럼 한 문장으로 끝나야 한다`);
    assert.doesNotMatch(
      listedTool.description,
      /브라우저|로컬|복사/,
      `${listedTool.id} 설명은 처리 방식 메타 정보와 중복되지 않아야 한다`,
    );
  }
});

test('신규 도구 카드는 기존 카드 그리드의 반응형 열 규칙 안에 렌더링된다', () => {
  assert.match(homeSource, /<div className="app-tool-list grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">/);
  assert.match(homeSource, /<div className="app-tool-list[^"]*">[\s\S]*\{visibleTools\.map\(\(converter\) => \(/);
  assert.match(homeSource, /<Link[\s\S]*className="app-tool-row group"/);

  assert.equal(tools.length, browserLocalToolCatalog.length);

  for (const toolId of requiredNewToolIds) {
    const listedTool = tools.find((tool) => tool.id === toolId);

    assert.ok(listedTool, `${toolId} 카드가 반응형 도구 그리드 데이터에 있어야 한다`);
  }
});

test('신규 도구 카드는 기존 도구 카드의 아이콘 배지와 액션 영역 구조를 재사용한다', () => {
  assert.match(homeSource, /<span[\s\S]*className=\{`app-tool-row-icon \$\{converter\.accent\}`\}/);
  assert.match(homeSource, /\{converter\.shortcut\}/);
  assert.match(
    homeSource,
    /<div className="flex min-w-0 items-center justify-between gap-4">[\s\S]*app-tool-row-icon[\s\S]*app-tool-row-action/s,
  );

  for (const toolId of requiredNewToolIds) {
    const listedTool = tools.find((tool) => tool.id === toolId);

    assert.ok(listedTool, `${toolId} 도구 목록 항목이 있어야 한다`);
    assert.ok(listedTool.shortcut.length > 0, `${toolId} 카드 아이콘 텍스트가 있어야 한다`);
    assert.match(listedTool.accent, /^bg-/, `${toolId} 카드 아이콘 색상 클래스가 있어야 한다`);
  }
});

test('신규 도구 카드 경로는 /converters/{id} 규칙과 라우트 역조회에 연결된다', () => {
  for (const toolId of requiredNewToolIds) {
    const expectedPath = `/converters/${toolId}`;
    const listedTool = tools.find((tool) => tool.id === toolId);

    assert.ok(listedTool, `${toolId} 도구 목록 항목이 있어야 한다`);
    assert.equal(listedTool.path, expectedPath);
    assert.equal(listedTool.href, expectedPath);
    assert.equal(getToolByPath(expectedPath)?.id, toolId);
  }
});

test('신규 도구 목록 정렬은 카탈로그 우선순위와 사용 순위를 일치시킨다', () => {
  assert.deepEqual(
    tools.map((tool) => tool.id),
    browserLocalToolCatalog.map((tool) => tool.id),
  );

  for (const [index, tool] of tools.entries()) {
    assert.equal(tool.priority, index + 1, `${tool.id} 우선순위가 목록 순서와 같아야 한다`);
    assert.equal(tool.usageRank, index + 1, `${tool.id} 사용 순위가 목록 순서와 같아야 한다`);
  }
});

test('신규 도구 분류는 홈 필터와 사이드 내비게이션 항목에 함께 포함된다', () => {
  const groupsByRequiredTool = new Set(
    requiredNewToolIds.map((toolId) => {
      const tool = tools.find((item) => item.id === toolId);
      assert.ok(tool, `${toolId} 도구가 있어야 한다`);
      return tool.group;
    }),
  );

  assert.ok(groupsByRequiredTool.has('보안'));
  assert.ok(groupsByRequiredTool.has('API'));
  assert.ok(groupsByRequiredTool.has('유틸리티'));

  assert.match(homeSource, /new Set\(tools\.map\(\(converter\) => converter\.group\)\)/);
  assert.match(homeSource, /tools\.filter\(\(converter\) => converter\.group === activeCategory\)/);
  assert.match(homeSource, /aria-label="도구 카테고리 필터"/);

  const navigationItems = getToolNavigationItems();
  for (const toolId of requiredNewToolIds) {
    const tool = tools.find((item) => item.id === toolId);
    const navigationItem = navigationItems.find((item) => item.id === toolId);

    assert.ok(tool, `${toolId} 도구가 있어야 한다`);
    assert.ok(navigationItem, `${toolId} 내비게이션 항목이 있어야 한다`);
    assert.equal(navigationItem.href, tool.path);
    assert.equal(navigationItem.label, tool.shortTitle);
  }
});
