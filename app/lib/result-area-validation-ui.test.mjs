import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readPage(route) {
  return readFileSync(resolve(import.meta.dirname, `../converters/${route}/page.tsx`), 'utf8');
}

test('신규 로컬 도구는 유효하지 않은 입력 안내를 결과 영역 emptyMessage에 직접 연결한다', () => {
  const expectations = [
    {
      route: 'url-encoder-decoder',
      pattern: /emptyMessage=\{emptyMessage\}/,
    },
    {
      route: 'regex-tester',
      pattern: /emptyMessage=\{error \?\? 'Regex 패턴을 입력하면 결과가 표시됩니다\.'\}/,
    },
    {
      route: 'random-token-generator',
      pattern: /emptyMessage=\{error \?\? '옵션을 설정하고 토큰을 생성하면 결과가 표시됩니다\.'\}/,
    },
    {
      route: 'uuid-ulid-generator',
      pattern: /emptyMessage=\{error \?\? '생성 버튼을 누르면 UUID\/ULID 결과가 여기에 표시됩니다\.'\}/,
    },
    {
      route: 'qr-code-generator',
      pattern: /emptyMessage=\{error \?\? 'QR 코드 생성 버튼을 누르면 결과가 표시됩니다\.'\}/,
    },
    {
      route: 'string-case-converter',
      pattern: /emptyMessage=\{error \?\? '문자열을 입력하면 변환 결과가 표시됩니다\.'\}/,
    },
    {
      route: 'jwt-decoder',
      pattern: /emptyMessage=\{decodedResult\.error \?\? 'JWT를 입력하면 디코딩 결과가 표시됩니다\.'\}/,
    },
  ];

  for (const expectation of expectations) {
    assert.match(
      readPage(expectation.route),
      expectation.pattern,
      `${expectation.route} 결과 영역에 오류 안내가 연결되어야 합니다.`,
    );
  }
});

test('공용 결과 패널은 오류 상태를 결과 영역의 alert로 표시한다', () => {
  const source = readFileSync(resolve(import.meta.dirname, '../components/results-panel.tsx'), 'utf8');

  assert.match(source, /errorMessage\?: string \| null/, '결과 패널은 명시적인 오류 메시지 prop을 받아야 합니다.');
  assert.match(source, /errorMessage = null/, '오류 메시지 기본값은 null이어야 합니다.');
  assert.match(source, /ResultStatusState message=\{panelErrorMessage\} tone="error"/, '오류 메시지는 결과 영역 상태 컴포넌트로 렌더링되어야 합니다.');
  assert.match(source, /role=\{tone === 'error' \? 'alert' : 'status'\}/, '오류 상태는 보조 기술에 alert로 전달되어야 합니다.');
});

test('신규 로컬 도구는 파싱, 변환, 계산 오류를 결과 패널 errorMessage에 연결한다', () => {
  const expectations = [
    {
      route: 'url-encoder-decoder',
      pattern: /errorMessage=\{error\}/,
    },
    {
      route: 'regex-tester',
      pattern: /errorMessage=\{error\}/,
    },
    {
      route: 'random-token-generator',
      pattern: /errorMessage=\{error\}/,
    },
    {
      route: 'uuid-ulid-generator',
      pattern: /errorMessage=\{error\}/,
    },
    {
      route: 'qr-code-generator',
      pattern: /errorMessage=\{error\}/,
    },
    {
      route: 'string-case-converter',
      pattern: /errorMessage=\{error\}/,
    },
    {
      route: 'jwt-decoder',
      pattern: /errorMessage=\{decodedResult\.error\}/,
    },
    {
      route: 'json-formatter',
      pattern: /errorMessage=\{error\}/,
    },
    {
      route: 'base64-converter',
      pattern: /errorMessage=\{error\}/,
    },
    {
      route: 'timestamp-converter',
      pattern: /errorMessage=\{error\}/,
    },
    {
      route: 'sql-formatter',
      pattern: /errorMessage=\{error\}/,
    },
    {
      route: 'svg-to-react',
      pattern: /errorMessage=\{error\}/,
    },
  ];

  for (const expectation of expectations) {
    assert.match(
      readPage(expectation.route),
      expectation.pattern,
      `${expectation.route}는 처리 오류를 결과 패널 errorMessage에 연결해야 합니다.`,
    );
  }
});

