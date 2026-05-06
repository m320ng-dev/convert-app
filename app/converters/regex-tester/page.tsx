'use client';

import { useMemo, useState } from 'react';

import { ResultsPanel, type ToolProcessingStage } from '@/app/components/results-panel';
import { TextToolInput } from '@/app/components/text-tool-input';
import { ToolValidationMessage } from '@/app/components/tool-validation-message';
import {
  buildRegexHighlightedSegments,
  formatRegexResult,
  testRegexPattern,
} from '@/app/lib/regex-tester';
import {
  DEFAULT_EXCESSIVE_INPUT_ERROR_MESSAGE,
  MAX_TEXT_TOOL_INPUT_LENGTH,
  validateToolTextInput,
} from '@/app/lib/tool-error-message';
import { useToolInputState } from '@/app/lib/tool-input-state';

type RegexFlagKey = 'global' | 'ignoreCase' | 'multiline' | 'dotAll' | 'unicode' | 'sticky';

const regexFlagOptions: Array<{
  key: RegexFlagKey;
  flag: string;
  label: string;
  helper: string;
}> = [
  { key: 'global', flag: 'g', label: 'g', helper: '전체 매칭' },
  { key: 'ignoreCase', flag: 'i', label: 'i', helper: '대소문자 무시' },
  { key: 'multiline', flag: 'm', label: 'm', helper: '여러 줄' },
  { key: 'dotAll', flag: 's', label: 's', helper: '점이 줄바꿈 포함' },
  { key: 'unicode', flag: 'u', label: 'u', helper: '유니코드' },
  { key: 'sticky', flag: 'y', label: 'y', helper: 'lastIndex 고정' },
];

const exampleRegexInput = {
  pattern: '\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b',
  testText: 'Contact dev@example.com or ops@example.io',
  enabledFlags: 'gi',
};

