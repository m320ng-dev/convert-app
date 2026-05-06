import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const generationToolPages = {
  'random-token-generator': readFileSync(
    resolve(import.meta.dirname, '../converters/random-token-generator/page.tsx'),
    'utf8',
  ),
  'uuid-ulid-generator': readFileSync(
    resolve(import.meta.dirname, '../converters/uuid-ulid-generator/page.tsx'),
    'utf8',
  ),
  'qr-code-generator': readFileSync(
    resolve(import.meta.dirname, '../converters/qr-code-generator/page.tsx'),
    'utf8',
  ),
  'hash-generator': readFileSync(
    resolve(import.meta.dirname, '../converters/hash-generator/page.tsx'),
    'utf8',
  ),
};

test('토큰 생성 도구는 실행 후 생성된 토큰을 결과 영역에 표시한다', () => {
  const source = generationToolPages['random-token-generator'];

  assert.match(source, /const generatedTokens = generateRandomTokens\(/);
  assert.match(source, /setTokens\(generatedTokens\)/);
  assert.match(source, /<ResultsPanel[\s\S]*title="생성 결과"[\s\S]*isEmpty=\{tokens\.length === 0\}/);
  assert.match(source, /tokens\.map\(\(token, index\) => \(/);
  assert.match(source, /<code className="[^"]*">\{token\}<\/code>/);
});

test('UUID/ULID 생성 도구는 실행 후 생성된 식별자를 결과 영역에 표시한다', () => {
  const source = generationToolPages['uuid-ulid-generator'];

  assert.match(source, /const result = generateUuidUlidResults\(\{ kind, quantity \}\)/);
  assert.match(source, /setItems\(result\.items\)/);
  assert.match(source, /<ResultsPanel[\s\S]*title="생성 결과"[\s\S]*isEmpty=\{items\.length === 0\}/);
  assert.match(source, /items\.map\(\(item, index\) => \(/);
  assert.match(source, /<code className="[^"]*">\s*\{item\.value\}\s*<\/code>/);
});

test('QR 생성 도구는 실행 후 생성된 데이터 URL을 결과 영역에 표시한다', () => {
  const source = generationToolPages['qr-code-generator'];

  assert.match(source, /const dataUrl = await QRCode\.toDataURL\(/);
  assert.match(source, /setQrDataUrl\(dataUrl\)/);
  assert.match(source, /<ResultsPanel[\s\S]*title="생성 결과"[\s\S]*isEmpty=\{!qrDataUrl\}/);
  assert.match(source, /src=\{qrDataUrl\}/);
  assert.match(source, /<code className="[^"]*">\{qrDataUrl\}<\/code>/);
});

test('생성/계산 결과 영역은 빈 상태, 성공 상태, 오류 상태를 구분해 공용 패널에 연결한다', () => {
  const expectations = [
    {
      name: '토큰 생성 도구',
      source: generationToolPages['random-token-generator'],
      patterns: [
        /emptyMessage=\{error \?\? '옵션을 설정하고 토큰을 생성하면 결과가 표시됩니다\.'\}/,
        /errorMessage=\{error\}/,
        /isEmpty=\{tokens\.length === 0\}/,
        /processingStage=\{tokens\.length > 0 \? 'complete' : 'normalizing'\}/,
        /failureStage=\{errorStage\}/,
        /tokens\.map\(\(token, index\) => \(/,
      ],
    },
    {
      name: 'UUID/ULID 생성 도구',
      source: generationToolPages['uuid-ulid-generator'],
      patterns: [
        /emptyMessage=\{error \?\? '생성 버튼을 누르면 UUID\/ULID 결과가 여기에 표시됩니다\.'\}/,
        /errorMessage=\{error\}/,
        /isEmpty=\{items\.length === 0\}/,
        /processingStage=\{items\.length > 0 \? 'complete' : 'normalizing'\}/,
        /failureStage=\{errorStage\}/,
        /items\.map\(\(item, index\) => \(/,
      ],
    },
    {
      name: 'QR 생성 도구',
      source: generationToolPages['qr-code-generator'],
      patterns: [
        /emptyMessage=\{error \?\? 'QR 코드 생성 버튼을 누르면 결과가 표시됩니다\.'\}/,
        /errorMessage=\{error\}/,
        /isEmpty=\{!qrDataUrl\}/,
        /processingStage=\{qrDataUrl \? 'complete' : 'parsing'\}/,
        /failureStage=\{errorStage\}/,
        /src=\{qrDataUrl\}/,
      ],
    },
    {
      name: '해시 계산 도구',
      source: generationToolPages['hash-generator'],
      patterns: [
        /emptyMessage=\{error \? '오류를 해결하면 결과가 표시됩니다\.' : '해시 생성 버튼을 누르면 결과가 표시됩니다\.'\}/,
        /errorMessage=\{error\}/,
        /isEmpty=\{results\.length === 0\}/,
        /processingStage=\{results\.length > 0 \? 'complete' : 'converting'\}/,
        /failureStage=\{errorStage\}/,
        /results\.map\(\(result\) => \(/,
      ],
    },
  ];

  for (const expectation of expectations) {
    for (const pattern of expectation.patterns) {
      assert.match(
        expectation.source,
        pattern,
        `${expectation.name}는 결과 영역의 빈 상태, 성공 상태, 오류 상태를 구분해야 합니다.`,
      );
    }
  }
});
