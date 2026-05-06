import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const convertersSource = readFileSync(
  resolve(import.meta.dirname, './converters.ts'),
  'utf8',
);

test('Regex 테스트 도구가 API 분류와 /converters 라우트로 등록된다', () => {
  assert.match(convertersSource, /id: 'regex-tester'/);
  assert.match(convertersSource, /title: 'Regex 테스트 도구'/);
  assert.match(convertersSource, /path: '\/converters\/regex-tester'/);
  assert.match(convertersSource, /group: 'API'/);
});
