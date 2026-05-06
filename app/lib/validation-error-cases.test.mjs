import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { convertBase64Text } from './base64-codec.ts';
import { formatJsonText } from './json-formatter.ts';
import { validateJwt } from './jwt-decoder.ts';
import { buildJwtPayloadFromClaims, generateJwt } from './jwt-generator.ts';
import { generateRandomTokens } from './random-token.ts';
import { testRegexPattern } from './regex-tester.ts';
import { convertSvgToReactComponent } from './svg-to-react.ts';
import { convertTimestampText } from './timestamp-converter.ts';
import { convertUrlText } from './url-codec.ts';
import { generateUuidUlidResults } from './uuid-ulid.ts';

function readPage(route) {
  return readFileSync(resolve(import.meta.dirname, `../converters/${route}/page.tsx`), 'utf8');
}

test('covers malformed text/data utility inputs with focused Korean errors', () => {
  assert.throws(
    () => convertUrlText('%E0%A4%A', 'decode-component'),
    /퍼센트 인코딩 형식을 확인해주세요/,
  );

  assert.throws(
    () => formatJsonText('{ "ok": true, }', 'format'),
    /유효하지 않은 JSON 형식입니다/,
  );

  assert.throws(
    () => convertBase64Text('not base64!!!', 'decode'),
    /올바른 Base64 문자열인지 확인해주세요/,
  );

  assert.throws(
    () => convertTimestampText('twenty-six', 'timestamp-to-date'),
    /유효한 Unix timestamp 숫자를 입력해주세요/,
  );

  assert.throws(
    () => convertTimestampText('not-a-date', 'date-to-timestamp'),
    /유효한 날짜 문자열을 입력해주세요/,
  );

  assert.throws(
    () => convertSvgToReactComponent('<div>not svg</div>', 'Icon'),
    /유효한 SVG 마크업을 입력해주세요/,
  );
});

test('covers identifier and regex validation errors with actionable feedback', () => {
  assert.throws(
    () => generateUuidUlidResults({ kind: 'guid', quantity: 1 }),
    /생성할 식별자 종류를 확인해주세요/,
  );

  assert.throws(
    () => generateUuidUlidResults({ kind: 'uuid', quantity: 101 }),
    /생성 개수는 1~100개 사이로 입력해주세요/,
  );

  const missingPattern = testRegexPattern('   ', 'sample', 'g');
  assert.equal(missingPattern.error, 'Regex 패턴을 입력해주세요.');

  const invalidPattern = testRegexPattern('[a-', 'sample', 'g');
  assert.equal(invalidPattern.result, null);
  assert.match(invalidPattern.error ?? '', /유효하지 않은 Regex 패턴입니다:/);
});

test('covers JWT validation errors for verification setup and claim types', async () => {
  const unsignedToken = `${encodeBase64Url(JSON.stringify({ alg: 'none' }))}.${encodeBase64Url(
    JSON.stringify({ sub: '123' }),
  )}.`;
  await assert.rejects(
    () => validateJwt(unsignedToken, { secret: 'secret' }),
    /JWT signature 구역이 비어 있어 서명을 검증할 수 없습니다/,
  );

  const hs256Token = await generateJwt({
    algorithm: 'HS256',
    headerJson: '{}',
    payloadJson: '{ "exp": "tomorrow" }',
    key: 'secret',
  });

  await assert.rejects(
    () => validateJwt(hs256Token, { secret: 'secret', algorithms: [] }),
    /검증할 JWT 알고리즘을 하나 이상 선택해주세요/,
  );

  await assert.rejects(
    () => validateJwt(hs256Token, { secret: 'secret', clockToleranceSeconds: -1 }),
    /JWT clock tolerance는 0 이상의 초 단위 정수여야 합니다/,
  );

  await assert.rejects(
    () => validateJwt(hs256Token, { secret: 'secret' }),
    /JWT exp 클레임은 Unix timestamp 숫자여야 합니다/,
  );
});

