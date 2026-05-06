import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const jwtPageSource = readFileSync(
  resolve(import.meta.dirname, '../converters/jwt-decoder/page.tsx'),
  'utf8',
);

test('JWT verification UI exposes signature, time, issuer, audience, and subject settings', () => {
  assert.match(jwtPageSource, /검증 알고리즘 설정/);
  assert.match(jwtPageSource, /검증 키: \{validationAlgorithmOption\.validationKeyLabel\}/);
  assert.match(jwtPageSource, /Clock tolerance \(초\)/);
  assert.match(jwtPageSource, /Expected issuer \(iss\)/);
  assert.match(jwtPageSource, /Expected audience \(aud\)/);
  assert.match(jwtPageSource, /Expected subject \(sub\)/);
  assert.match(jwtPageSource, /Expected custom claims JSON/);
  assert.match(jwtPageSource, /서명, 시간, issuer, audience, subject, custom claim 검증/);
});

test('JWT verification action passes configured signature, time, and expected claim options', () => {
  assert.match(jwtPageSource, /algorithms: validationAlgorithm === 'auto' \? undefined : \[validationAlgorithm\]/);
  assert.match(jwtPageSource, /secret: validationSecret/);
  assert.match(jwtPageSource, /key: validationSecret/);
  assert.match(jwtPageSource, /clockToleranceSeconds: parsedClockTolerance/);
  assert.match(jwtPageSource, /expectedIssuer/);
  assert.match(jwtPageSource, /expectedAudience/);
  assert.match(jwtPageSource, /expectedSubject/);
  assert.match(jwtPageSource, /expectedCustomClaims: parsedExpectedCustomClaims/);
});

test('JWT verification UI reports explicit signature pass and fail states', () => {
  assert.match(jwtPageSource, /verificationState/);
  assert.match(jwtPageSource, /JWT 서명 검증 통과/);
  assert.match(jwtPageSource, /JWT 서명 검증 실패/);
  assert.match(jwtPageSource, /검증 secret 또는 public key가 토큰을 발급할 때 사용한 값과 같은지 확인해주세요/);
});

test('JWT verification UI parses custom claim JSON with Korean validation feedback', () => {
  assert.match(jwtPageSource, /parseExpectedCustomClaimsJson/);
  assert.match(jwtPageSource, /Expected custom claims JSON은 JSON 객체여야 합니다/);
  assert.match(jwtPageSource, /Expected custom claims JSON을 파싱할 수 없습니다/);
});
