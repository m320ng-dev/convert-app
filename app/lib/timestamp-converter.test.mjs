import test from 'node:test';
import assert from 'node:assert/strict';

import { convertTimestampText } from './timestamp-converter.ts';

test('Unix timestamp를 UTC, 로컬 시간, 초, 밀리초 결과로 변환한다', () => {
  const result = convertTimestampText('1704067200', 'timestamp-to-date');

  assert.match(result, /UTC ISO: 2024-01-01T00:00:00\.000Z/);
  assert.match(result, /로컬 시간: /);
  assert.match(result, /Unix seconds: 1704067200/);
  assert.match(result, /Unix milliseconds: 1704067200000/);
});

test('밀리초 단위 Unix timestamp도 같은 날짜 결과로 변환한다', () => {
  const result = convertTimestampText('1704067200000', 'timestamp-to-date');

  assert.match(result, /UTC ISO: 2024-01-01T00:00:00\.000Z/);
  assert.match(result, /Unix seconds: 1704067200/);
  assert.match(result, /Unix milliseconds: 1704067200000/);
});

test('날짜 문자열을 초와 밀리초 timestamp가 포함된 결과로 변환한다', () => {
  const result = convertTimestampText('2024-01-01T00:00:00Z', 'date-to-timestamp');

  assert.match(result, /UTC ISO: 2024-01-01T00:00:00\.000Z/);
  assert.match(result, /Unix seconds: 1704067200/);
  assert.match(result, /Unix milliseconds: 1704067200000/);
});

test('잘못된 timestamp와 날짜 입력은 한국어 오류로 거부한다', () => {
  assert.throws(
    () => convertTimestampText('not-a-number', 'timestamp-to-date'),
    /유효한 Unix timestamp 숫자를 입력해주세요\./,
  );

  assert.throws(
    () => convertTimestampText('not-a-date', 'date-to-timestamp'),
    /유효한 날짜 문자열을 입력해주세요\./,
  );
});
