import test from 'node:test';
import assert from 'node:assert/strict';

import {
  formatUuidUlidResults,
  generateUlid,
  generateUuid,
  generateUuidUlidResults,
  validateUuid,
} from './uuid-ulid.ts';

function createDeterministicCrypto() {
  let value = 0;

  return {
    getRandomValues(bytes) {
      for (let index = 0; index < bytes.length; index += 1) {
        bytes[index] = value % 256;
        value += 17;
      }

      return bytes;
    },
  };
}

test('UUID v4는 브라우저 crypto 값으로 RFC 4122 버전과 variant를 맞춰 생성한다', () => {
  const uuid = generateUuid(createDeterministicCrypto());

  assert.match(
    uuid,
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
});

test('ULID는 지정 시각과 브라우저 crypto 값으로 정렬 가능한 26자 식별자를 만든다', () => {
  const ulid = generateUlid({
    crypto: createDeterministicCrypto(),
    now: () => 1_766_800_000_000,
  });

  assert.match(ulid, /^[0-9A-HJKMNP-TV-Z]{26}$/);
  assert.equal(ulid.slice(0, 10), '01KDEQS100');
});

test('UUID/ULID 결과 세트는 복사 가능한 줄 단위 문자열로 포맷된다', () => {
  const result = generateUuidUlidResults({
    kind: 'both',
    quantity: 1,
    crypto: createDeterministicCrypto(),
    now: () => 1_766_800_000_000,
  });

  assert.equal(result.items.length, 2);
  assert.equal(result.items[0].label, 'UUID v4');
  assert.equal(result.items[1].label, 'ULID');
  assert.equal(formatUuidUlidResults(result.items), `${result.items[0].value}\n${result.items[1].value}`);
});

test('UUID/ULID 생성 개수와 종류 오류는 한국어 메시지로 보고한다', () => {
  assert.throws(
    () =>
      generateUuidUlidResults({
        kind: 'uuid',
        quantity: 0,
        crypto: createDeterministicCrypto(),
      }),
    /생성 개수는 1~100개 사이로 입력해주세요/,
  );

  assert.throws(
    () =>
      generateUuidUlidResults({
        kind: 'bad-kind',
        quantity: 1,
        crypto: createDeterministicCrypto(),
      }),
    /생성할 식별자 종류를 확인해주세요/,
  );
});

test('UUID 검증은 유효한 UUID의 버전과 variant를 한국어 결과로 반환한다', () => {
  const result = validateUuid('  F47AC10B-58CC-4372-A567-0E02B2C3D479  ');

  assert.equal(result.isValid, true);
  assert.equal(result.normalized, 'f47ac10b-58cc-4372-a567-0e02b2c3d479');
  assert.equal(result.version, 4);
  assert.equal(result.variant, 'RFC 4122');
  assert.equal(result.message, '유효한 UUID v4 형식입니다.');
});

test('UUID 검증은 빈 입력과 잘못된 형식을 한국어 오류로 보고한다', () => {
  assert.throws(
    () => validateUuid(''),
    /검증할 UUID를 입력해주세요/,
  );

  const result = validateUuid('not-a-uuid');

  assert.equal(result.isValid, false);
  assert.equal(result.message, 'UUID 형식이 아닙니다. 8-4-4-4-12 하이픈 형식을 확인해주세요.');
});
