import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const RESULT_PANEL_COMPONENT = '../components/results-panel.tsx';
const DEVELOPER_RESULT_FILES = [
  '../components/request-converter-workbench.tsx',
  '../converters/env-validator/page.tsx',
  '../converters/jwt-decoder/page.tsx',
  '../converters/random-token-generator/page.tsx',
  '../converters/regex-tester/page.tsx',
];

test('shared results panel supports formatted output, empty state, and loading state', () => {
  const source = readFileSync(resolve(import.meta.dirname, RESULT_PANEL_COMPONENT), 'utf8');

  assert.match(source, /interface ResultsPanelProps/, 'results panel props should be typed');
  assert.match(source, /isLoading\?: boolean/, 'results panel should accept a loading state');
  assert.match(source, /emptyMessage: string/, 'results panel should accept explicit empty copy');
  assert.match(source, /aria-busy=\{isLoading\}/, 'loading state should be exposed to assistive tech');
  assert.match(source, /role="status"/, 'empty and loading content should announce status');
  assert.match(source, /result-output/, 'formatted output should use responsive result-output containment');
  assert.match(source, /export function FormattedResultBlock/, 'formatted output display should be reusable');
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
    /disabled=\{copyDisabled \|\| isLoading \|\| isEmpty\}/,
    'panel copy action should be unavailable for empty or loading results',
  );
});

test('new developer tools render results through the shared results panel', () => {
  for (const file of DEVELOPER_RESULT_FILES) {
    const source = readFileSync(resolve(import.meta.dirname, file), 'utf8');

    assert.match(source, /ResultsPanel/, `${file} should render the shared ResultsPanel`);
  }
});

test('new developer result panels wire copy actions into the output section header', () => {
  const expectations = [
    {
      file: '../components/request-converter-workbench.tsx',
      copyValue: /copyValue=\{output\}/,
      copyLabel: /copyLabel="결과 복사"/,
    },
    {
      file: '../converters/env-validator/page.tsx',
      copyValue: /copyValue=\{hiddenValueSummary\}/,
      copyLabel: /copyLabel="결과 복사"/,
    },
    {
      file: '../converters/jwt-decoder/page.tsx',
      copyValue: /copyValue=\{decodedCopyValue\}/,
      copyLabel: /copyLabel="전체 복사"/,
    },
    {
      file: '../converters/random-token-generator/page.tsx',
      copyValue: /copyValue=\{primaryCopyValue\}/,
      copyLabel: /copyLabel="줄바꿈 복사"/,
    },
    {
      file: '../converters/regex-tester/page.tsx',
      copyValue: /copyValue=\{resultCopyValue\}/,
      copyLabel: /copyLabel="결과 복사"/,
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
