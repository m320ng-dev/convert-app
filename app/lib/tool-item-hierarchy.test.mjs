import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { converters } from './converters.ts';
import { tools } from './tool-registry.ts';

const pageSource = readFileSync(resolve(import.meta.dirname, '../page.tsx'), 'utf8');
const css = readFileSync(resolve(import.meta.dirname, '../globals.css'), 'utf8');

test('tool rows expose separate name, description, and status hierarchy', () => {
  for (const className of [
    'app-tool-row-eyebrow',
    'app-tool-row-title',
    'app-tool-row-description',
    'app-tool-row-status',
    'app-tool-row-action',
  ]) {
    assert.match(pageSource, new RegExp(className));
    assert.match(css, new RegExp(`\\.${className}\\s*{`));
  }

  assert.match(pageSource, /aria-label=\{`\$\{converter\.title\}: \$\{converter\.description\}`\}/);
  assert.match(pageSource, /브라우저 로컬/);
  assert.match(pageSource, /복사 지원/);
});

test('first screen exposes interactive category filtering alongside category jumps', () => {
  assert.match(pageSource, /useState<ToolCategoryFilter>/);
  assert.match(pageSource, /getFilteredTools\(activeCategory\)/);
  assert.match(pageSource, /aria-label="도구 카테고리 필터"/);
  assert.match(pageSource, /aria-pressed=\{activeCategory === 'all'\}/);
  assert.match(pageSource, /setActiveCategory\(item\.id\)/);
  assert.match(pageSource, /href=\{item\.href\}/);
  assert.match(pageSource, /id=\{categoryAnchorToolIds\.has\(converter\.id\)/);
});

test('main tool listing renders the shared usage-ordered tool source directly', () => {
  assert.match(pageSource, /visibleTools\.map\(\(converter\) =>/);
  assert.doesNotMatch(pageSource, /category\.tools\.map\(\(converter\) =>/);
});

test('first screen combined tool rows expose the converter registration order', () => {
  assert.deepEqual(
    tools.map((tool) => tool.id),
    converters.map((converter) => converter.id),
  );
  assert.match(pageSource, /data-tool-id=\{converter\.id\}/);
  assert.match(pageSource, /data-usage-rank=\{converter\.usageRank\}/);
});

test('new browser-local tool cards expose active status without disabling the existing link interaction', () => {
  assert.ok(tools.length >= 13);

  for (const tool of tools) {
    assert.equal(tool.status, 'active', `${tool.id} 카드는 활성 상태여야 한다`);
    assert.equal(tool.statusLabel, '사용 가능', `${tool.id} 카드는 활성 상태 라벨을 표시해야 한다`);
    assert.equal(tool.interactionState, 'enabled', `${tool.id} 카드는 기존 링크 상호작용을 유지해야 한다`);
  }

  assert.match(pageSource, /data-tool-status=\{converter\.status\}/);
  assert.match(pageSource, /data-interaction-state=\{converter\.interactionState\}/);
  assert.match(pageSource, /\{converter\.statusLabel\}/);
  assert.doesNotMatch(pageSource, /aria-disabled=\{true\}/);
});
