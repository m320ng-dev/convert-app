import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readSource(relativePath) {
  return readFileSync(resolve(import.meta.dirname, relativePath), 'utf8');
}

function assertCopyContract(source, contractName, patterns) {
  for (const [description, pattern] of Object.entries(patterns)) {
    assert.match(source, pattern, `${contractName} should ${description}`);
  }
}

test('random token generator provides copy behavior for full result sets and individual tokens', () => {
  const source = readSource('../converters/random-token-generator/page.tsx');

  assertCopyContract(source, 'random token result panel', {
    'copy the primary newline payload': /copyValue=\{primaryCopyValue\}/,
    'label the primary copy action as newline copy': /copyLabel="줄바꿈 복사"/,
    'give the primary copy action a generated-token accessible label':
      /copyAriaLabel="생성된 토큰 줄바꿈 복사"/,
    'announce newline clipboard copy success in Korean':
      /copyCopiedMessage="생성된 토큰을 클립보드에 복사했습니다\."/,
    'show a Korean empty-result copy error': /copyEmptyMessage="복사할 토큰이 없습니다\."/,
  });

  assertCopyContract(source, 'random token alternate format actions', {
    'copy JSON, .env, and CSV payloads through formatter callbacks':
      /value=\{\(\) => formatRandomTokenResults\(tokens, action\.format\)\}/,
    'disable alternate copy actions before tokens exist or while an error is shown':
      /disabled=\{tokens\.length === 0 \|\| Boolean\(error\)\}/,
    'use distinct accessible labels for format copy actions':
      /ariaLabel=\{`\$\{action\.label\} 결과 세트 복사`\}/,
  });

  assertCopyContract(source, 'random token item copy action', {
    'copy each generated token directly': /value=\{token\}/,
    'use distinct accessible labels per token': /ariaLabel=\{`\$\{index \+ 1\}번 토큰 복사`\}/,
    'announce item clipboard copy success in Korean':
      /copiedMessage=\{`\$\{index \+ 1\}번 토큰을 클립보드에 복사했습니다\.`\}/,
  });
});

test('JWT decoder and generator provide copy behavior for generated and decoded results', () => {
  const source = readSource('../converters/jwt-decoder/page.tsx');

  assertCopyContract(source, 'JWT generator copy action', {
    'copy only the generated token': /value=\{generatedToken\}/,
    'provide a generated token accessible label': /ariaLabel="생성된 JWT 토큰 복사"/,
    'announce generated token copy success in Korean': /copiedMessage="생성된 JWT를 복사했습니다\."/,
    'show a Korean empty generated-result error': /emptyMessage="복사할 생성 결과가 없습니다\."/,
    'disable generated copy before a token exists': /disabled=\{!generatedToken\}/,
  });

  assertCopyContract(source, 'JWT decoded result panel', {
    'copy the formatted full decoded payload': /copyValue=\{decodedCopyValue\}/,
    'label full decoded copy clearly': /copyLabel="전체 복사"/,
    'provide a full decoded result accessible label': /copyAriaLabel="JWT 디코딩 전체 결과 복사"/,
    'announce full decoded copy success in Korean': /copyCopiedMessage="전체 결과를 복사했습니다\."/,
    'show a Korean empty decoded-result error': /copyEmptyMessage="복사할 디코딩 결과가 없습니다\."/,
  });

  assertCopyContract(source, 'JWT detail result blocks', {
    'copy header JSON': /copiedMessage="Header JSON을 복사했습니다\."/,
    'copy payload JSON': /copiedMessage="Payload JSON을 복사했습니다\."/,
    'copy signature segment': /copiedMessage="Signature segment를 복사했습니다\."/,
    'copy common claims without requiring raw token persistence':
      /copiedMessage="공통 클레임 정보를 복사했습니다\."/,
  });
});