export default function RegexTesterPage() {
  const [clipboardError, setClipboardError] = useState<string | null>(null);
  const { inputState, setInputValue } = useToolInputState({
    pattern: exampleRegexInput.pattern,
    testText: exampleRegexInput.testText,
    enabledFlags: exampleRegexInput.enabledFlags,
  });
  const { pattern, testText, enabledFlags } = inputState.values;
  const setPattern = (value: string) => {
    setClipboardError(null);
    setInputValue('pattern', value);
  };
  const setTestText = (value: string) => {
    setClipboardError(null);
    setInputValue('testText', value);
  };
  const setEnabledFlags = (value: string) => {
    setClipboardError(null);
    setInputValue('enabledFlags', value);
  };

  const flags = useMemo(
    () => regexFlagOptions.reduce<Record<RegexFlagKey, boolean>>((currentFlags, flag) => ({
      ...currentFlags,
      [flag.key]: enabledFlags.includes(flag.flag),
    }), {
      global: false,
      ignoreCase: false,
      multiline: false,
      dotAll: false,
      unicode: false,
      sticky: false,
    }),
    [enabledFlags],
  );

  const { result, error, errorField, processingFailureStage } = useMemo(
    () => {
      const inputValidationFailure = validateToolTextInput(testText, '테스트 텍스트를 입력해주세요.', {
        maxLength: MAX_TEXT_TOOL_INPUT_LENGTH,
        excessiveInputMessage: DEFAULT_EXCESSIVE_INPUT_ERROR_MESSAGE,
      });

      if (inputValidationFailure) {
        return {
          result: null,
          error: inputValidationFailure.message,
          errorField: 'text',
          processingFailureStage: 'parsing' as ToolProcessingStage,
        };
      }

      const execution = testRegexPattern(pattern, testText, enabledFlags);

      return {
        ...execution,
        processingFailureStage: execution.error ? 'converting' as ToolProcessingStage : null,
      };
    },
    [pattern, testText, enabledFlags],
  );
  const isPatternInvalid = errorField === 'pattern';
  const isFlagsInvalid = errorField === 'flags';

  const highlightedSegments = useMemo(
    () => (result ? buildRegexHighlightedSegments(testText, result.matches) : []),
    [testText, result],
  );

  const copyValue = useMemo(() => formatRegexResult(result), [result]);

  const handleFlagChange = (key: RegexFlagKey) => {
    const selectedFlag = regexFlagOptions.find((flag) => flag.key === key);

    if (!selectedFlag) {
      return;
    }

    setEnabledFlags(
      enabledFlags.includes(selectedFlag.flag)
        ? enabledFlags.replaceAll(selectedFlag.flag, '')
        : `${enabledFlags}${selectedFlag.flag}`,
    );
  };

  function handleResetInputs() {
    setInputValue('pattern', '');
    setInputValue('testText', '');
    setInputValue('enabledFlags', '');
    setClipboardError(null);
  }

  function handleApplyExampleInputs() {
    setInputValue('pattern', exampleRegexInput.pattern);
    setInputValue('testText', exampleRegexInput.testText);
    setInputValue('enabledFlags', exampleRegexInput.enabledFlags);
    setClipboardError(null);
  }

  async function readRegexClipboardText() {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
        setClipboardError('클립보드에서 텍스트를 가져오지 못했습니다.');
        return null;
      }

      const clipboardText = await navigator.clipboard.readText();

      setClipboardError(null);

      return clipboardText;
    } catch {
      setClipboardError('클립보드에서 텍스트를 가져오지 못했습니다.');
      return null;
    }
  }

  function formatRegexInputForCopy() {
    return [
      `패턴: ${pattern}`,
      `플래그: ${enabledFlags || '(없음)'}`,
      '테스트 텍스트:',
      testText,
    ].join('\n');
  }

  async function handleCopyRegexInputsToClipboard() {
    if (!pattern && !enabledFlags && !testText) {
      setClipboardError('복사할 입력값이 없습니다.');
      return;
    }

    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        setClipboardError('클립보드에 복사하지 못했습니다.');
        return;
      }

      await navigator.clipboard.writeText(formatRegexInputForCopy());
      setClipboardError('입력값을 클립보드에 복사했습니다.');
    } catch {
      setClipboardError('클립보드에 복사하지 못했습니다.');
    }
  }

  async function handlePastePatternFromClipboard() {
    const clipboardText = await readRegexClipboardText();

    if (clipboardText !== null) {
      setInputValue('pattern', clipboardText);
    }
  }

  async function handlePasteFlagsFromClipboard() {
    const clipboardText = await readRegexClipboardText();

    if (clipboardText !== null) {
      setInputValue('enabledFlags', clipboardText.trim());
    }
  }

  return (
    <div className="app-stack">
      <section className="app-panel app-panel-flat app-panel-body">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="app-kicker text-slate-500">API 유틸리티</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
              Regex 테스트 도구
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              정규식 패턴과 플래그를 브라우저에서 즉시 테스트합니다.
            </p>
          </div>
          <span className="app-chip rounded-lg">로컬 처리</span>
        </div>

        <div className="mt-5 grid gap-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="regex-pattern" className="text-sm font-semibold text-slate-800">
                Regex 패턴
              </label>
              <button
                type="button"
                onClick={handlePastePatternFromClipboard}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                클립보드 붙여넣기
              </button>
            </div>
            <input
              id="regex-pattern"
              type="text"
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
              placeholder="예: \\b\\w+@\\w+\\.com\\b"
              aria-invalid={isPatternInvalid}
              aria-describedby={isPatternInvalid ? 'regex-validation-error' : undefined}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              spellCheck={false}
            />
          </div>

          <fieldset>
            <legend className="text-sm font-semibold text-slate-800">Regex flags</legend>
            <div className="mt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="regex-flags-input" className="text-sm font-semibold text-slate-800">
                  Regex 플래그 직접 입력
                </label>
                <button
                  type="button"
                  onClick={handlePasteFlagsFromClipboard}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  클립보드 붙여넣기
                </button>
              </div>
              <input
                id="regex-flags-input"
                type="text"
                value={enabledFlags}
                onChange={(event) => setEnabledFlags(event.target.value)}
                placeholder="예: gim"
                aria-invalid={isFlagsInvalid}
                aria-describedby={isFlagsInvalid ? 'regex-validation-error regex-flags-help' : 'regex-flags-help'}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                spellCheck={false}
              />
              <p id="regex-flags-help" className="mt-2 text-xs leading-5 text-slate-500">
                체크박스로 자주 쓰는 플래그를 고르거나, JavaScript RegExp 플래그 문자열을 직접 입력하세요.
              </p>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {regexFlagOptions.map((flag) => (
                <label
                  key={flag.key}
                  className="flex min-h-14 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={flags[flag.key]}
                    onChange={() => handleFlagChange(flag.key)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="min-w-0">
                    <span className="block font-mono font-semibold text-slate-900">
                      {flag.label}
                    </span>
                    <span className="block text-xs text-slate-500">{flag.helper}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <TextToolInput
            id="regex-test-text"
            label="테스트 텍스트"
            value={testText}
            onValueChange={setTestText}
            exampleValue={exampleRegexInput.testText}
            placeholder="패턴을 테스트할 텍스트를 입력하세요."
            minHeightClassName="min-h-52"
          />

          <ToolValidationMessage id="regex-validation-error" message={error} />
          <ToolValidationMessage
            message={clipboardError}
            tone={clipboardError === '입력값을 클립보드에 복사했습니다.' ? 'success' : 'warning'}
          />

          <div>
            <button
              type="button"
              onClick={handleApplyExampleInputs}
              className="app-button app-button-secondary mr-2"
            >
              예시 입력 적용
            </button>
            <button
              type="button"
              onClick={handleCopyRegexInputsToClipboard}
              aria-label="Regex 테스트 입력값 복사"
              className="app-button app-button-secondary mr-2"
            >
              입력값 복사
            </button>
            <button
              type="button"
              onClick={handleResetInputs}
              className="app-button app-button-secondary"
            >
              입력 초기화
            </button>
          </div>
        </div>
      </section>

      <ResultsPanel
        title="Regex 테스트 결과"
        description={result ? `총 일치 수: ${result.matchCount}` : '패턴을 입력하면 매칭 결과가 표시됩니다.'}
        copyValue={copyValue}
        copyLabel="결과 복사"
        copyAriaLabel="Regex 테스트 결과 복사"
        copyCopiedMessage="테스트 결과를 클립보드에 복사했습니다."
        copyEmptyMessage="복사할 Regex 테스트 결과가 없습니다."
        emptyMessage={error ?? 'Regex 패턴을 입력하면 결과가 표시됩니다.'}
        errorMessage={error}
        defaultErrorMessage="Regex 테스트 중 오류가 발생했습니다."
        processingStage={result ? 'complete' : 'parsing'}
        failureStage={processingFailureStage}
        isEmpty={!result || Boolean(error)}
      >
        <div className="grid gap-4">
          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-800">Matched segments</h3>
            <p className="mt-3 whitespace-pre-wrap break-words font-mono text-sm leading-7 text-slate-800">
              {highlightedSegments.map((segment) => (
                segment.type === 'match' ? (
                  <mark
                    key={`${segment.index}-${segment.endIndex}-${segment.value}`}
                    title={`${segment.index}-${segment.endIndex}`}
                    className="rounded bg-amber-200 px-1 py-0.5 text-slate-950"
                  >
                    {segment.value}
                  </mark>
                ) : (
                  <span key={`${segment.index}-${segment.endIndex}`}>{segment.value}</span>
                )
              ))}
            </p>
          </section>

          <section className="grid gap-3">
            {result && result.matches.map((match, index) => (
              <article
                key={`${match.index}-${match.endIndex}-${index}`}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">Match {index + 1}</h3>
                  <span className="font-mono text-xs text-slate-500">
                    {match.index}-{match.endIndex}
                  </span>
                </div>
                <pre className="mt-3 overflow-auto rounded-md bg-slate-950 p-3 text-sm leading-6 text-slate-100">
                  <code className="font-mono">{match.value || '(empty)'}</code>
                </pre>

                {match.groups.length > 0 && (
                  <div
                    className="mt-3"
                    aria-labelledby={`regex-match-${index + 1}-groups-title`}
                    data-regex-match-index={index + 1}
                  >
                    <p
                      id={`regex-match-${index + 1}-groups-title`}
                      className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
                    >
                      Match {index + 1} 캡처 그룹
                    </p>
                    <ul className="mt-2 grid gap-2">
                      {match.groups.map((group, groupIndex) => (
                        <li
                          key={`${groupIndex}-${group}`}
                          data-regex-group-index={groupIndex + 1}
                          className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700"
                        >
                          <span className="font-semibold text-slate-500">
                            Group {groupIndex + 1}
                          </span>
                          <span className="ml-2 text-slate-800">{group || '(empty)'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </section>
        </div>
      </ResultsPanel>
    </div>
  );
}
