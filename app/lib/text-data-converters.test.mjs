import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  convertBase64Text,
  formatJsonText,
  minifyJsonText,
  timestampToDateTimeLocal,
  dateTimeLocalToTimestamp,
} from './text-data-converters.ts';

function readSource(relativePath) {
  return readFileSync(resolve(import.meta.dirname, relativePath), 'utf8');
}

test('JSON 텍스트를 포맷팅하고 압축하며 오류 메시지를 한국어로 제공한다', () => {
  assert.equal(formatJsonText('{"name":"convertapp","tags":["dev","local"]}'), [
    '{',
    '  "name": "convertapp",',
    '  "tags": [',
    '    "dev",',
    '    "local"',
    '  ]',
    '}',
  ].join('\n'));
  assert.equal(minifyJsonText('{\n  "name": "convertapp"\n}'), '{"name":"convertapp"}');
  assert.throws(() => formatJsonText('{bad json}'), /JSON 파싱에 실패했습니다/);
});

test('Base64 텍스트 변환은 유니코드와 잘못된 입력을 브라우저 로컬로 처리한다', () => {
  const encoded = convertBase64Text('한글 dev tools', 'encode');

  assert.equal(encoded, '7ZWc6riAIGRldiB0b29scw==');
  assert.equal(convertBase64Text(encoded, 'decode'), '한글 dev tools');
  assert.throws(() => convertBase64Text('%%%잘못된 값', 'decode'), /Base64 디코딩에 실패했습니다/);
});

test('Timestamp와 날짜 문자열을 왕복 변환한다', () => {
  assert.equal(timestampToDateTimeLocal('1704067200'), '2024-01-01T00:00:00');
  assert.equal(timestampToDateTimeLocal('1704067200000'), '2024-01-01T00:00:00');
  assert.equal(dateTimeLocalToTimestamp('2024-01-01T00:00:00'), '1704067200');
  assert.throws(() => timestampToDateTimeLocal('abc'), /유효한 Unix timestamp/);
  assert.throws(() => dateTimeLocalToTimestamp('not-a-date'), /유효한 날짜/);
});

test('텍스트/데이터 변환 계열 도구는 실행 화면과 복사 가능한 결과 패널을 제공한다', () => {
  const pages = [
    {
      path: '../converters/json-formatter/page.tsx',
      input: /id="json-formatter-input"/,
      result: /copyValue=\{copyValue\}/,
      empty: /copyEmptyMessage="복사할 JSON 결과가 없습니다\."/,
    },
    {
      path: '../converters/base64-converter/page.tsx',
      input: /id="base64-converter-input"/,
      result: /copyValue=\{copyValue\}/,
      empty: /copyEmptyMessage="복사할 Base64 변환 결과가 없습니다\."/,
    },
    {
      path: '../converters/timestamp-converter/page.tsx',
      input: /id="timestamp-converter-input"/,
      result: /copyValue=\{copyValue\}/,
      empty: /copyEmptyMessage="복사할 Timestamp 변환 결과가 없습니다\."/,
    },
  ];

  for (const page of pages) {
    const pagePath = resolve(import.meta.dirname, page.path);
    assert.equal(existsSync(pagePath), true, `${page.path} 페이지가 있어야 합니다.`);

    const source = readSource(page.path);

    assert.match(source, /<TextToolInput/);
    assert.match(source, page.input);
    assert.match(source, /<ResultsPanel/);
    assert.match(source, page.result);
    assert.match(source, page.empty);
    assert.match(source, /외부 API 없이 브라우저/);
    assert.match(source, /로컬 처리/);
  }
});
