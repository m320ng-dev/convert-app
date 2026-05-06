import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pagePath = resolve(import.meta.dirname, '../converters/json-formatter/page.tsx');
const convertersPath = resolve(import.meta.dirname, './converters.ts');

test('JSON 포맷팅 검증 도구는 라우트와 로컬 처리 UI 기본 요소를 제공한다', () => {
  assert.equal(existsSync(pagePath), true, 'JSON 포맷터 페이지가 있어야 합니다.');

  const source = readFileSync(pagePath, 'utf8');

  assert.match(source, /id: 'validate'/);
  assert.match(source, /label: '검증'/);
  assert.match(source, /<TextToolInput/);
  assert.match(source, /id="json-formatter-input"/);
  assert.match(source, /label="JSON 입력"/);
  assert.match(source, /외부 API 없이 브라우저에서만 처리됩니다\./);
  assert.match(source, /<ResultsPanel/);
  assert.match(source, /copyValue=\{copyValue\}/);
  assert.match(source, /copyEmptyMessage="복사할 JSON 결과가 없습니다\."/);
});

test('JSON 포맷팅 검증 도구는 카탈로그 스키마에 모드와 결과 복사 형식을 명시한다', () => {
  const source = readFileSync(convertersPath, 'utf8');

  assert.match(source, /id: 'json-formatter'/);
  assert.match(source, /path: '\/converters\/json-formatter'/);
  assert.match(source, /group: '데이터'/);
  assert.match(source, /mode: \{ type: 'string', label: '처리 모드', required: true \}/);
  assert.match(source, /formattedJson: \{ type: 'string', label: 'JSON 처리 결과', required: true \}/);
  assert.match(source, /id: 'formatted-json'/);
  assert.match(source, /primary: true/);
  assert.match(source, /JSON 파싱 실패/);
});
