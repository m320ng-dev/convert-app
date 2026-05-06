import test from 'node:test';
import assert from 'node:assert/strict';

import {
  executeBrowserLocalToolConversion,
} from './browser-local-tool-execution.ts';
import { browserLocalToolCatalog, validateBrowserLocalToolInput } from './converters.ts';

test('브라우저 로컬 도구 실행기는 정규화된 입력으로 URL 변환 로직을 호출한다', async () => {
  const result = await executeBrowserLocalToolConversion('url-encoder-decoder', {
    mode: ' encode-component ',
    value: 'https://example.com/search?q=한글 값',
    ignored: '화면 외 입력',
  });

  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.normalizedInput, {
    mode: 'encode-component',
    value: 'https://example.com/search?q=한글 값',
  });
  assert.deepEqual(result.output, {
    result: 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3D%ED%95%9C%EA%B8%80%20%EA%B0%92',
  });
});

test('브라우저 로컬 도구 실행기는 URL 파싱 모드를 로컬 변환 결과로 반환한다', async () => {
  const result = await executeBrowserLocalToolConversion('url-encoder-decoder', {
    mode: 'parse',
    value: 'https://example.com/search?q=dev&tag=api',
  });

  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.normalizedInput, {
    mode: 'parse',
    value: 'https://example.com/search?q=dev&tag=api',
  });
  assert.deepEqual(JSON.parse(result.output?.result), {
    href: 'https://example.com/search?q=dev&tag=api',
    protocol: 'https:',
    username: '',
    password: '',
    origin: 'https://example.com',
    host: 'example.com',
    hostname: 'example.com',
    port: '',
    pathname: '/search',
    search: '?q=dev&tag=api',
    hash: '',
    query: {
      q: 'dev',
      tag: 'api',
    },
  });
});

test('브라우저 로컬 도구 실행기는 정규화된 입력으로 Regex 테스트 로직을 호출한다', async () => {
  const result = await executeBrowserLocalToolConversion('regex-tester', {
    pattern: '([a-z]+)@example\\.com',
    flags: 'g',
    text: 'dev@example.com ops@example.com',
  });

  assert.deepEqual(result.errors, []);
  assert.equal(result.output?.summary, '총 2개 일치');
  assert.deepEqual(result.output?.matches, [
    {
      value: 'dev@example.com',
      index: 0,
      endIndex: 15,
      groups: ['dev'],
    },
    {
      value: 'ops@example.com',
      index: 16,
      endIndex: 31,
      groups: ['ops'],
    },
  ]);
});

test('브라우저 로컬 도구 실행기는 검증 실패 시 변환 로직을 호출하지 않고 한국어 오류를 반환한다', async () => {
  const result = await executeBrowserLocalToolConversion('uuid-ulid-generator', {
    kind: 'uuid',
    quantity: '101',
  });

  assert.deepEqual(result.output, null);
  assert.deepEqual(result.normalizedInput, {
    kind: 'uuid',
    quantity: 101,
  });
  assert.deepEqual(result.errors, ['생성 개수는 100 이하로 입력해주세요.']);
});

test('인코딩·디코딩·해시 계열 도구는 스키마 입력 검증 실패를 기본 오류 메시지로 반환한다', async () => {
  const cases = [
    {
      toolId: 'url-encoder-decoder',
      input: {
        mode: 'decode-path',
        value: 'https://example.com',
      },
      errors: ['인코딩, 디코딩 또는 파싱 모드는 허용된 값 중 하나로 선택해주세요.'],
    },
    {
      toolId: 'base64-converter',
      input: {
        mode: 'compress',
        value: 'convertapp',
      },
      errors: ['인코딩 또는 디코딩 모드는 허용된 값 중 하나로 선택해주세요.'],
    },
    {
      toolId: 'html-entity-escaper',
      input: {
        mode: 'decode',
        value: '&lt;main&gt;',
      },
      errors: ['이스케이프 또는 언이스케이프 모드는 허용된 값 중 하나로 선택해주세요.'],
    },
    {
      toolId: 'hash-generator',
      input: {
        text: 'convertapp',
        algorithms: 'sha256,sha999',
      },
      errors: ['해시 알고리즘은 허용된 값 중 하나로 선택해주세요.'],
    },
  ];

  for (const testCase of cases) {
    const result = await executeBrowserLocalToolConversion(testCase.toolId, testCase.input);

    assert.equal(result.output, null, `${testCase.toolId}는 검증 실패 시 결과를 만들지 않아야 한다`);
    assert.deepEqual(result.errors, testCase.errors);
  }
});

