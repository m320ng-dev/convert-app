import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const jwtPageSource = readFileSync(
  resolve(import.meta.dirname, '../converters/jwt-decoder/page.tsx'),
  'utf8',
);

test('JWT 디코더 UI는 토큰 입력 영역과 header/payload 결과 영역을 제공한다', () => {
  assert.match(jwtPageSource, /<TextToolInput[\s\S]*id="jwt-token"/);
  assert.match(jwtPageSource, /label="JWT 토큰 입력"/);
  assert.match(jwtPageSource, /placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.\.\."/);
  assert.match(jwtPageSource, /<ResultsPanel[\s\S]*title="디코딩 결과"/);
  assert.match(
    jwtPageSource,
    /<FormattedResultBlock[\s\S]*title="Header"[\s\S]*value=\{decodedResult\.headerJson\}/,
  );
  assert.match(
    jwtPageSource,
    /<FormattedResultBlock[\s\S]*title="Payload"[\s\S]*value=\{decodedResult\.payloadJson\}/,
  );
});