test('developer input copy buttons expose purpose-specific accessible labels', () => {
  const expectations = [
    {
      file: '../converters/random-token-generator/page.tsx',
      label: /aria(?:-l|L)abel="토큰 생성 입력값 복사"/,
    },
    {
      file: '../converters/uuid-ulid-generator/page.tsx',
      label: /aria(?:-l|L)abel="식별자 생성 입력값 복사"/,
    },
    {
      file: '../converters/uuid-ulid-generator/page.tsx',
      label: /aria(?:-l|L)abel="UUID 검증 입력값 복사"/,
    },
    {
      file: '../converters/regex-tester/page.tsx',
      label: /aria-label="Regex 테스트 입력값 복사"/,
    },
    {
      file: '../converters/hash-generator/page.tsx',
      label: /aria(?:-l|L)abel="검증할 해시 입력값 복사"/,
    },
    {
      file: '../converters/ip-geolocation/page.tsx',
      label: /aria(?:-l|L)abel="IP 주소 입력값 복사"/,
    },
  ];

  for (const expectation of expectations) {
    const source = readSource(expectation.file);

    assert.match(
      source,
      expectation.label,
      `${expectation.file} 입력 복사 버튼은 용도별 접근성 라벨을 제공해야 합니다.`,
    );
  }
});

test('developer input copy buttons expose visible success and failure feedback', () => {
  const sharedActionPages = [
    '../converters/random-token-generator/page.tsx',
    '../converters/uuid-ulid-generator/page.tsx',
    '../converters/hash-generator/page.tsx',
    '../converters/ip-geolocation/page.tsx',
  ];

  for (const file of sharedActionPages) {
    const source = readSource(file);

    assert.match(
      source,
      /import \{ CopyResultAction \} from '@\/app\/components\/copy-result-action';/,
      `${file} 입력 복사 버튼은 공용 복사 액션으로 성공/실패 상태를 표시해야 합니다.`,
    );
    assert.match(
      source,
      /copiedMessage="[^"]*복사/,
      `${file} 입력 복사 성공 메시지를 명시해야 합니다.`,
    );
    assert.match(
      source,
      /emptyMessage="[^"]*없습니다\."/,
      `${file} 입력 복사 빈 값 메시지를 명시해야 합니다.`,
    );
    assert.doesNotMatch(
      source,
      /alert\('클립보드에 복사/,
      `${file} 복사 피드백은 브라우저 alert 대신 화면 상태로 표시해야 합니다.`,
    );
  }

  const regexSource = readSource('../converters/regex-tester/page.tsx');

  assert.match(regexSource, /setClipboardError\('입력값을 클립보드에 복사했습니다\.'\)/);
  assert.match(regexSource, /tone=\{clipboardError === '입력값을 클립보드에 복사했습니다\.' \? 'success' : 'warning'\}/);
});

test('regex tester provides copy behavior for formatted match results', () => {
  const source = readSource('../converters/regex-tester/page.tsx');

  assertCopyContract(source, 'regex tester result panel', {
    'format match results for copy': /formatRegexResult\(result\)/,
    'copy the formatted result value': /copyValue=\{copyValue\}/,
    'provide a regex result accessible label': /copyAriaLabel="Regex 테스트 결과 복사"/,
    'announce regex copy success in Korean': /copyCopiedMessage="테스트 결과를 클립보드에 복사했습니다\."/,
    'show a Korean empty regex-result error': /copyEmptyMessage="복사할 Regex 테스트 결과가 없습니다\."/,
  });
});

