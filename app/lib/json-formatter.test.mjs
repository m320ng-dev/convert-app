import test from 'node:test';
import assert from 'node:assert/strict';

import { formatJsonText } from './json-formatter.ts';

test('JSON 포맷터는 포맷팅, 압축, 검증 모드를 브라우저 로컬 로직으로 처리한다', () => {
  const input = '{"name":"convertapp","items":[1,true]}';

  assert.equal(
    formatJsonText(input, 'format'),
    '{\n  "name": "convertapp",\n  "items": [\n    1,\n    true\n  ]\n}',
  );
  assert.equal(formatJsonText(input, 'minify'), '{"name":"convertapp","items":[1,true]}');
  assert.equal(formatJsonText(input, 'validate'), '유효한 JSON입니다.');
});

test('JSON 포맷터는 빈 입력과 잘못된 JSON에 기본 오류 메시지를 제공한다', () => {
  assert.equal(formatJsonText('   ', 'format'), '');
  assert.throws(
    () => formatJsonText('{"name":}', 'validate'),
    /유효하지 않은 JSON 형식입니다/,
  );
});
