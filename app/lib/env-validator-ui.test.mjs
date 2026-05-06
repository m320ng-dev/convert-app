import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envValidatorPageSource = readFileSync(
  resolve(import.meta.dirname, '../converters/env-validator/page.tsx'),
  'utf8',
);

test('.env validator renders inline feedback beside affected lines and variables', () => {
  assert.match(envValidatorPageSource, /const lineIssueMap = useMemo/);
  assert.match(envValidatorPageSource, /nextLineIssueMap\.get\(issue\.line\)/);
  assert.match(envValidatorPageSource, /const envPreviewLines = useMemo/);
  assert.match(envValidatorPageSource, /envPreviewLines\.map\(\(line, index\) =>/);
  assert.match(envValidatorPageSource, /const lineIssues = lineIssueMap\.get\(lineNumber\) \?\? \[\]/);
  assert.match(envValidatorPageSource, /라인별 검토/);
  assert.match(envValidatorPageSource, /lineIssues\.map\(\(issue\) =>/);
  assert.match(envValidatorPageSource, /issue\.key &&/);
  assert.match(envValidatorPageSource, /변수 \{issue\.key\}/);
  assert.match(envValidatorPageSource, /getEnvIssueFeedback\(issue\)\.message/);
});

test('.env validator updates empty, valid, warning, and error feedback from current edits', () => {
  assert.match(envValidatorPageSource, /getEnvValidationFeedbackState/);
  assert.match(envValidatorPageSource, /const liveFeedback = useMemo/);
  assert.match(envValidatorPageSource, /getEnvValidationFeedbackState\(input\)/);
  assert.match(envValidatorPageSource, /ToolValidationMessage/);
  assert.match(envValidatorPageSource, /message=\{liveFeedback\.message\}/);
  assert.match(envValidatorPageSource, /tone=\{liveFeedback\.tone === 'valid' \? 'success' : liveFeedback\.tone\}/);
  assert.match(envValidatorPageSource, /tone: 'valid'/);
  assert.match(envValidatorPageSource, /tone: 'warning'/);
  assert.match(envValidatorPageSource, /tone: 'error'/);
  assert.doesNotMatch(envValidatorPageSource, /clearTransientState\(\);/);
});

test('.env validator shows validation state and error guidance inside the result area', () => {
  assert.match(envValidatorPageSource, /title="검증 결과"/);
  assert.match(envValidatorPageSource, /aria-label="현재 \.env 검증 상태"/);
  assert.match(envValidatorPageSource, /상태 메시지/);
  assert.match(envValidatorPageSource, /\{liveFeedback\.message\}/);
  assert.match(envValidatorPageSource, /\{hasBlockingError \? '오류 있음' : visibleIssues\.length > 0 \? '경고 있음' : '검증 통과'\}/);
  assert.match(envValidatorPageSource, /getEnvIssueFeedback\(issue\)\.message/);
});
