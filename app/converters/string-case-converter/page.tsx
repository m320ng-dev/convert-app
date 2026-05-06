'use client';

import { useMemo } from 'react';

import { ResultsPanel, type ToolProcessingStage } from '@/app/components/results-panel';
import { CopyResultAction } from '@/app/components/copy-result-action';
import { TextToolInput } from '@/app/components/text-tool-input';
import { ToolValidationMessage } from '@/app/components/tool-validation-message';
import { convertStringCases, type StringCaseResult } from '@/app/lib/string-case';
import {
  DEFAULT_EXCESSIVE_INPUT_ERROR_MESSAGE,
  validateToolTextInput,
} from '@/app/lib/tool-error-message';
import { useToolInputState } from '@/app/lib/tool-input-state';

const exampleInput = 'user profile URL value';

const caseRows: Array<{
  key: keyof StringCaseResult;
  label: string;
}> = [
  { key: 'camelCase', label: 'camelCase' },
  { key: 'pascalCase', label: 'PascalCase' },
  { key: 'snakeCase', label: 'snake_case' },
  { key: 'kebabCase', label: 'kebab-case' },
  { key: 'constantCase', label: 'CONSTANT_CASE' },
];

function formatStringCaseResult(result: StringCaseResult) {
  return caseRows
    .map((row) => `${row.label}: ${result[row.key]}`)
    .join('\n');
}

function formatStringCaseJsonResult(result: StringCaseResult) {
  return JSON.stringify(result, null, 2);
}

export default function StringCaseConverterPage() {
  const { inputState, setInputValue } = useToolInputState({
    value: exampleInput,
  });
  const input = inputState.values.value;
  const setInput = (value: string) => setInputValue('value', value);

  const inputValidationFailure = useMemo(
    () => validateToolTextInput(input, '입력 문자열을 입력해주세요.', {
      excessiveInputMessage: DEFAULT_EXCESSIVE_INPUT_ERROR_MESSAGE,
    }),
    [input],
  );
  const error = inputValidationFailure?.message ?? null;
  const processingFailureStage = inputValidationFailure ? 'parsing' as ToolProcessingStage : null;
  const result = useMemo(
    () => convertStringCases(inputValidationFailure ? '' : input),
    [input, inputValidationFailure],
  );
  const isEmpty = caseRows.every((row) => !result[row.key]);
  const copyValue = useMemo(
    () => (isEmpty ? '' : formatStringCaseResult(result)),
    [isEmpty, result],
  );

  return (
    <div className="app-stack">
      <form
        aria-labelledby="string-case-input-heading"
        className="app-panel app-panel-flat app-panel-body"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="app-kicker text-slate-500">문자열 유틸리티</p>
            <h2
              id="string-case-input-heading"
              className="mt-2 text-lg font-semibold tracking-tight text-slate-950"
            >
              문자열 케이스 변환
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              외부 API 없이 브라우저에서만 처리됩니다.
            </p>
          </div>
          <span className="app-chip rounded-lg">로컬 처리</span>
        </div>

        <TextToolInput
          id="string-case-input"
          label="입력 문자열"
          value={input}
          onValueChange={setInput}
          exampleValue={exampleInput}
          placeholder="예: user profile URL value, HTTPResponse_code-404Message"
          containerClassName="mt-5"
          minHeightClassName="min-h-52"
        />

        <ToolValidationMessage message={error} className="mt-4" />
      </form>

      <ResultsPanel
        title="변환 결과"
        description="입력값을 주요 개발자 문자열 케이스로 변환합니다."
        actions={(
          <CopyResultAction
            value={() => (isEmpty ? '' : formatStringCaseJsonResult(result))}
            label="JSON 복사"
            ariaLabel="문자열 케이스 JSON 결과 복사"
            copiedMessage="문자열 케이스 JSON 결과를 클립보드에 복사했습니다."
            emptyMessage="복사할 문자열 케이스 변환 결과가 없습니다."
            disabled={isEmpty || Boolean(error)}
          />
        )}
        copyValue={copyValue}
        copyLabel="결과 복사"
        copyAriaLabel="문자열 케이스 변환 결과 복사"
        copyCopiedMessage="문자열 케이스 변환 결과를 클립보드에 복사했습니다."
        copyEmptyMessage="복사할 문자열 케이스 변환 결과가 없습니다."
        emptyMessage={error ?? '문자열을 입력하면 변환 결과가 표시됩니다.'}
        errorMessage={error}
        defaultErrorMessage="문자열 케이스 변환 중 오류가 발생했습니다."
        processingStage={isEmpty ? 'parsing' : 'complete'}
        failureStage={processingFailureStage}
        isEmpty={isEmpty}
      >
        <ul aria-label="문자열 케이스 변환 결과 목록" className="grid gap-3">
          {caseRows.map((row) => (
            <li
              key={row.key}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <h3 className="text-sm font-semibold text-slate-800">{row.label}</h3>
              <pre className="mt-3 overflow-auto rounded-md bg-slate-950 p-3 text-sm leading-6 text-slate-100">
                <code className="break-words font-mono">{result[row.key]}</code>
              </pre>
            </li>
          ))}
        </ul>
      </ResultsPanel>
    </div>
  );
}