test('covers JWT generator validation errors for empty JSON and unsafe timestamps', async () => {
  await assert.rejects(
    () =>
      generateJwt({
        algorithm: 'HS256',
        headerJson: '   ',
        payloadJson: '{}',
        key: 'secret',
      }),
    /JWT header JSON을 입력해주세요/,
  );

  assert.throws(
    () =>
      buildJwtPayloadFromClaims({
        basePayloadJson: '{}',
        standardClaims: {
          issuedAt: '9007199254740992',
        },
      }),
    /issued-at 값은 안전한 Unix timestamp 범위 안에서 입력해주세요/,
  );
});

test('covers random token validation errors for direct quantity and affix limits', () => {
  assert.throws(
    () =>
      generateRandomTokens({
        length: 16,
        quantity: 101,
        characterSets: {
          lowercase: true,
          uppercase: true,
          numbers: true,
          symbols: false,
        },
        excludeCharacters: '',
        excludeAmbiguous: false,
      }),
    /생성 개수는 100개 이하로 입력해주세요/,
  );

  assert.throws(
    () =>
      generateRandomTokens({
        length: 16,
        quantity: 1,
        characterSets: {
          lowercase: true,
          uppercase: true,
          numbers: true,
          symbols: false,
        },
        excludeCharacters: '',
        excludeAmbiguous: false,
        prefix: 'p'.repeat(257),
      }),
    /접두사는 256자 이하로 입력해주세요/,
  );

  assert.throws(
    () =>
      generateRandomTokens({
        length: 16,
        quantity: 1,
        characterSets: {
          lowercase: true,
          uppercase: true,
          numbers: true,
          symbols: false,
        },
        excludeCharacters: '',
        excludeAmbiguous: false,
        suffix: 's'.repeat(257),
      }),
    /접미사는 256자 이하로 입력해주세요/,
  );
});

test('covers valid but unprocessable inputs with precise recovery reasons', () => {
  assert.throws(
    () => convertBase64Text('/w==', 'decode'),
    /Base64는 유효하지만 UTF-8 텍스트로 디코딩할 수 없습니다/,
  );

  assert.throws(
    () => convertTimestampText('999999999999999999999', 'timestamp-to-date'),
    /유효한 Unix timestamp 범위를 입력해주세요/,
  );

  assert.throws(
    () =>
      generateRandomTokens({
        length: 16,
        quantity: 1,
        characterSets: {
          lowercase: true,
          uppercase: false,
          numbers: false,
          symbols: false,
        },
        excludeCharacters: 'abcdefghijklmnopqrstuvwxyz',
        excludeAmbiguous: false,
      }),
    /제외 문자 설정 때문에 사용할 수 있는 문자가 없습니다/,
  );

});