test('URL, string case, and QR tools provide result copy behavior with Korean feedback', () => {
  const urlSource = readSource('../converters/url-encoder-decoder/page.tsx');
  const stringCaseSource = readSource('../converters/string-case-converter/page.tsx');
  const qrSource = readSource('../converters/qr-code-generator/page.tsx');

  assertCopyContract(urlSource, 'URL encoder decoder result panel', {
    'copy the converted URL output': /copyValue=\{output\}/,
    'label result copy clearly': /copyLabel="결과 복사"/,
    'provide a URL result accessible label': /copyAriaLabel="URL 변환 결과 복사"/,
    'announce URL copy success in Korean': /copyCopiedMessage="URL 변환 결과를 클립보드에 복사했습니다\."/,
    'show a Korean empty URL-result error': /copyEmptyMessage="복사할 URL 변환 결과가 없습니다\."/,
  });

  assertCopyContract(stringCaseSource, 'string case converter result panel', {
    'copy the formatted case result': /copyValue=\{copyValue\}/,
    'label result copy clearly': /copyLabel="결과 복사"/,
    'provide a string case result accessible label': /copyAriaLabel="문자열 케이스 변환 결과 복사"/,
    'announce string case copy success in Korean':
      /copyCopiedMessage="문자열 케이스 변환 결과를 클립보드에 복사했습니다\."/,
    'show a Korean empty string-case-result error':
      /copyEmptyMessage="복사할 문자열 케이스 변환 결과가 없습니다\."/,
  });

  assertCopyContract(qrSource, 'QR generator result panel', {
    'copy the generated QR data URL': /copyValue=\{qrDataUrl\}/,
    'label data URL copy clearly': /copyLabel="데이터 URL 복사"/,
    'provide a QR result accessible label': /copyAriaLabel="QR 코드 데이터 URL 복사"/,
    'announce QR copy success in Korean': /copyCopiedMessage="QR 코드 데이터 URL을 클립보드에 복사했습니다\."/,
    'show a Korean empty QR-result error': /copyEmptyMessage="복사할 QR 코드 결과가 없습니다\."/,
  });
});

test('browser local catalog text outputs expose complete panel copy controls', () => {
  const expectations = [
    {
      file: '../converters/base64-converter/page.tsx',
      value: /copyValue=\{copyValue\}/,
      label: /copyLabel="결과 복사"/,
      aria: /copyAriaLabel="Base64 변환 결과 복사"/,
      copied: /copyCopiedMessage="Base64 변환 결과를 클립보드에 복사했습니다\."/,
      empty: /copyEmptyMessage="복사할 Base64 변환 결과가 없습니다\."/,
    },
    {
      file: '../converters/json-formatter/page.tsx',
      value: /copyValue=\{copyValue\}/,
      label: /copyLabel="결과 복사"/,
      aria: /copyAriaLabel="JSON 변환 결과 복사"/,
      copied: /copyCopiedMessage="JSON 결과를 클립보드에 복사했습니다\."/,
      empty: /copyEmptyMessage="복사할 JSON 결과가 없습니다\."/,
    },
    {
      file: '../converters/sql-formatter/page.tsx',
      value: /copyValue=\{copyValue\}/,
      label: /copyLabel="결과 복사"/,
      aria: /copyAriaLabel="SQL 포맷팅 결과 복사"/,
      copied: /copyCopiedMessage="SQL 결과를 클립보드에 복사했습니다\."/,
      empty: /copyEmptyMessage="복사할 SQL 결과가 없습니다\."/,
    },
    {
      file: '../converters/svg-to-react/page.tsx',
      value: /copyValue=\{copyValue\}/,
      label: /copyLabel="결과 복사"/,
      aria: /copyAriaLabel="SVG React 변환 결과 복사"/,
      copied: /copyCopiedMessage="SVG React 변환 결과를 클립보드에 복사했습니다\."/,
      empty: /copyEmptyMessage="복사할 SVG React 변환 결과가 없습니다\."/,
    },
    {
      file: '../converters/timestamp-converter/page.tsx',
      value: /copyValue=\{copyValue\}/,
      label: /copyLabel="결과 복사"/,
      aria: /copyAriaLabel="Timestamp 변환 결과 복사"/,
      copied: /copyCopiedMessage="Timestamp 변환 결과를 클립보드에 복사했습니다\."/,
      empty: /copyEmptyMessage="복사할 Timestamp 변환 결과가 없습니다\."/,
    },
    {
      file: '../converters/uuid-ulid-generator/page.tsx',
      value: /copyValue=\{copyValue\}/,
      label: /copyLabel="전체 복사"/,
      aria: /copyAriaLabel="생성된 식별자 전체 복사"/,
      copied: /copyCopiedMessage="식별자 목록을 복사했습니다\."/,
      empty: /copyEmptyMessage="복사할 식별자가 없습니다\."/,
    },
    {
      file: '../converters/env-validator/page.tsx',
      value: /copyValue=\{copyValue\}/,
      label: /copyLabel="검증 요약 복사"/,
      aria: /copyAriaLabel=".env 검증 요약 복사"/,
      copied: /copyCopiedMessage="검증 요약을 복사했습니다\."/,
      empty: /copyEmptyMessage="복사할 검증 결과가 없습니다\."/,
    },
  ];

  for (const expectation of expectations) {
    const source = readSource(expectation.file);

    assertCopyContract(source, expectation.file, {
      'pass the text output to the shared result copy action': expectation.value,
      'show a clear Korean copy label': expectation.label,
      'provide a distinct accessible copy label': expectation.aria,
      'announce copy success in Korean': expectation.copied,
      'show a Korean empty-result copy error': expectation.empty,
    });
  }
});

