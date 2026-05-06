import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const jwtPageSource = readFileSync(
  resolve(import.meta.dirname, '../converters/jwt-decoder/page.tsx'),
  'utf8',
);

test('JWT generator renders generated output with copy and reset controls', () => {
  assert.match(jwtPageSource, /<h3[^>]*>생성 결과<\/h3>/);
  assert.match(jwtPageSource, /value=\{generatedToken\}/);
  assert.match(jwtPageSource, /copiedMessage="생성된 JWT를 복사했습니다\."/);
  assert.match(jwtPageSource, /emptyMessage="복사할 생성 결과가 없습니다\."/);
  assert.match(jwtPageSource, /onClick=\{handleResetGeneratedResult\}/);
  assert.match(jwtPageSource, /생성 결과 초기화/);
  assert.match(jwtPageSource, /생성 입력 초기화/);
});

test('JWT generator reset restores default signing state and clears output feedback', () => {
  assert.match(jwtPageSource, /const handleClearGenerator = \(\) => \{/);
  assert.match(jwtPageSource, /setAlgorithm\('HS256'\)/);
  assert.match(jwtPageSource, /setGeneratorError\(null\)/);
  assert.match(jwtPageSource, /setGeneratorMessage\(null\)/);
});

test('JWT generator exposes generation-specific Korean success and error states near the result', () => {
  assert.match(jwtPageSource, /const \[generatorError, setGeneratorError\]/);
  assert.match(jwtPageSource, /const \[generatorMessage, setGeneratorMessage\]/);
  assert.match(jwtPageSource, /JWT를 생성하는 중 오류가 발생했습니다\./);
  assert.match(jwtPageSource, /role="alert"/);
  assert.match(jwtPageSource, /role="status"/);
});