test('신규 로컬 도구는 변환 실패 상태의 빈 오류 문구를 도구별 기본 메시지로 보정한다', () => {
  const expectations = [
    {
      route: 'url-encoder-decoder',
      defaultErrorMessage: /defaultErrorMessage="URL 변환 중 오류가 발생했습니다\."/,
    },
    {
      route: 'regex-tester',
      defaultErrorMessage: /defaultErrorMessage="Regex 테스트 중 오류가 발생했습니다\."/,
    },
    {
      route: 'random-token-generator',
      defaultErrorMessage: /defaultErrorMessage="토큰 생성 중 오류가 발생했습니다\."/,
    },
    {
      route: 'uuid-ulid-generator',
      defaultErrorMessage: /defaultErrorMessage="식별자를 생성하는 중 오류가 발생했습니다\."/,
    },
    {
      route: 'qr-code-generator',
      defaultErrorMessage: /defaultErrorMessage="QR 코드 생성 중 오류가 발생했습니다\."/,
    },
    {
      route: 'string-case-converter',
      defaultErrorMessage: /defaultErrorMessage="문자열 케이스 변환 중 오류가 발생했습니다\."/,
    },
    {
      route: 'jwt-decoder',
      defaultErrorMessage: /defaultErrorMessage="JWT를 디코딩하는 중 오류가 발생했습니다\."/,
    },
    {
      route: 'json-formatter',
      defaultErrorMessage: /defaultErrorMessage="JSON 변환 중 오류가 발생했습니다\."/,
    },
    {
      route: 'base64-converter',
      defaultErrorMessage: /defaultErrorMessage="Base64 변환 중 오류가 발생했습니다\."/,
    },
    {
      route: 'timestamp-converter',
      defaultErrorMessage: /defaultErrorMessage="Timestamp 변환 중 오류가 발생했습니다\."/,
    },
    {
      route: 'sql-formatter',
      defaultErrorMessage: /defaultErrorMessage="SQL 포맷팅 중 오류가 발생했습니다\."/,
    },
    {
      route: 'svg-to-react',
      defaultErrorMessage: /defaultErrorMessage="SVG 변환 중 오류가 발생했습니다\."/,
    },
  ];

  for (const expectation of expectations) {
    assert.match(
      readPage(expectation.route),
      expectation.defaultErrorMessage,
      `${expectation.route}는 결과 패널에 도구별 기본 오류 메시지를 전달해야 합니다.`,
    );
  }
});

test('데이터 포맷/인코딩 도구는 빈 입력 검증 실패에 공통 기본 오류 메시지를 표시한다', () => {
  const expectations = [
    {
      route: 'json-formatter',
      inputMessage: /createInputValidationFailure\('JSON을 입력해주세요\.'\)/,
    },
    {
      route: 'base64-converter',
      inputMessage: /createInputValidationFailure\('변환할 텍스트 또는 Base64 문자열을 입력해주세요\.'\)/,
    },
    {
      route: 'url-encoder-decoder',
      inputMessage: /createInputValidationFailure\('URL 또는 URL 컴포넌트를 입력해주세요\.'\)/,
    },
    {
      route: 'timestamp-converter',
      inputMessage: /createInputValidationFailure\('Timestamp 또는 날짜를 입력해주세요\.'\)/,
    },
  ];

  for (const expectation of expectations) {
    const source = readPage(expectation.route);

    assert.match(source, /createInputValidationFailure/, `${expectation.route}는 공통 입력 검증 실패 헬퍼를 사용해야 합니다.`);
    assert.match(source, expectation.inputMessage);
    assert.match(source, /emptyInputFailure\.message/);
    assert.match(source, /emptyInputFailure\.emptyMessage/);
    assert.match(source, /errorMessage=\{error\}/);
  }
});

test('커스텀 결과 복사 액션은 오류 상태에서 이전 성공 결과를 복사할 수 없게 막는다', () => {
  const source = readPage('random-token-generator');

  assert.match(
    source,
    /disabled=\{tokens\.length === 0 \|\| Boolean\(error\)\}/,
    '토큰 생성기 커스텀 복사 액션은 오류 상태에서도 비활성화되어야 합니다.',
  );
});

test('신규 로컬 도구는 입력 검증 메시지를 공용 컴포넌트로 일관되게 표시한다', () => {
  const componentPath = resolve(import.meta.dirname, '../components/tool-validation-message.tsx');

  assert.equal(
    existsSync(componentPath),
    true,
    '공용 검증 메시지 컴포넌트가 있어야 합니다.',
  );

  const componentSource = readFileSync(
    componentPath,
    'utf8',
  );

  assert.match(componentSource, /export function ToolValidationMessage/);
  assert.match(componentSource, /role=\{tone === 'error' \? 'alert' : 'status'\}/);
  assert.match(componentSource, /aria-live="polite"/);

  const expectations = [
    'url-encoder-decoder',
    'regex-tester',
    'random-token-generator',
    'uuid-ulid-generator',
    'qr-code-generator',
    'string-case-converter',
    'jwt-decoder',
    'json-formatter',
    'base64-converter',
    'timestamp-converter',
    'sql-formatter',
    'svg-to-react',
    'env-validator',
  ];

  for (const route of expectations) {
    const source = readPage(route);

    assert.match(source, /ToolValidationMessage/, `${route}는 공용 검증 메시지 컴포넌트를 사용해야 합니다.`);
  }
});