test('structured and file-like outputs wire explicit alternate copy formats', () => {
  const uuidSource = readSource('../converters/uuid-ulid-generator/page.tsx');
  const stringCaseSource = readSource('../converters/string-case-converter/page.tsx');
  const jwtSource = readSource('../converters/jwt-decoder/page.tsx');

  assertCopyContract(uuidSource, 'UUID/ULID structured copy action', {
    'format identifier items as JSON': /formatUuidUlidResults\(items, 'json'\)/,
    'label identifier JSON copy clearly': /label="JSON 복사"/,
    'provide identifier JSON accessible label': /ariaLabel="생성된 식별자 JSON 복사"/,
  });

  assertCopyContract(stringCaseSource, 'string case structured copy action', {
    'define a JSON formatter for the object result': /function formatStringCaseJsonResult/,
    'copy the object result as JSON': /formatStringCaseJsonResult\(result\)/,
    'provide string case JSON accessible label': /ariaLabel="문자열 케이스 JSON 결과 복사"/,
  });

  assertCopyContract(jwtSource, 'JWT decoded structured copy value', {
    'serialize the full decoded result as a JSON object': /JSON\.stringify\(\s*\{\s*header: JSON\.parse\(decodedResult\.headerJson\),/,
    'include the JWT payload in the structured copy value': /payload: JSON\.parse\(decodedResult\.payloadJson\),/,
    'include the signature segment in the structured copy value': /signature: decodedResult\.signature,/,
  });
});

test('파일 변환 출력은 공용 복사 액션으로 Base64 결과를 복사한다', () => {
  const imageSource = readSource('../converters/image-to-base64/page.tsx');

  assertCopyContract(imageSource, 'image to Base64 file output copy action', {
    'import the shared copy result action':
      /import \{ CopyResultAction \} from '@\/app\/components\/copy-result-action';/,
    'copy each generated Base64 data URL': /<CopyResultAction[\s\S]*value=\{file\.base64\}/,
    'label the copy action clearly': /label="Base64 복사"/,
    'provide a file-specific accessible label': /ariaLabel=\{`\$\{file\.name\} Base64 결과 복사`\}/,
    'announce Base64 copy success in Korean':
      /copiedMessage="Base64 문자열을 클립보드에 복사했습니다\."/,
    'show a Korean empty Base64 copy error': /emptyMessage="복사할 Base64 문자열이 없습니다\."/,
    'disable copy when the generated value is empty': /disabled=\{!file\.base64\}/,
  });

  assert.doesNotMatch(imageSource, /navigator\.clipboard\.writeText\(base64\)/);
  assert.doesNotMatch(imageSource, /alert\('클립보드에 복사되었습니다!'\)/);
});
