import test from 'node:test';
import assert from 'node:assert/strict';

import { convertCodeToCurl } from './code-to-curl.ts';
import { parseCurlCommand, CurlParseError } from './curl-parser.ts';
import { generateCodeFromCurl } from './curl-to-code.ts';
import { validateJwt } from './jwt-decoder.ts';
import { buildJwtPayloadFromClaims, generateJwt } from './jwt-generator.ts';
import { generateRandomTokens } from './random-token.ts';
import { regexFlagOptions, safeTestRegex } from './regex-tester.ts';

test('covers curl parser validation errors for empty input, non-curl commands, URL conflicts, and methods', () => {
  assertCurlError('', {
    code: 'EMPTY_COMMAND',
    message: /curl 명령어를 입력해주세요/,
  });

  assertCurlError('wget https://api.example.com', {
    code: 'NOT_CURL_COMMAND',
    token: 'wget',
    message: /명령어는 curl로 시작해야 합니다/,
  });

  assertCurlError('curl -X', {
    code: 'MISSING_FLAG_VALUE',
    flag: '-X',
    message: /-X 옵션에는 값이 필요합니다/,
  });

  assertCurlError('curl -X P0ST https://api.example.com', {
    code: 'INVALID_METHOD',
    token: 'P0ST',
    message: /HTTP 메서드는 영문자로 입력해주세요/,
  });

  assertCurlError('curl https://api.example.com https://api.example.com/next', {
    code: 'MULTIPLE_URLS',
    token: 'https://api.example.com/next',
    message: /요청 URL은 하나만 입력할 수 있습니다/,
  });

  assertCurlError('curl -H "Bad Header: value" https://api.example.com', {
    code: 'INVALID_HEADER',
    token: 'Bad Header: value',
    message: /헤더 이름에 사용할 수 없는 문자가 있습니다/,
  });
});

test('covers curl-to-code validation errors for option shape, indentation, and timeout limits', () => {
  assert.throws(
    () => generateCodeFromCurl('curl https://api.example.com', null),
    /코드 생성 옵션을 확인해주세요/,
  );

  assert.throws(
    () =>
      generateCodeFromCurl('curl https://api.example.com', {
        language: 'javascript-fetch',
        indentSize: 1,
      }),
    /들여쓰기는 2~8칸 사이의 숫자로 입력해주세요/,
  );

  assert.throws(
    () =>
      generateCodeFromCurl('curl https://api.example.com', {
        language: 'javascript-fetch',
        timeoutSeconds: 601,
      }),
    /타임아웃은 600초 이하로 입력해주세요/,
  );
});

test('covers code-to-curl validation errors for options, Python snippets, and raw HTTP input', () => {
  assert.throws(
    () => convertCodeToCurl('fetch("https://api.example.com")', null),
    /변환 옵션을 확인해주세요/,
  );

  assert.throws(
    () => convertCodeToCurl('httpx.get("https://api.example.com")', { language: 'python-requests' }),
    /Python requests 호출을 찾을 수 없습니다/,
  );

  assert.throws(
    () => convertCodeToCurl('requests.get(url)', { language: 'python-requests' }),
    /requests 첫 번째 인자는 URL 문자열이어야 합니다/,
  );

  assert.throws(
    () => convertCodeToCurl('GET /users HTTP/1.1', { language: 'http' }),
    /Raw HTTP 요청에는 Host 헤더가 필요합니다/,
  );

  assert.throws(
    () =>
      convertCodeToCurl(
        'GET /users HTTP/1.1\nHost: api.example.com\nBroken-Header',
        { language: 'http' },
      ),
    /HTTP 헤더는 "이름: 값" 형식이어야 합니다/,
  );
});

test('reports malformed supported code-to-curl inputs with focused Korean errors', () => {
  assert.throws(
    () =>
      convertCodeToCurl(
        'fetch("https://api.example.com", method: "POST", body: "name=test")',
        { language: 'javascript-fetch' },
      ),
    /fetch options는 객체 리터럴/,
  );

  assert.throws(
    () =>
      convertCodeToCurl(
        'fetch("https://api.example.com", { headers: [["Accept", "application/json"]] })',
        { language: 'javascript-fetch' },
      ),
    /배열 형태의 JavaScript headers는 아직 지원하지 않습니다/,
  );

  assert.throws(
    () =>
      convertCodeToCurl(
        'requests.post("https://api.example.com", headers={"Accept": token})',
        { language: 'python-requests' },
      ),
    /Python headers 딕셔너리 값은 문자열이어야 합니다/,
  );

  assert.throws(
    () =>
      convertCodeToCurl('GET users HTTP/1.1\nHost: api.example.com', { language: 'http' }),
    /Raw HTTP 요청 경로는 \/ 또는 http/,
  );
});

test('reports known unsupported request patterns explicitly', () => {
  assert.throws(
    () => convertCodeToCurl('axios.get("https://api.example.com/users")', { language: 'auto' }),
    /axios 요청 패턴은 아직 지원하지 않습니다/,
  );

  assert.throws(
    () => convertCodeToCurl('fetch(apiUrl)', { language: 'javascript-fetch' }),
    /변수 URL 패턴은 아직 지원하지 않습니다/,
  );

  assert.throws(
    () => convertCodeToCurl('requests.Session().get("https://api.example.com")', { language: 'auto' }),
    /requests\.Session\(\) 패턴은 아직 지원하지 않습니다/,
  );
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

test('covers non-throwing regex validation results for missing patterns and bad flags', () => {
  const missingPattern = safeTestRegex({
    pattern: '   ',
    text: 'sample',
    flags: regexFlagOptions,
  });
  assert.equal(missingPattern.ok, false);
  assert.equal(missingPattern.error, '정규식 패턴을 입력해주세요.');

  const invalidFlags = safeTestRegex({
    pattern: 'sample',
    text: 'sample',
    flags: null,
  });
  assert.equal(invalidFlags.ok, false);
  assert.equal(invalidFlags.error, '정규식 플래그 설정을 확인해주세요.');
});

function assertCurlError(command, expectation) {
  assert.throws(
    () => parseCurlCommand(command),
    (error) => {
      assert.ok(error instanceof CurlParseError);
      assert.equal(error.code, expectation.code);

      if ('flag' in expectation) {
        assert.equal(error.flag, expectation.flag);
      }

      if ('token' in expectation) {
        assert.equal(error.token, expectation.token);
      }

      assert.match(error.message, expectation.message);
      return true;
    },
  );
}

function encodeBase64Url(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}
