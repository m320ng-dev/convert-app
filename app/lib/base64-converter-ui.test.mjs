import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pagePath = resolve(import.meta.dirname, '../converters/base64-converter/page.tsx');
const convertersPath = resolve(import.meta.dirname, './converters.ts');

test('Base64 인코더 디코더 도구가 라우트와 브라우저 로컬 카탈로그에 등록된다', () => {
  assert.equal(existsSync(pagePath), true, 'Base64 변환 페이지가 있어야 합니다.');

  const convertersSource = readFileSync(convertersPath, 'utf8');

  assert.match(convertersSource, /id: 'base64-converter'/);
  assert.match(convertersSource, /path: '\/converters\/base64-converter'/);
  assert.match(convertersSource, /priority: 9/);
  assert.match(
    convertersSource,
    /mode: \{[\s\S]*?type: 'string'[\s\S]*?label: '인코딩 또는 디코딩 모드'[\s\S]*?required: true[\s\S]*?validation: \{ allowedValues: \['encode', 'decode'\] \}[\s\S]*?\}/,
  );
  assert.match(
    convertersSource,
    /value: \{ type: 'string', label: '텍스트 입력값', required: true, validation: \{ maxLength: 100000 \} \}/,
  );
  assert.match(convertersSource, /result: \{ type: 'string', label: 'Base64 변환 결과', required: true \}/);
  assert.match(convertersSource, /hasCopyButton: true as const/);
});

test('Base64 인코더 디코더 페이지는 입력, 결과, 복사, 기본 오류 메시지를 제공한다', () => {
  const source = readFileSync(pagePath, 'utf8');

  assert.match(source, /<TextToolInput/);
  assert.match(source, /id="base64-converter-input"/);
  assert.match(source, /label=\{mode === 'encode' \? '텍스트 입력' : 'Base64 입력'\}/);
  assert.match(source, /<ResultsPanel/);
  assert.match(source, /copyValue=\{copyValue\}/);
  assert.match(source, /copyLabel="결과 복사"/);
  assert.match(source, /copyEmptyMessage="복사할 Base64 변환 결과가 없습니다\."/);
  assert.match(source, /Base64 변환 중 오류가 발생했습니다\./);
  assert.match(source, /외부 API 없이 브라우저에서만 처리됩니다\./);
});
