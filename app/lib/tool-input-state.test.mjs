import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  createToolInputState,
  parseToolNumberInput,
  updateToolInputValue,
} from './tool-input-state.ts';

test('공통 도구 입력 상태는 필드 값, 마지막 변경 필드, 변경 횟수를 함께 관리한다', () => {
  const state = createToolInputState({
    value: '',
    mode: 'encode',
  });

  const updated = updateToolInputValue(state, 'value', 'https://example.com?q=한글', 1710000000000);

  assert.equal(updated.values.value, 'https://example.com?q=한글');
  assert.equal(updated.values.mode, 'encode');
  assert.equal(updated.lastChangedField, 'value');
  assert.equal(updated.touchedFields.value, true);
  assert.equal(updated.revision, 1);
  assert.equal(updated.updatedAt, 1710000000000);
  assert.equal(state.values.value, '');
});

test('공통 도구 입력 상태는 연속 입력 변경을 즉시 현재 값으로 반영한다', () => {
  const initialState = createToolInputState({
    pattern: '',
    flags: 'g',
    testText: '',
  });

  const withPattern = updateToolInputValue(initialState, 'pattern', '[a-z]+', 1710000000001);
  const withText = updateToolInputValue(withPattern, 'testText', 'convertapp', 1710000000002);

  assert.deepEqual(withText.values, {
    pattern: '[a-z]+',
    flags: 'g',
    testText: 'convertapp',
  });
  assert.equal(withText.lastChangedField, 'testText');
  assert.equal(withText.revision, 2);
});

test('공통 도구 숫자 파서는 브라우저 number 입력 문자열을 로컬 실행용 숫자로 변환한다', () => {
  assert.equal(parseToolNumberInput('42', 10), 42);
  assert.equal(parseToolNumberInput(' 7 ', 10), 7);
  assert.equal(parseToolNumberInput('', 10), 10);
  assert.equal(parseToolNumberInput('abc', 10), 10);
});

const connectedToolPages = [
  '../converters/url-encoder-decoder/page.tsx',
  '../converters/regex-tester/page.tsx',
  '../converters/string-case-converter/page.tsx',
  '../converters/qr-code-generator/page.tsx',
  '../converters/html-entity-escaper/page.tsx',
];

for (const pagePath of connectedToolPages) {
  test(`${pagePath}는 공통 입력 상태 훅으로 입력 변경을 결과 계산에 연결한다`, () => {
    const source = readFileSync(resolve(import.meta.dirname, pagePath), 'utf8');

    assert.match(source, /useToolInputState/);
    assert.match(source, /inputState\.values/);
    assert.match(source, /setInputValue/);
  });
}

const numberInputToolPages = [
  '../converters/random-token-generator/page.tsx',
  '../converters/uuid-ulid-generator/page.tsx',
  '../converters/qr-code-generator/page.tsx',
];

for (const pagePath of numberInputToolPages) {
  test(`${pagePath}는 number 입력값을 공통 파서로 변환한 뒤 로컬 실행 함수에 전달한다`, () => {
    const source = readFileSync(resolve(import.meta.dirname, pagePath), 'utf8');

    assert.match(source, /parseToolNumberInput/);
    assert.doesNotMatch(source, /Number\(event\.target\.value\)/);
  });
}
