import test from 'node:test';
import assert from 'node:assert/strict';

import { convertBase64Text } from './base64-codec.ts';

test('UTF-8 텍스트를 Base64로 인코딩하고 다시 디코딩한다', () => {
  const encoded = convertBase64Text('convertapp 로컬 도구', 'encode');

  assert.equal(encoded, 'Y29udmVydGFwcCDroZzsu6wg64+E6rWs');
  assert.equal(convertBase64Text(encoded, 'decode'), 'convertapp 로컬 도구');
});

test('줄바꿈과 공백이 섞인 Base64 입력도 붙여넣기 친화적으로 디코딩한다', () => {
  assert.equal(convertBase64Text('Y29u dmVy\ndGFwcA==', 'decode'), 'convertapp');
});

test('잘못된 Base64 입력은 한국어 기본 오류로 거부한다', () => {
  assert.throws(
    () => convertBase64Text('not valid %%', 'decode'),
    /Base64를 디코딩할 수 없습니다/,
  );
});
