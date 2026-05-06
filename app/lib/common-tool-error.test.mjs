import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  DEFAULT_TOOL_ERROR_MESSAGE,
  DEFAULT_EXCESSIVE_INPUT_ERROR_MESSAGE,
  DEFAULT_INPUT_VALIDATION_ERROR_MESSAGE,
  ERROR_RECOVERY_MESSAGE,
  INPUT_VALIDATION_ERROR_RENDERING,
  INPUT_VALIDATION_ERROR_STATE,
  MAX_TEXT_TOOL_INPUT_LENGTH,
  createInputValidationFailure,
  executeToolConversion,
  resolveToolErrorMessage,
  validateToolTextInput,
} from './tool-error-message.ts';

test('공통 도구 오류 기본 문구를 제공한다', () => {
  assert.equal(
    DEFAULT_TOOL_ERROR_MESSAGE,
    '처리 중 오류가 발생했습니다. 입력값을 확인한 뒤 다시 시도해주세요.',
  );
  assert.equal(ERROR_RECOVERY_MESSAGE, '오류를 해결하면 결과가 표시됩니다.');
  assert.equal(
    DEFAULT_EXCESSIVE_INPUT_ERROR_MESSAGE,
    '입력값이 너무 깁니다. 내용을 줄인 뒤 다시 시도해주세요.',
  );
  assert.equal(MAX_TEXT_TOOL_INPUT_LENGTH, 100000);
});

test('알 수 없는 오류는 공통 기본 문구로 정규화한다', () => {
  assert.equal(resolveToolErrorMessage(null), DEFAULT_TOOL_ERROR_MESSAGE);
  assert.equal(resolveToolErrorMessage('   '), DEFAULT_TOOL_ERROR_MESSAGE);
  assert.equal(resolveToolErrorMessage(new Error('  ')), DEFAULT_TOOL_ERROR_MESSAGE);
  assert.equal(resolveToolErrorMessage(new Error('JSON 파싱에 실패했습니다.')), 'JSON 파싱에 실패했습니다.');
  assert.equal(resolveToolErrorMessage('직접 전달된 오류'), '직접 전달된 오류');
});

test('입력 검증 실패 상태와 기본 표시 문구를 공통으로 생성한다', () => {
  assert.equal(INPUT_VALIDATION_ERROR_STATE, 'input-validation-error');
  assert.equal(DEFAULT_INPUT_VALIDATION_ERROR_MESSAGE, '입력값을 확인해주세요.');
  assert.deepEqual(INPUT_VALIDATION_ERROR_RENDERING, {
    component: 'ToolValidationMessage',
    tone: 'error',
    role: 'alert',
    ariaLive: 'polite',
    dataValidationState: 'error',
  });

  assert.deepEqual(createInputValidationFailure(), {
    state: INPUT_VALIDATION_ERROR_STATE,
    message: DEFAULT_INPUT_VALIDATION_ERROR_MESSAGE,
    emptyMessage: ERROR_RECOVERY_MESSAGE,
  });

  assert.deepEqual(createInputValidationFailure(' JSON을 입력해주세요. '), {
    state: INPUT_VALIDATION_ERROR_STATE,
    message: 'JSON을 입력해주세요.',
    emptyMessage: ERROR_RECOVERY_MESSAGE,
  });
});

test('공통 텍스트 입력 검증은 빈 입력과 과도한 입력을 같은 실패 상태로 반환한다', () => {
  assert.deepEqual(validateToolTextInput('   ', 'JSON을 입력해주세요.'), {
    state: INPUT_VALIDATION_ERROR_STATE,
    message: 'JSON을 입력해주세요.',
    emptyMessage: ERROR_RECOVERY_MESSAGE,
  });

  assert.equal(validateToolTextInput('x'.repeat(MAX_TEXT_TOOL_INPUT_LENGTH)), null);
  assert.deepEqual(validateToolTextInput('x'.repeat(MAX_TEXT_TOOL_INPUT_LENGTH + 1)), {
    state: INPUT_VALIDATION_ERROR_STATE,
    message: DEFAULT_EXCESSIVE_INPUT_ERROR_MESSAGE,
    emptyMessage: ERROR_RECOVERY_MESSAGE,
  });

  assert.deepEqual(
    validateToolTextInput('x'.repeat(11), '값을 입력해주세요.', {
      maxLength: 10,
      excessiveInputMessage: '10자 이하로 입력해주세요.',
    }),
    {
      state: INPUT_VALIDATION_ERROR_STATE,
      message: '10자 이하로 입력해주세요.',
      emptyMessage: ERROR_RECOVERY_MESSAGE,
    },
  );
});

