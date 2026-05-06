import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

import { decodeJwt, validateJwt } from './jwt-decoder.ts';
import {
  buildJwtPayloadFromClaims,
  generateJwt,
  validateJwtGeneratorJsonInputs,
} from './jwt-generator.ts';

test('JWT decoder rejects malformed token structures with focused Korean guidance', () => {
  assert.throws(
    () => decodeJwt('header.payload.signature.extra'),
    /JWT는 header\.payload\.signature 형식의 3개 구역으로 구성되어야 합니다/,
  );

  assert.throws(
    () => decodeJwt(`${encodeBase64Url('[]')}.${encodeBase64Url('{}')}.signature`),
    /JWT header 구역은 JSON 객체여야 합니다/,
  );

  assert.throws(
    () => decodeJwt(`${encodeBase64Url('{"alg":"HS256"}')}.@@@.signature`),
    /JWT payload 구역을 Base64URL로 디코딩할 수 없습니다/,
  );
});

test('JWT validation rejects invalid signatures and invalid verification key material', async () => {
  const token = signTestJwt({ alg: 'HS256', typ: 'JWT' }, { sub: '123' }, 'correct-secret');

  await assert.rejects(
    () => validateJwt(token, { secret: 'wrong-secret' }),
    /JWT 서명 검증 실패: 서명이 일치하지 않습니다/,
  );

  const rsaHeaderToken = `${encodeBase64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${encodeBase64Url(JSON.stringify({ sub: '123' }))}.signature`;

  await assert.rejects(
    () => validateJwt(rsaHeaderToken, { key: 'not a public key' }),
    /RSA 검증에 사용할 SPKI public key PEM을 확인해주세요/,
  );
});

test('JWT validation rejects unsupported verification options before signature work', async () => {
  const token = signTestJwt({ alg: 'HS256', typ: 'JWT' }, { sub: '123' }, 'secret');

  await assert.rejects(
    () => validateJwt(token, { algorithms: [], secret: 'secret' }),
    /검증할 JWT 알고리즘을 하나 이상 선택해주세요/,
  );

  await assert.rejects(
    () => validateJwt(token, { algorithms: ['ES256'], secret: 'secret' }),
    /지원하지 않는 JWT 검증 알고리즘 옵션입니다/,
  );

  await assert.rejects(
    () => validateJwt(token, { clockToleranceSeconds: 1.5, secret: 'secret' }),
    /JWT clock tolerance는 0 이상의 초 단위 정수여야 합니다/,
  );
});

test('JWT generator rejects invalid input before producing a token', async () => {
  await assert.rejects(
    () =>
      generateJwt({
        algorithm: 'HS256',
        headerJson: '',
        payloadJson: '{}',
        key: 'secret',
      }),
    /JWT header JSON을 입력해주세요/,
  );

  await assert.rejects(
    () =>
      generateJwt({
        algorithm: 'HS256',
        headerJson: '{}',
        payloadJson: 'null',
        key: 'secret',
      }),
    /JWT payload JSON을 파싱할 수 없습니다/,
  );

  assert.throws(
    () =>
      buildJwtPayloadFromClaims({
        basePayloadJson: '{}',
        standardClaims: {
          issuedAt: `${Number.MAX_SAFE_INTEGER + 1}`,
        },
        customClaimsJson: '{}',
      }),
    /issued-at 값은 안전한 Unix timestamp 범위 안에서 입력해주세요/,
  );

  const validation = validateJwtGeneratorJsonInputs({
    headerJson: '',
    payloadJson: 'null',
  });

  assert.equal(validation.valid, false);
  assert.match(validation.headerError, /JWT header JSON을 입력해주세요/);
  assert.match(validation.payloadError, /JWT payload JSON을 파싱할 수 없습니다/);
});

function signTestJwt(header, payload, secret, digest = 'sha256') {
  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac(digest, secret).update(signingInput).digest('base64url');

  return `${signingInput}.${signature}`;
}

function encodeBase64Url(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}
