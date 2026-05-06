import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

import { decodeJwt } from './jwt-decoder.ts';
import { generateJwt } from './jwt-generator.ts';

const knownValidHs256Jwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJkZXZlbG9wZXItMTIzIiwibmFtZSI6IuyZuOuPmeq4uCIsImlhdCI6MTcxMDAwMDAwMH0.' +
  'aSPoKN1kmeuNzktPMvYLHgAxoy1Wp07FNtsLH2fLFm4';

test('decodes a valid JWT into header, payload, and signature values', () => {
  const decoded = decodeJwt(knownValidHs256Jwt);

  assert.deepEqual(decoded.header, {
    alg: 'HS256',
    typ: 'JWT',
  });
  assert.deepEqual(decoded.payload, {
    sub: 'developer-123',
    name: '외동길',
    iat: 1710000000,
  });
  assert.equal(decoded.signature, 'aSPoKN1kmeuNzktPMvYLHgAxoy1Wp07FNtsLH2fLFm4');
});

test('decodes header and payload without validating the signature segment', () => {
  const token = `${toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${toBase64Url(JSON.stringify({ sub: 'local-only' }))}.not-a-real-signature+with-invalid-base64`;
  const decoded = decodeJwt(token);

  assert.deepEqual(decoded.header, {
    alg: 'HS256',
    typ: 'JWT',
  });
  assert.deepEqual(decoded.payload, {
    sub: 'local-only',
  });
  assert.equal(decoded.signature, 'not-a-real-signature+with-invalid-base64');
});

test('generates a valid HS256 JWT with the requested header and payload', async () => {
  const token = await generateJwt({
    algorithm: 'HS256',
    headerJson: '{ "typ": "JWT", "kid": "focused-test" }',
    payloadJson: '{ "sub": "developer-123", "scope": ["read", "write"] }',
    key: 'focused-secret',
  });
  const [encodedHeader, encodedPayload, signature] = token.split('.');
  const expectedSignature = createHmac('sha256', 'focused-secret')
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  assert.equal(signature, expectedSignature);
  assert.deepEqual(decodeJwt(token).header, {
    typ: 'JWT',
    kid: 'focused-test',
    alg: 'HS256',
  });
  assert.deepEqual(decodeJwt(token).payload, {
    sub: 'developer-123',
    scope: ['read', 'write'],
  });
});

test('round trips generated JWT content through the decoder', async () => {
  const header = {
    typ: 'JWT',
    kid: 'round-trip-key',
  };
  const payload = {
    iss: 'convertapp',
    sub: 'developer-123',
    aud: 'browser-tools',
    exp: 1710003600,
    featureFlags: {
      jwtGenerator: true,
      localOnly: true,
    },
  };

  const token = await generateJwt({
    algorithm: 'HS512',
    headerJson: JSON.stringify(header),
    payloadJson: JSON.stringify(payload),
    key: 'round-trip-secret',
  });
  const decoded = decodeJwt(token);

  assert.deepEqual(decoded.header, {
    ...header,
    alg: 'HS512',
  });
  assert.deepEqual(decoded.payload, payload);
  assert.match(decoded.signature, /^[A-Za-z0-9_-]+$/);
});

function toBase64Url(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}
