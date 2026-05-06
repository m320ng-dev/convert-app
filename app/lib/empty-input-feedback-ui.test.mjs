import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readPage(route) {
  return readFileSync(resolve(import.meta.dirname, `../converters/${route}/page.tsx`), 'utf8');
}

test('텍스트 기반 로컬 도구는 빈 입력 실행을 처리하지 않고 명확한 오류 안내를 표시한다', () => {
  const expectations = [
    {
      route: 'json-formatter',
      failure: /const emptyInputFailure = createInputValidationFailure\('JSON을 입력해주세요\.'\);/,
    },
    {
      route: 'base64-converter',
      failure: /const emptyInputFailure = createInputValidationFailure\('변환할 텍스트 또는 Base64 문자열을 입력해주세요\.'\);/,
    },
    {
      route: 'timestamp-converter',
      failure: /const emptyInputFailure = createInputValidationFailure\('Timestamp 또는 날짜를 입력해주세요\.'\);/,
    },
    {
      route: 'html-entity-escaper',
      failure: /const emptyInputFailure = createInputValidationFailure\('변환할 HTML 텍스트 또는 엔티티를 입력해주세요\.'\);/,
    },
    {
      route: 'csv-json-converter',
      failure: /const emptyInputFailure = createInputValidationFailure\('CSV 또는 JSON을 입력해주세요\.'\);/,
    },
    {
      route: 'yaml-json-converter',
      failure: /const emptyInputFailure = createInputValidationFailure\('YAML 또는 JSON을 입력해주세요\.'\);/,
    },
    {
      route: 'sql-formatter',
      failure: /const emptyInputFailure = createInputValidationFailure\('SQL 쿼리를 입력해주세요\.'\);/,
    },
    {
      route: 'svg-to-react',
      failure: /const emptyInputFailure = createInputValidationFailure\('SVG 마크업을 입력해주세요\.'\);/,
    },
  ];

  for (const expectation of expectations) {
    const source = readPage(expectation.route);

    assert.match(source, /createInputValidationFailure/, `${expectation.route}는 공통 입력 검증 실패 기본값을 사용해야 합니다.`);
    assert.match(source, expectation.failure, `${expectation.route}는 도구별 입력 안내를 공통 실패 상태로 생성해야 합니다.`);
    assert.match(source, /emptyInputFailure\.message/, `${expectation.route}는 기본 입력 오류 메시지를 표시해야 합니다.`);
    assert.match(source, /emptyInputFailure\.emptyMessage/, `${expectation.route}는 오류 해결 안내를 결과 영역에 연결해야 합니다.`);
    assert.match(source, /<ToolValidationMessage message=\{error\}/, `${expectation.route}는 입력 검증 실패를 공통 오류 메시지 UI로 표시해야 합니다.`);
    assert.match(source, /errorMessage=\{error\}/, `${expectation.route}는 빈 입력 피드백을 결과 패널 오류로 표시해야 합니다.`);
    assert.doesNotMatch(source, /return \{ output: '', error: null \};/, `${expectation.route}는 빈 입력을 무음 상태로 처리하면 안 됩니다.`);
  }
});
