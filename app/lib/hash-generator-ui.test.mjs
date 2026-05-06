import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const hashPageSource = readFileSync(
  resolve(import.meta.dirname, '../converters/hash-generator/page.tsx'),
  'utf8',
);
const catalogSource = readFileSync(resolve(import.meta.dirname, './converters.ts'), 'utf8');

test('해시 생성/검증 도구는 카탈로그 메타데이터와 보안 분류를 제공한다', () => {
  assert.match(catalogSource, /id: 'hash-generator'/);
  assert.match(catalogSource, /group: '보안'/);
  assert.match(catalogSource, /'hash-generator': \{/);
  assert.match(catalogSource, /priority: 16/);
  assert.match(catalogSource, /expectedHash: \{ type: 'string', label: '검증할 해시값'/);
  assert.match(catalogSource, /verification: \{ type: 'object', label: '해시 검증 결과'/);
  assert.match(catalogSource, /id: 'labeled-text'/);
});

test('해시 생성/검증 도구는 공용 결과 패널, 복사 액션, 검증 메시지를 사용한다', () => {
  assert.match(hashPageSource, /ResultsPanel/);
  assert.match(hashPageSource, /ToolValidationMessage/);
  assert.match(hashPageSource, /createInputValidationFailure/);
  assert.match(hashPageSource, /copyValue=\{copyValue\}/);
  assert.match(hashPageSource, /copyLabel="해시 결과 복사"/);
  assert.match(hashPageSource, /copyAriaLabel="해시 생성 및 검증 결과 복사"/);
  assert.match(hashPageSource, /copyCopiedMessage="해시 결과를 클립보드에 복사했습니다\."/);
  assert.match(hashPageSource, /copyEmptyMessage="복사할 해시 결과가 없습니다\."/);
  assert.match(hashPageSource, /검증할 해시값/);
  assert.match(hashPageSource, /해시 검증/);
});