test('우선순위 로컬 도구는 입력 검증 실패 메시지를 도구별 alert 또는 결과 패널에 표시한다', () => {
  const expectations = [
    {
      route: 'random-token-generator',
      alertPattern: /<ToolValidationMessage message=\{error\}/,
      resultErrorPattern: /errorMessage=\{error\}/,
      defaultErrorPattern: /defaultErrorMessage="토큰 생성 중 오류가 발생했습니다\."/,
      messagePattern: /토큰 생성 중 오류가 발생했습니다\./,
    },
    {
      route: 'uuid-ulid-generator',
      alertPattern: /<ToolValidationMessage message=\{error\}/,
      resultErrorPattern: /errorMessage=\{error\}/,
      defaultErrorPattern: /defaultErrorMessage="식별자를 생성하는 중 오류가 발생했습니다\."/,
      messagePattern: /식별자를 생성하는 중 오류가 발생했습니다\./,
    },
    {
      route: 'url-encoder-decoder',
      alertPattern: /<ToolValidationMessage message=\{error\}/,
      resultErrorPattern: /errorMessage=\{error\}/,
      defaultErrorPattern: /defaultErrorMessage="URL 변환 중 오류가 발생했습니다\."/,
      messagePattern: /URL 또는 URL 컴포넌트를 입력해주세요\./,
    },
    {
      route: 'jwt-decoder',
      alertPattern: /<ToolValidationMessage message=\{decodedResult\.error\}/,
      resultErrorPattern: /errorMessage=\{decodedResult\.error\}/,
      defaultErrorPattern: /defaultErrorMessage="JWT를 디코딩하는 중 오류가 발생했습니다\."/,
      messagePattern: /JWT를 입력해주세요\./,
    },
    {
      route: 'regex-tester',
      alertPattern: /<ToolValidationMessage id="regex-validation-error" message=\{error\}/,
      resultErrorPattern: /errorMessage=\{error\}/,
      defaultErrorPattern: /defaultErrorMessage="Regex 테스트 중 오류가 발생했습니다\."/,
      messagePattern: /Regex 패턴을 입력하면 결과가 표시됩니다\./,
    },
    {
      route: 'string-case-converter',
      alertPattern: /<ToolValidationMessage message=\{error\}/,
      resultErrorPattern: /errorMessage=\{error\}/,
      defaultErrorPattern: /defaultErrorMessage="문자열 케이스 변환 중 오류가 발생했습니다\."/,
      messagePattern: /입력 문자열을 입력해주세요\./,
    },
    {
      route: 'qr-code-generator',
      alertPattern: /<ToolValidationMessage message=\{error\}/,
      resultErrorPattern: /errorMessage=\{error\}/,
      defaultErrorPattern: /defaultErrorMessage="QR 코드 생성 중 오류가 발생했습니다\."/,
      messagePattern: /QR 코드로 만들 텍스트나 URL을 입력해주세요\./,
    },
  ];

  for (const expectation of expectations) {
    const source = readPage(expectation.route);

    assert.match(
      source,
      expectation.alertPattern,
      `${expectation.route}는 입력 검증 실패 메시지를 즉시 인지 가능한 alert로 표시해야 합니다.`,
    );
    assert.match(
      source,
      expectation.resultErrorPattern,
      `${expectation.route}는 같은 실패 메시지를 결과 패널 오류 상태로 전달해야 합니다.`,
    );
    assert.match(
      source,
      expectation.defaultErrorPattern,
      `${expectation.route}는 예외 상황에 사용할 도구별 기본 오류 문구를 결과 패널에 전달해야 합니다.`,
    );
    assert.match(
      source,
      expectation.messagePattern,
      `${expectation.route}는 도구별 복구 가능한 입력 오류 문구를 제공해야 합니다.`,
    );
  }
});

test('직접 처리 흐름의 텍스트 도구도 과도한 입력을 공통 기준으로 차단한다', () => {
  const expectations = [
    {
      route: 'regex-tester',
      validationPattern: /validateToolTextInput\(testText, '테스트 텍스트를 입력해주세요\.'[\s\S]*maxLength: MAX_TEXT_TOOL_INPUT_LENGTH/,
    },
    {
      route: 'string-case-converter',
      validationPattern: /validateToolTextInput\(input, '입력 문자열을 입력해주세요\.'[\s\S]*excessiveInputMessage: DEFAULT_EXCESSIVE_INPUT_ERROR_MESSAGE/,
    },
    {
      route: 'jwt-decoder',
      validationPattern: /validateToolTextInput\(token, 'JWT를 입력해주세요\.'[\s\S]*excessiveInputMessage: DEFAULT_EXCESSIVE_INPUT_ERROR_MESSAGE/,
    },
    {
      route: 'qr-code-generator',
      validationPattern: /validateToolTextInput\(input, 'QR 코드로 만들 텍스트나 URL을 입력해주세요\.'[\s\S]*maxLength: QR_TEXT_INPUT_MAX_LENGTH/,
    },
  ];

  for (const expectation of expectations) {
    const source = readPage(expectation.route);

    assert.match(
      source,
      /validateToolTextInput/,
      `${expectation.route}는 공통 텍스트 입력 검증 헬퍼를 사용해야 합니다.`,
    );
    assert.match(
      source,
      expectation.validationPattern,
      `${expectation.route}는 빈 입력과 과도한 입력을 공통 실패 상태로 표시해야 합니다.`,
    );
    assert.match(
      source,
      /DEFAULT_EXCESSIVE_INPUT_ERROR_MESSAGE/,
      `${expectation.route}는 공통 과도 입력 표시 메시지를 사용해야 합니다.`,
    );
  }
});

function encodeBase64Url(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}
