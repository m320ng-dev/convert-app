import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const regexTesterSource = readFileSync(
  resolve(import.meta.dirname, './regex-tester.ts'),
  'utf8',
);

test('Regex 테스트 로직은 매칭 수와 캡처 그룹 결과를 반환한다', () => {
  assert.match(regexTesterSource, /export function testRegexPattern/);
  assert.match(regexTesterSource, /matchCount: matches.length/);
  assert.match(regexTesterSource, /groups: match.slice\(1\)/);
});

test('Regex 테스트 로직은 전역 플래그가 없을 때도 첫 매칭만 반환한다', () => {
  assert.match(regexTesterSource, /flags.includes\('g'\)/);
  assert.match(regexTesterSource, /break;/);
});

test('Regex 테스트 로직은 잘못된 패턴 오류를 한글 메시지로 반환한다', () => {
  assert.match(regexTesterSource, /유효하지 않은 Regex 패턴입니다/);
  assert.match(regexTesterSource, /error instanceof Error/);
});

test('Regex 테스트 로직은 잘못된 플래그 오류를 패턴 오류와 구분해 반환한다', () => {
  assert.match(regexTesterSource, /유효하지 않은 Regex 플래그입니다/);
  assert.match(regexTesterSource, /errorField: 'flags'/);
  assert.match(regexTesterSource, /errorField: 'pattern'/);
});