test('생성·계산 계열 도구는 입력 검증 실패 시 기본 오류 메시지를 반환한다', async () => {
  const validationCases = [
    {
      toolId: 'random-token-generator',
      input: {
        length: 16,
        quantity: 1,
        characterSets: {
          lowercase: false,
          uppercase: false,
          numbers: false,
          symbols: false,
        },
      },
      errors: ['문자 집합은 하나 이상 선택해주세요.'],
    },
    {
      toolId: 'uuid-ulid-generator',
      input: {
        kind: 'uuid',
        quantity: 0,
      },
      errors: ['생성 개수는 1 이상으로 입력해주세요.'],
    },
    {
      toolId: 'qr-code-generator',
      input: {
        text: '   ',
        size: 256,
        margin: 2,
      },
      errors: ['QR 코드 입력값을 입력해주세요.'],
    },
    {
      toolId: 'timestamp-converter',
      input: {
        mode: 'relative-date',
        value: '2024-01-01',
      },
      errors: ['변환 방향은 허용된 값 중 하나로 선택해주세요.'],
    },
    {
      toolId: 'hash-generator',
      input: {
        text: 'convertapp',
        algorithms: [],
      },
      errors: ['해시 알고리즘은 하나 이상 선택해주세요.'],
    },
  ];

  for (const testCase of validationCases) {
    assert.deepEqual(
      validateBrowserLocalToolInput(testCase.toolId, testCase.input),
      testCase.errors,
      `${testCase.toolId}는 스키마 검증 단계에서 기본 오류 메시지를 반환해야 한다`,
    );

    const result = await executeBrowserLocalToolConversion(testCase.toolId, testCase.input);

    assert.equal(result.output, null, `${testCase.toolId}는 검증 실패 시 결과를 만들지 않아야 한다`);
    assert.deepEqual(result.errors, testCase.errors);
  }
});

const invalidInputByToolId = {
  'random-token-generator': {
    input: {
      length: 16,
      quantity: 1,
      characterSets: {
        lowercase: false,
        uppercase: false,
        numbers: false,
        symbols: false,
      },
    },
    errors: ['문자 집합은 하나 이상 선택해주세요.'],
  },
  'uuid-ulid-generator': {
    input: {
      kind: 'uuid',
      quantity: 0,
    },
    errors: ['생성 개수는 1 이상으로 입력해주세요.'],
  },
  'url-encoder-decoder': {
    input: {
      mode: 'encode-component',
      value: '   ',
    },
    errors: ['URL 입력값을 입력해주세요.'],
  },
  'jwt-decoder': {
    input: {
      token: 'not-a-jwt',
    },
    errors: ['JWT 문자열 형식을 확인해주세요.'],
  },
  'regex-tester': {
    input: {
      pattern: '   ',
      text: 'sample',
    },
    errors: ['정규식 패턴을 입력해주세요.'],
  },
  'string-case-converter': {
    input: {
      text: '   ',
    },
    errors: ['원본 문자열을 입력해주세요.'],
  },
  'qr-code-generator': {
    input: {
      text: '   ',
      size: 256,
      margin: 2,
    },
    errors: ['QR 코드 입력값을 입력해주세요.'],
  },
  'json-formatter': {
    input: {
      mode: 'format',
      json: '   ',
    },
    errors: ['JSON 입력값을 입력해주세요.'],
  },
  'base64-converter': {
    input: {
      mode: 'compress',
      value: 'convertapp',
    },
    errors: ['인코딩 또는 디코딩 모드는 허용된 값 중 하나로 선택해주세요.'],
  },
  'timestamp-converter': {
    input: {
      mode: 'timestamp-to-date',
      value: '   ',
    },
    errors: ['Timestamp 또는 날짜 입력값을 입력해주세요.'],
  },
  'sql-formatter': {
    input: {
      sql: '   ',
    },
    errors: ['SQL 입력값을 입력해주세요.'],
  },
  'svg-to-react': {
    input: {
      svg: '<div>not svg</div>',
      componentName: 'IconSample',
    },
    errors: ['SVG 마크업 형식을 확인해주세요.'],
  },
  'html-entity-escaper': {
    input: {
      mode: 'decode',
      value: '&lt;main&gt;',
    },
    errors: ['이스케이프 또는 언이스케이프 모드는 허용된 값 중 하나로 선택해주세요.'],
  },
  'csv-json-converter': {
    input: {
      mode: 'csv-to-json',
      value: '   ',
    },
    errors: ['CSV 또는 JSON 입력값을 입력해주세요.'],
  },
  'yaml-json-converter': {
    input: {
      mode: 'yaml-to-json',
      value: '   ',
    },
    errors: ['YAML 또는 JSON 입력값을 입력해주세요.'],
  },
  'hash-generator': {
    input: {
      text: 'convertapp',
      algorithms: [],
    },
    errors: ['해시 알고리즘은 하나 이상 선택해주세요.'],
  },
};

