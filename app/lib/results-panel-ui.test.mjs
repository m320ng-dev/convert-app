import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const RESULT_PANEL_COMPONENT = '../components/results-panel.tsx';
const DEVELOPER_RESULT_FILES = [
  '../converters/base64-converter/page.tsx',
  '../converters/env-validator/page.tsx',
  '../converters/html-entity-escaper/page.tsx',
  '../converters/json-formatter/page.tsx',
  '../converters/jwt-decoder/page.tsx',
  '../converters/qr-code-generator/page.tsx',
  '../converters/random-token-generator/page.tsx',
  '../converters/regex-tester/page.tsx',
  '../converters/sql-formatter/page.tsx',
  '../converters/string-case-converter/page.tsx',
  '../converters/svg-to-react/page.tsx',
  '../converters/timestamp-converter/page.tsx',
  '../converters/url-encoder-decoder/page.tsx',
  '../converters/uuid-ulid-generator/page.tsx',
];

test('shared results panel supports formatted output, empty state, and loading state', () => {
  const source = readFileSync(resolve(import.meta.dirname, RESULT_PANEL_COMPONENT), 'utf8');

  assert.match(source, /interface ResultsPanelProps/, 'results panel props should be typed');
  assert.match(source, /isLoading\?: boolean/, 'results panel should accept a loading state');
  assert.match(source, /emptyMessage: string/, 'results panel should accept explicit empty copy');
  assert.match(source, /errorMessage\?: string \| null/, 'results panel should accept explicit error copy');
  assert.match(source, /aria-busy=\{isLoading\}/, 'loading state should be exposed to assistive tech');
  assert.match(source, /role=\{tone === 'error' \? 'alert' : 'status'\}/, 'empty, loading, and error content should announce status');
  assert.match(source, /result-output/, 'formatted output should use responsive result-output containment');
  assert.match(source, /export function FormattedResultBlock/, 'formatted output display should be reusable');
});

test('shared results panel marks successful output content after execution', () => {
  const source = readFileSync(resolve(import.meta.dirname, RESULT_PANEL_COMPONENT), 'utf8');

  assert.match(
    source,
    /data-result-state="success"/,
    'successful result content should be marked separately from empty and loading states',
  );
  assert.match(
    source,
    /aria-label=\{successLabel \?\? title\}/,
    'successful result content should have a useful accessible label',
  );
  assert.match(
    source,
    /<div[^>]+data-result-state="success"[\s\S]*\{children\}[\s\S]*<\/div>/,
    'successful result content should render the provided result children',
  );
});

