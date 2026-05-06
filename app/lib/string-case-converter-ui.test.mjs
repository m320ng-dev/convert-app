import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pagePath = resolve(import.meta.dirname, '../converters/string-case-converter/page.tsx');

test('문자열 케이스 변환 도구는 명시적인 입력 영역과 기본 작업 레이아웃을 제공한다', () => {
  assert.equal(existsSync(pagePath), true, '문자열 케이스 변환 페이지가 있어야 합니다.');

  const source = readFileSync(pagePath, 'utf8');

  assert.match(source, /<form[^>]*aria-labelledby="string-case-input-heading"/);
  assert.match(source, /id="string-case-input-heading"/);
  assert.match(source, /<TextToolInput/);
  assert.match(source, /id="string-case-input"/);
  assert.match(source, /label="입력 문자열"/);
  assert.match(source, /onValueChange=\{setInput\}/);
  assert.match(source, /placeholder="예: user profile URL value, HTTPResponse_code-404Message"/);
  assert.match(source, /minHeightClassName="min-h-52"/);
  assert.match(source, /<span className="app-chip rounded-lg">로컬 처리<\/span>/);
  assert.match(source, /<ResultsPanel/);
  assert.match(source, /title="변환 결과"/);
  assert.match(source, /<ul[^>]*aria-label="문자열 케이스 변환 결과 목록"/);
  assert.match(source, /<li\s+key=\{row\.key\}/);
});
