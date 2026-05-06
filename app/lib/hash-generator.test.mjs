import test from 'node:test';
import assert from 'node:assert/strict';

import {
  generateHashResults,
  verifyHash,
  formatHashResultsForCopy,
} from './hash-generator.ts';

test('해시 생성기는 대표 알고리즘의 해시값을 브라우저 로컬 로직으로 생성한다', () => {
  const results = generateHashResults('convertapp', ['md5', 'sha1', 'sha256']);

  assert.deepEqual(
    results.map((result) => result.algorithm),
    ['MD5', 'SHA-1', 'SHA-256'],
  );
  assert.equal(results[0].hash, '34794cee55107cc41a0d5ac63739fd4b');
  assert.equal(results[1].hash, '25d7ab2c4e219d9fcbacc222f9ad7541ae326924');
  assert.equal(results[2].hash, '1265e989d4e2eee16419e70acfb3027b8dd96ca54625e251430bf88d2ff52841');
});

test('해시 검증은 대소문자와 공백 차이를 무시하고 일치 여부를 반환한다', () => {
  const verification = verifyHash({
    text: 'convertapp',
    algorithm: 'sha256',
    expectedHash: '  1265E989D4E2EEE16419E70ACFB3027B8DD96CA54625E251430BF88D2FF52841  ',
  });

  assert.deepEqual(verification, {
    algorithm: 'SHA-256',
    expectedHash: '1265e989d4e2eee16419e70acfb3027b8dd96ca54625e251430bf88d2ff52841',
    actualHash: '1265e989d4e2eee16419e70acfb3027b8dd96ca54625e251430bf88d2ff52841',
    isMatch: true,
    message: 'SHA-256 해시가 일치합니다.',
  });
});

test('해시 생성기는 빈 입력, 미선택 알고리즘, 지원하지 않는 알고리즘을 기본 오류로 차단한다', () => {
  assert.throws(
    () => generateHashResults('', ['sha256']),
    /해시를 생성할 텍스트를 입력해주세요/,
  );
  assert.throws(
    () => generateHashResults('convertapp', []),
    /하나 이상의 해시 알고리즘을 선택해주세요/,
  );
  assert.throws(
    () => generateHashResults('convertapp', ['sha999']),
    /지원하지 않는 해시 알고리즘입니다/,
  );
});

test('해시 결과 복사용 텍스트는 알고리즘 라벨과 값을 함께 제공한다', () => {
  const copyValue = formatHashResultsForCopy(generateHashResults('convertapp', ['sha256']));

  assert.equal(
    copyValue,
    'SHA-256: 1265e989d4e2eee16419e70acfb3027b8dd96ca54625e251430bf88d2ff52841',
  );
});
