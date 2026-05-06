import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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

test('first screen combined tool rows expose the expected shared usage order', () => {
  const expectedUsageOrder = [
    'json-formatter',
    'base64-converter',
    'jwt-decoder',
    'js-beautifier',
    'curl-to-code',
    'code-to-curl',
    'timestamp-converter',
    'regex-tester',
    'env-validator',
    'random-token-generator',
    'hash-generator',
    'sql-formatter',
    'html-to-markdown',
    'markdown-viewer',
    'svg-to-react',
    'image-to-base64',
    'base64-to-image',
    'ip-geolocation',
  ];

  assert.deepEqual(
    tools.map((tool) => tool.id),
    expectedUsageOrder,
  );
  assert.match(pageSource, /data-tool-id=\{converter\.id\}/);
  assert.match(pageSource, /data-usage-rank=\{converter\.usageRank\}/);
});
