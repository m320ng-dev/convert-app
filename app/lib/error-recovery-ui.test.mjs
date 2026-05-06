import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const statefulErrorToolPages = [
  {
    path: '../converters/random-token-generator/page.tsx',
    clearFunction: 'clearGenerationError',
    retryHandler: 'handleGenerate',
    inputChangePattern: /onChange=\{\(event\) => \{[\s\S]*?clearGenerationError\(\)/,
  },
  {
    path: '../converters/uuid-ulid-generator/page.tsx',
    clearFunction: 'clearGeneratorError',
    retryHandler: 'handleGenerate',
    inputChangePattern: /onChange=\{\(event\) => \{[\s\S]*?clearGeneratorError\(\)/,
  },
  {
    path: '../converters/qr-code-generator/page.tsx',
    clearFunction: 'clearQrCodeError',
    retryHandler: 'handleGenerate',
    inputChangePattern: /function handleInputChange\([\s\S]*?clearQrCodeError\(\)[\s\S]*?onValueChange=\{handleInputChange\}/,
  },
];

for (const page of statefulErrorToolPages) {
  test(`${page.path}는 재시도 시작 시 기존 오류 메시지를 먼저 초기화한다`, () => {
    const source = readFileSync(resolve(import.meta.dirname, page.path), 'utf8');
    const retryFunctionPattern = new RegExp(`(?:const ${page.retryHandler} =|function ${page.retryHandler})[\\s\\S]*?${page.clearFunction}\\(\\)`);

    assert.match(source, retryFunctionPattern);
  });

  test(`${page.path}는 입력 변경 시 기존 오류 메시지를 초기화한다`, () => {
    const source = readFileSync(resolve(import.meta.dirname, page.path), 'utf8');

    assert.match(source, new RegExp(`function ${page.clearFunction}\\(\\)[\\s\\S]*?setError\\(null\\)`));
    assert.match(source, page.inputChangePattern);
  });
}

test('UUID 검증 입력은 실패 후 입력 변경 또는 재시도 시 검증 오류를 초기화한다', () => {
  const source = readFileSync(
    resolve(import.meta.dirname, '../converters/uuid-ulid-generator/page.tsx'),
    'utf8',
  );

  assert.match(source, /function clearValidationError\(\)[\s\S]*?setValidationError\(null\)/);
  assert.match(source, /const handleValidateUuid = \(\) => \{[\s\S]*?clearValidationError\(\)/);
  assert.match(source, /onChange=\{\(event\) => \{[\s\S]*?clearValidationError\(\)[\s\S]*?setUuidInput\(event\.target\.value\)/);
});
