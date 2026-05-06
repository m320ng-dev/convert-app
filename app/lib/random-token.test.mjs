import test from 'node:test';
import assert from 'node:assert/strict';

import {
  formatRandomTokenResults,
  generateRandomTokens,
} from './random-token.ts';

function createCryptoFromValues(values) {
  let index = 0;

  return {
    getRandomValues(bytes) {
      for (let byteIndex = 0; byteIndex < bytes.length; byteIndex += 1) {
        bytes[byteIndex] = values[index % values.length];
        index += 1;
      }

      return bytes;
    },
  };
}

test('토큰 생성은 선택한 문자 종류와 제외 옵션만 사용해 브라우저 crypto 값으로 만든다', () => {
  const tokens = generateRandomTokens({
    length: 8,
    quantity: 2,
    characterSets: {
      lowercase: false,
      uppercase: false,
      numbers: true,
      symbols: false,
    },
    excludeCharacters: '05',
    excludeAmbiguous: true,
    prefix: 'pin_',
    suffix: '_dev',
    cryptoSource: createCryptoFromValues([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
  });

  assert.equal(tokens.length, 2);
  for (const token of tokens) {
    assert.match(token, /^pin_[2-46789]{8}_dev$/);
  }
});

test('토큰 생성은 문자 풀 길이에 맞지 않는 난수 바이트를 버려 나머지 편향을 피한다', () => {
  const tokens = generateRandomTokens({
    length: 4,
    quantity: 1,
    characterSets: {
      lowercase: false,
      uppercase: false,
      numbers: true,
      symbols: false,
    },
    excludeCharacters: '',
    excludeAmbiguous: false,
    cryptoSource: createCryptoFromValues([250, 251, 9, 9, 9, 9]),
  });

  assert.deepEqual(tokens, ['9999']);
});

test('토큰 생성 결과는 복사용 줄바꿈, JSON, env, CSV 형식으로 포맷된다', () => {
  const tokens = ['abc', 'a"b'];

  assert.equal(formatRandomTokenResults(tokens, 'newline'), 'abc\na"b');
  assert.equal(formatRandomTokenResults(tokens, 'json'), '[\n  "abc",\n  "a\\"b"\n]');
  assert.equal(formatRandomTokenResults(tokens, 'env'), 'TOKEN_1=abc\nTOKEN_2=a"b');
  assert.equal(formatRandomTokenResults(tokens, 'csv'), '1,"abc"\n2,"a""b"');
});