test('공통 변환 실행 흐름은 성공과 빈 입력을 동일한 결과 상태로 반환한다', () => {
  assert.deepEqual(
    executeToolConversion({
      input: ' convertapp ',
      transform: (value) => value.toUpperCase(),
      emptyInputMessage: '입력값을 넣어주세요.',
      emptyResultMessage: '입력하면 결과가 표시됩니다.',
    }),
    {
      output: ' CONVERTAPP ',
      error: null,
      emptyMessage: '입력하면 결과가 표시됩니다.',
    },
  );

  assert.deepEqual(
    executeToolConversion({
      input: '   ',
      transform: (value) => value,
      emptyInputMessage: '입력값을 넣어주세요.',
      emptyResultMessage: '입력하면 결과가 표시됩니다.',
    }),
    {
      output: '',
      error: '입력값을 넣어주세요.',
      emptyMessage: ERROR_RECOVERY_MESSAGE,
    },
  );
});

test('공통 변환 실행 흐름은 과도한 입력을 변환 전에 차단한다', () => {
  let transformCalled = false;

  assert.deepEqual(
    executeToolConversion({
      input: 'x'.repeat(MAX_TEXT_TOOL_INPUT_LENGTH + 1),
      transform: (value) => {
        transformCalled = true;
        return value;
      },
      emptyInputMessage: '입력값을 넣어주세요.',
      emptyResultMessage: '입력하면 결과가 표시됩니다.',
    }),
    {
      output: '',
      error: DEFAULT_EXCESSIVE_INPUT_ERROR_MESSAGE,
      emptyMessage: ERROR_RECOVERY_MESSAGE,
    },
  );
  assert.equal(transformCalled, false);
});

test('공통 변환 실행 흐름은 실패 예외를 감지하고 기본 오류 메시지 상태를 설정한다', () => {
  assert.deepEqual(
    executeToolConversion({
      input: 'not-json',
      transform: () => {
        throw new Error('   ');
      },
      emptyInputMessage: 'JSON을 입력해주세요.',
      emptyResultMessage: 'JSON을 입력하면 결과가 표시됩니다.',
    }),
    {
      output: '',
      error: DEFAULT_TOOL_ERROR_MESSAGE,
      emptyMessage: ERROR_RECOVERY_MESSAGE,
    },
  );

  assert.deepEqual(
    executeToolConversion({
      input: 'not-json',
      transform: () => {
        throw new Error('JSON 파싱에 실패했습니다.');
      },
      emptyInputMessage: 'JSON을 입력해주세요.',
      emptyResultMessage: 'JSON을 입력하면 결과가 표시됩니다.',
      defaultErrorMessage: 'JSON 변환 중 오류가 발생했습니다.',
    }),
    {
      output: '',
      error: 'JSON 파싱에 실패했습니다.',
      emptyMessage: ERROR_RECOVERY_MESSAGE,
    },
  );
});

test('공용 결과 패널은 오류 표시 방식과 기본 문구를 공통 모듈에서 사용한다', () => {
  const source = readFileSync(
    resolve(import.meta.dirname, '../components/results-panel.tsx'),
    'utf8',
  );

  assert.match(source, /DEFAULT_TOOL_ERROR_MESSAGE/);
  assert.match(source, /defaultErrorMessage = DEFAULT_TOOL_ERROR_MESSAGE/);
  assert.match(source, /resolveToolErrorMessage\(errorMessage, defaultErrorMessage\)/);
  assert.match(source, /role=\{tone === 'error' \? 'alert' : 'status'\}/);
  assert.match(source, /aria-live="polite"/);
});

test('브라우저 로컬 도구 실행기는 예외 실패 경로에서도 공통 오류 정규화를 사용한다', () => {
  const source = readFileSync(
    resolve(import.meta.dirname, './browser-local-tool-execution.ts'),
    'utf8',
  );

  assert.match(source, /resolveToolErrorMessage/);
  assert.match(source, /errors: \[resolveToolErrorMessage\(error\)\]/);
});

test('상태 기반 도구와 파일 입력도 메시지 없는 예외를 기본 오류 문구로 보정한다', () => {
  const files = [
    {
      path: '../converters/random-token-generator/page.tsx',
      fallback: '토큰 생성 중 오류가 발생했습니다.',
    },
    {
      path: '../converters/jwt-decoder/page.tsx',
      fallback: 'JWT를 디코딩하는 중 오류가 발생했습니다.',
    },
    {
      path: '../components/file-tool-input.tsx',
      fallback: '파일을 브라우저에서 읽는 중 오류가 발생했습니다.',
    },
  ];

  for (const file of files) {
    const source = readFileSync(resolve(import.meta.dirname, file.path), 'utf8');

    assert.match(source, /resolveToolErrorMessage/);
    assert.match(
      source,
      new RegExp(`resolveToolErrorMessage\\([\\s\\S]*?${file.fallback}`),
      `${file.path}는 빈 Error.message 대신 도구별 fallback 오류 문구를 표시해야 한다`,
    );
  }
});