test('shared results panel exposes mutually exclusive non-success states', () => {
  const source = readFileSync(resolve(import.meta.dirname, RESULT_PANEL_COMPONENT), 'utf8');

  assert.match(
    source,
    /data-result-state=\{tone\}/,
    'empty, loading, and error states should be marked with the active result state',
  );
  assert.match(
    source,
    /isLoading \? \([\s\S]*tone="loading"[\s\S]*\) : panelErrorMessage \? \([\s\S]*tone="error"[\s\S]*\) : isEmpty \? \([\s\S]*tone="empty"/,
    'result panel should render loading, error, empty, and success as one ordered state machine',
  );
});

test('shared results panel exposes parsing, normalization, and conversion stages', () => {
  const source = readFileSync(resolve(import.meta.dirname, RESULT_PANEL_COMPONENT), 'utf8');

  assert.match(source, /processingStage\?: ToolProcessingStage/, '결과 패널은 처리 단계를 props로 받아야 합니다.');
  assert.match(source, /failureStage\?: ToolProcessingStage \| null/, '결과 패널은 실패 단계를 props로 받아야 합니다.');
  assert.match(source, /data-processing-stage=\{resolvedProcessingStage\}/, '현재 처리 단계를 결과 영역에 표시해야 합니다.');
  assert.match(source, /data-failure-stage=\{resolvedFailureStage \?\? undefined\}/, '실패 단계를 결과 영역에 표시해야 합니다.');
  assert.match(source, /resolveResultProcessingStage/, '결과 패널은 상태별 기본 처리 단계를 해석해야 합니다.');
});

test('priority developer tool pages connect parsing, normalization, and conversion failure stages to result panels', () => {
  const expectations = [
    {
      file: '../converters/random-token-generator/page.tsx',
      patterns: [
        /failureStage=\{errorStage\}/,
        /processingStage=\{tokens\.length > 0 \? 'complete' : 'normalizing'\}/,
        /setErrorStage\('normalizing'\)/,
        /setErrorStage\('converting'\)/,
      ],
    },
    {
      file: '../converters/uuid-ulid-generator/page.tsx',
      patterns: [
        /failureStage=\{errorStage\}/,
        /processingStage=\{items\.length > 0 \? 'complete' : 'normalizing'\}/,
        /setErrorStage\('normalizing'\)/,
        /setErrorStage\('converting'\)/,
      ],
    },
    {
      file: '../converters/url-encoder-decoder/page.tsx',
      patterns: [
        /failureStage=\{processingFailureStage\}/,
        /processingStage=\{output \? 'complete' : 'parsing'\}/,
        /processingFailureStage: 'parsing'/,
        /processingFailureStage: result\.error \? 'converting'/,
      ],
    },
    {
      file: '../converters/jwt-decoder/page.tsx',
      patterns: [
        /failureStage=\{decodedResult\.failureStage\}/,
        /processingStage=\{decodedResult\.headerJson \? 'complete' : 'parsing'\}/,
        /failureStage: 'parsing'/,
        /failureStage: 'converting'/,
      ],
    },
    {
      file: '../converters/regex-tester/page.tsx',
      patterns: [
        /failureStage=\{processingFailureStage\}/,
        /processingStage=\{result \? 'complete' : 'parsing'\}/,
        /processingFailureStage: 'parsing'/,
        /processingFailureStage: execution\.error \? 'converting'/,
      ],
    },
    {
      file: '../converters/string-case-converter/page.tsx',
      patterns: [
        /failureStage=\{processingFailureStage\}/,
        /processingStage=\{isEmpty \? 'parsing' : 'complete'\}/,
        /processingFailureStage = inputValidationFailure \? 'parsing'/,
      ],
    },
    {
      file: '../converters/qr-code-generator/page.tsx',
      patterns: [
        /failureStage=\{errorStage\}/,
        /processingStage=\{qrDataUrl \? 'complete' : 'parsing'\}/,
        /setErrorStage\('parsing'\)/,
        /setErrorStage\('converting'\)/,
      ],
    },
  ];

  for (const expectation of expectations) {
    const source = readFileSync(resolve(import.meta.dirname, expectation.file), 'utf8');

    for (const pattern of expectation.patterns) {
      assert.match(source, pattern, `${expectation.file}는 처리 단계와 실패 단계를 결과 패널에 연결해야 합니다.`);
    }
  }
});

test('shared results panel visually separates error state from successful results', () => {
  const source = readFileSync(resolve(import.meta.dirname, RESULT_PANEL_COMPONENT), 'utf8');

  assert.match(
    source,
    /data-result-state="success"[\s\S]*role="region"/,
    '성공 결과는 독립적인 결과 region으로 표시되어야 합니다.',
  );
  assert.match(
    source,
    /role=\{tone === 'error' \? 'alert' : 'status'\}[\s\S]*data-result-state=\{tone\}/,
    '오류 상태는 성공 결과와 다른 상태값과 alert 역할을 사용해야 합니다.',
  );
  assert.match(
    source,
    /tone === 'error'[\s\S]*'border-red-200 bg-red-50 text-red-700'/,
    '오류 상태는 성공 결과와 구분되는 빨간색 경고 스타일로 표시되어야 합니다.',
  );
});

test('shared results panel can render a reusable copy action for output sections', () => {
  const source = readFileSync(resolve(import.meta.dirname, RESULT_PANEL_COMPONENT), 'utf8');

  assert.match(source, /copyValue\?: string \| null/, 'results panel should accept copyable output text');
  assert.match(source, /copyLabel\?: string/, 'results panel should allow per-section copy labels');
  assert.match(source, /copyDisabled\?: boolean/, 'results panel should allow parent tools to disable copy explicitly');
  assert.match(source, /copyEmptyMessage\?: string/, 'results panel should allow clear Korean empty copy feedback');
  assert.match(source, /<CopyResultAction/, 'results panel should render the reusable copy result action');
  assert.match(source, /value=\{copyValue\}/, 'copy action should receive the output section value');
  assert.match(
    source,
    /disabled=\{copyDisabled \|\| isLoading \|\| isEmpty \|\| Boolean\(panelErrorMessage\)\}/,
    'panel copy action should be unavailable for empty, loading, or error results',
  );
});

test('new developer tools render results through the shared results panel', () => {
  for (const file of DEVELOPER_RESULT_FILES) {
    const source = readFileSync(resolve(import.meta.dirname, file), 'utf8');

    assert.match(source, /ResultsPanel/, `${file} should render the shared ResultsPanel`);
  }
});

test('new developer tools render concrete success output values inside their result areas', () => {
  const expectations = [
    {
      file: '../converters/base64-converter/page.tsx',
      patterns: [
        /<code className="break-words font-mono">\{output\}<\/code>/,
      ],
    },
    {
      file: '../converters/env-validator/page.tsx',
      patterns: [
        /envPreviewLines\.map\(\(line, index\) => \{/,
        /\{copyValue\}/,
      ],
    },
    {
      file: '../converters/html-entity-escaper/page.tsx',
      patterns: [
        /<code className="break-words font-mono">\{output\}<\/code>/,
      ],
    },
    {
      file: '../converters/json-formatter/page.tsx',
      patterns: [
        /<code className="break-words font-mono">\{output\}<\/code>/,
      ],
    },
    {
      file: '../converters/jwt-decoder/page.tsx',
      patterns: [
        /<FormattedResultBlock[\s\S]*title="Header"[\s\S]*value=\{decodedResult\.headerJson\}/,
        /<FormattedResultBlock[\s\S]*title="Payload"[\s\S]*value=\{decodedResult\.payloadJson\}/,
        /\{generatedToken\}/,
      ],
    },
    {
      file: '../converters/qr-code-generator/page.tsx',
      patterns: [
        /src=\{qrDataUrl\}/,
        /<code className="break-all font-mono">\{qrDataUrl\}<\/code>/,
      ],
    },
    {
      file: '../converters/random-token-generator/page.tsx',
      patterns: [
        /tokens\.map\(\(token, index\) => \(/,
        /<code className="min-w-0 break-all font-mono text-sm text-slate-900">\{token\}<\/code>/,
      ],
    },
    {
      file: '../converters/regex-tester/page.tsx',
      patterns: [
        /highlightedSegments\.map\(\(segment\) => \(/,
        /result && result\.matches\.map\(\(match, index\) => \(/,
      ],
    },
    {
      file: '../converters/sql-formatter/page.tsx',
      patterns: [
        /<code className="break-words font-mono">\{output\}<\/code>/,
      ],
    },
    {
      file: '../converters/string-case-converter/page.tsx',
      patterns: [
        /caseRows\.map\(\(row\) => \(/,
        /\{result\[row\.key\]\}/,
      ],
    },
    {
      file: '../converters/svg-to-react/page.tsx',
      patterns: [
        /<code className="break-words font-mono">\{output\}<\/code>/,
      ],
    },
    {
      file: '../converters/timestamp-converter/page.tsx',
      patterns: [
        /<code className="break-words font-mono">\{output\}<\/code>/,
      ],
    },
    {
      file: '../converters/url-encoder-decoder/page.tsx',
      patterns: [
        /<code className="break-words font-mono">\{output\}<\/code>/,
      ],
    },
    {
      file: '../converters/uuid-ulid-generator/page.tsx',
      patterns: [
        /items\.map\(\(item, index\) => \(/,
        /\{item\.value\}/,
      ],
    },
  ];

  for (const expectation of expectations) {
    const source = readFileSync(resolve(import.meta.dirname, expectation.file), 'utf8');

    for (const pattern of expectation.patterns) {
      assert.match(
        source,
        pattern,
        `${expectation.file} should show successful execution output values on screen`,
      );
    }
  }
});

test('new developer result panels wire copy actions into the output section header', () => {
  const expectations = [
    {
      file: '../converters/base64-converter/page.tsx',
      copyValue: /copyValue=\{copyValue\}/,
      copyLabel: /copyLabel="결과 복사"/,
    },
    {
      file: '../converters/env-validator/page.tsx',
      copyValue: /copyValue=\{copyValue\}/,
      copyLabel: /copyLabel="검증 요약 복사"/,
    },
    {
      file: '../converters/html-entity-escaper/page.tsx',
      copyValue: /copyValue=\{output\}/,
      copyLabel: /copyLabel="결과 복사"/,
    },
    {
      file: '../converters/json-formatter/page.tsx',
      copyValue: /copyValue=\{copyValue\}/,
      copyLabel: /copyLabel="결과 복사"/,
    },
    {
      file: '../converters/jwt-decoder/page.tsx',
      copyValue: /copyValue=\{decodedCopyValue\}/,
      copyLabel: /copyLabel="전체 복사"/,
    },
    {
      file: '../converters/qr-code-generator/page.tsx',
      copyValue: /copyValue=\{qrDataUrl\}/,
      copyLabel: /copyLabel="데이터 URL 복사"/,
    },
    {
      file: '../converters/random-token-generator/page.tsx',
      copyValue: /copyValue=\{primaryCopyValue\}/,
      copyLabel: /copyLabel="줄바꿈 복사"/,
    },
    {
      file: '../converters/regex-tester/page.tsx',
      copyValue: /copyValue=\{copyValue\}/,
      copyLabel: /copyLabel="결과 복사"/,
    },
    {
      file: '../converters/sql-formatter/page.tsx',
      copyValue: /copyValue=\{copyValue\}/,
      copyLabel: /copyLabel="결과 복사"/,
    },
    {
      file: '../converters/string-case-converter/page.tsx',
      copyValue: /copyValue=\{copyValue\}/,
      copyLabel: /copyLabel="결과 복사"/,
    },
    {
      file: '../converters/svg-to-react/page.tsx',
      copyValue: /copyValue=\{copyValue\}/,
      copyLabel: /copyLabel="결과 복사"/,
    },
    {
      file: '../converters/timestamp-converter/page.tsx',
      copyValue: /copyValue=\{copyValue\}/,
      copyLabel: /copyLabel="결과 복사"/,
    },
    {
      file: '../converters/url-encoder-decoder/page.tsx',
      copyValue: /copyValue=\{output\}/,
      copyLabel: /copyLabel="결과 복사"/,
    },
    {
      file: '../converters/uuid-ulid-generator/page.tsx',
      copyValue: /copyValue=\{copyValue\}/,
      copyLabel: /copyLabel="전체 복사"/,
    },
  ];

  for (const expectation of expectations) {
    const source = readFileSync(resolve(import.meta.dirname, expectation.file), 'utf8');

    assert.match(
      source,
      expectation.copyValue,
      `${expectation.file} should pass the output value to ResultsPanel copyValue`,
    );
    assert.match(
      source,
      expectation.copyLabel,
      `${expectation.file} should label the panel copy action clearly`,
    );
  }
});