test('모든 브라우저 로컬 카탈로그 도구는 입력 검증 실패 시 기본 오류 메시지를 반환한다', async () => {
  assert.deepEqual(
    Object.keys(invalidInputByToolId).sort(),
    browserLocalToolCatalog.map((tool) => tool.id).sort(),
    '카탈로그의 모든 로컬 도구는 입력 검증 실패 테스트 케이스를 가져야 한다',
  );

  for (const tool of browserLocalToolCatalog) {
    const testCase = invalidInputByToolId[tool.id];
    const schemaErrors = validateBrowserLocalToolInput(tool.id, testCase.input);

    assert.deepEqual(
      schemaErrors,
      testCase.errors,
      `${tool.id}는 스키마 검증 실패 시 도구별 기본 오류 메시지를 반환해야 한다`,
    );

    const result = await executeBrowserLocalToolConversion(tool.id, testCase.input);

    assert.equal(result.output, null, `${tool.id}는 입력 검증 실패 시 결과를 만들지 않아야 한다`);
    assert.deepEqual(result.errors, testCase.errors, `${tool.id}는 실행 결과에 같은 오류 메시지를 표시해야 한다`);
  }
});

test('브라우저 로컬 도구 실행기는 문자열 케이스 변환 결과를 카탈로그 출력 필드로 반환한다', async () => {
  const result = await executeBrowserLocalToolConversion('string-case-converter', {
    text: 'user profile URL value',
  });

  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.output, {
    camelCase: 'userProfileUrlValue',
    pascalCase: 'UserProfileUrlValue',
    snakeCase: 'user_profile_url_value',
    kebabCase: 'user-profile-url-value',
    constantCase: 'USER_PROFILE_URL_VALUE',
  });
});

const validInputByToolId = {
  'random-token-generator': {
    length: '8',
    quantity: '2',
    characterSets: 'lowercase,numbers',
  },
  'uuid-ulid-generator': {
    kind: 'uuid',
    quantity: '1',
  },
  'url-encoder-decoder': {
    mode: 'encode-component',
    value: '한글 값',
  },
  'jwt-decoder': {
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signature',
  },
  'regex-tester': {
    pattern: 'dev',
    flags: 'g',
    text: 'dev tools',
  },
  'string-case-converter': {
    text: 'user profile',
  },
  'qr-code-generator': {
    text: 'https://example.com',
    size: '128',
    margin: '1',
  },
  'json-formatter': {
    mode: 'format',
    json: '{"ok":true}',
  },
  'base64-converter': {
    mode: 'encode',
    value: 'convertapp',
  },
  'timestamp-converter': {
    mode: 'timestamp-to-date',
    value: '1710000000',
  },
  'sql-formatter': {
    sql: 'select * from users where id = 1',
  },
  'svg-to-react': {
    svg: '<svg viewBox="0 0 1 1"><path class="icon" /></svg>',
    componentName: 'IconSample',
  },
  'html-entity-escaper': {
    mode: 'escape',
    value: '<strong>dev</strong>',
  },
  'csv-json-converter': {
    mode: 'csv-to-json',
    value: 'name,role\nkim,dev',
  },
  'yaml-json-converter': {
    mode: 'yaml-to-json',
    value: 'name: convertapp\nlocalOnly: true',
  },
  'hash-generator': {
    text: 'convertapp',
    algorithms: 'sha256',
  },
};

test('모든 브라우저 로컬 카탈로그 도구는 정규화된 입력으로 로컬 실행 결과를 만든다', async () => {
  for (const tool of browserLocalToolCatalog) {
    const result = await executeBrowserLocalToolConversion(
      tool.id,
      validInputByToolId[tool.id],
    );

    assert.deepEqual(result.errors, [], `${tool.id} 실행 오류가 없어야 한다`);
    assert.notEqual(result.output, null, `${tool.id} 결과가 있어야 한다`);

    for (const outputField of Object.keys(tool.outputSchema.fields)) {
      if (outputField === 'verification' || outputField === 'uuidValidation') {
        continue;
      }

      assert.ok(
        Object.hasOwn(result.output, outputField),
        `${tool.id}.${outputField} 출력 필드를 반환해야 한다`,
      );
    }
  }
});
