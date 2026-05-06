import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  convertStringCases,
  splitStringCaseWords,
} from './string-case.ts';

test('문자열을 주요 개발자 케이스로 변환한다', () => {
  assert.deepEqual(convertStringCases('user profile URL value'), {
    camelCase: 'userProfileUrlValue',
    pascalCase: 'UserProfileUrlValue',
    snakeCase: 'user_profile_url_value',
    kebabCase: 'user-profile-url-value',
    constantCase: 'USER_PROFILE_URL_VALUE',
  });
});

test('대표 입력값 표기별 케이스 변환 결과를 검증한다', () => {
  const cases = [
    {
      input: 'alreadyCamelCase',
      expected: {
        camelCase: 'alreadyCamelCase',
        pascalCase: 'AlreadyCamelCase',
        snakeCase: 'already_camel_case',
        kebabCase: 'already-camel-case',
        constantCase: 'ALREADY_CAMEL_CASE',
      },
    },
    {
      input: 'AlreadyPascalCase',
      expected: {
        camelCase: 'alreadyPascalCase',
        pascalCase: 'AlreadyPascalCase',
        snakeCase: 'already_pascal_case',
        kebabCase: 'already-pascal-case',
        constantCase: 'ALREADY_PASCAL_CASE',
      },
    },
    {
      input: 'already_snake_case',
      expected: {
        camelCase: 'alreadySnakeCase',
        pascalCase: 'AlreadySnakeCase',
        snakeCase: 'already_snake_case',
        kebabCase: 'already-snake-case',
        constantCase: 'ALREADY_SNAKE_CASE',
      },
    },
    {
      input: 'already-kebab-case',
      expected: {
        camelCase: 'alreadyKebabCase',
        pascalCase: 'AlreadyKebabCase',
        snakeCase: 'already_kebab_case',
        kebabCase: 'already-kebab-case',
        constantCase: 'ALREADY_KEBAB_CASE',
      },
    },
    {
      input: 'HTTPResponse_code-404Message',
      expected: {
        camelCase: 'httpResponseCode404Message',
        pascalCase: 'HttpResponseCode404Message',
        snakeCase: 'http_response_code_404_message',
        kebabCase: 'http-response-code-404-message',
        constantCase: 'HTTP_RESPONSE_CODE_404_MESSAGE',
      },
    },
  ];

  for (const { input, expected } of cases) {
    assert.deepEqual(convertStringCases(input), expected);
  }
});

test('기존 camel, Pascal, snake, kebab 표기와 숫자를 단어로 정규화한다', () => {
  assert.deepEqual(splitStringCaseWords('HTTPResponse_code-404Message'), [
    'http',
    'response',
    'code',
    '404',
    'message',
  ]);
});

test('빈 문자열은 모든 결과를 빈 문자열로 반환한다', () => {
  assert.deepEqual(convertStringCases('   '), {
    camelCase: '',
    pascalCase: '',
    snakeCase: '',
    kebabCase: '',
    constantCase: '',
  });
});

test('문자열 케이스 변환 도구가 유틸리티 분류와 /converters 라우트로 등록된다', () => {
  const convertersSource = readFileSync(resolve(import.meta.dirname, './converters.ts'), 'utf8');
  const pageSource = readFileSync(resolve(import.meta.dirname, '../converters/string-case-converter/page.tsx'), 'utf8');

  assert.match(convertersSource, /id: 'string-case-converter'/);
  assert.match(convertersSource, /path: '\/converters\/string-case-converter'/);
  assert.match(convertersSource, /group: '유틸리티'/);

  assert.match(pageSource, /ResultsPanel/);
  assert.match(pageSource, /copyValue=\{copyValue\}/);
  assert.match(pageSource, /camelCase/);
  assert.match(pageSource, /PascalCase/);
  assert.match(pageSource, /CONSTANT_CASE/);
  assert.match(pageSource, /외부 API 없이 브라우저에서만 처리됩니다\./);
});
