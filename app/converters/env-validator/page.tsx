'use client';

import { useMemo, useState } from 'react';

import { ResultsPanel } from '@/app/components/results-panel';
import { TextToolInput } from '@/app/components/text-tool-input';
import { ToolValidationMessage } from '@/app/components/tool-validation-message';

type EnvIssueType = 'invalid-line' | 'invalid-key' | 'duplicate-key' | 'empty-value';
type EnvIssueTone = 'error' | 'warning';

interface EnvIssue {
  line: number;
  key?: string;
  type: EnvIssueType;
  tone: EnvIssueTone;
}

interface EnvPreviewLine {
  lineNumber: number;
  raw: string;
  key?: string;
  value?: string;
}

interface EnvFeedbackState {
  tone: 'empty' | 'valid' | 'warning' | 'error';
  message: string;
}

const defaultEnvInput = 'API_BASE_URL=https://api.example.com\nFEATURE_FLAG=true\nJWT_SECRET=';

export default function EnvValidatorPage() {
  const [input, setInput] = useState(defaultEnvInput);
  const [allowExport, setAllowExport] = useState(true);
  const [warnDuplicateKeys, setWarnDuplicateKeys] = useState(true);
  const [warnEmptyValues, setWarnEmptyValues] = useState(true);
  const [showWarnings, setShowWarnings] = useState(true);

  const issues = useMemo(
    () => validateEnvInput(input, {
      allowExport,
      warnDuplicateKeys,
      warnEmptyValues,
      showWarnings,
    }),
    [allowExport, input, showWarnings, warnDuplicateKeys, warnEmptyValues],
  );
  const liveFeedback = useMemo(() => getEnvValidationFeedbackState(input), [input]);
  const lineIssueMap = useMemo(() => {
    const nextLineIssueMap = new Map<number, EnvIssue[]>();

    for (const issue of issues) {
      const currentIssues = nextLineIssueMap.get(issue.line) ?? [];
      nextLineIssueMap.set(issue.line, [...currentIssues, issue]);
    }

    return nextLineIssueMap;
  }, [issues]);
  const envPreviewLines = useMemo(() => buildEnvPreviewLines(input), [input]);
  const copyValue = useMemo(() => formatEnvValidationSummary(issues, input), [input, issues]);
  const visibleIssues = showWarnings ? issues : issues.filter((issue) => issue.tone === 'error');
  const hasBlockingError = issues.some((issue) => issue.tone === 'error');

  return (
    <div className="app-stack">
      <section className="app-panel app-panel-flat app-panel-body">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="app-kicker text-slate-500">검증 유틸리티</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
              .env 검증기
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              환경변수 형식, 중복 키, 빈 값을 외부 API 없이 브라우저에서 검토합니다.
            </p>
          </div>
          <span className="app-chip rounded-lg">로컬 처리</span>
        </div>

        <TextToolInput
          id="env-validator-input"
          label=".env 입력"
          value={input}
          onValueChange={setInput}
          exampleValue={defaultEnvInput}
          placeholder="API_KEY=local-secret"
          containerClassName="mt-5"
          minHeightClassName="min-h-56"
        />

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <ToggleOption
            label="export 접두어 허용"
            checked={allowExport}
            onChange={setAllowExport}
          />
          <ToggleOption
            label="중복 키 경고"
            checked={warnDuplicateKeys}
            onChange={setWarnDuplicateKeys}
          />
          <ToggleOption
            label="빈 값 경고"
            checked={warnEmptyValues}
            onChange={setWarnEmptyValues}
          />
          <ToggleOption
            label="경고 표시"
            checked={showWarnings}
            onChange={setShowWarnings}
          />
        </div>

        <ToolValidationMessage
          message={liveFeedback.message}
          tone={liveFeedback.tone === 'valid' ? 'success' : liveFeedback.tone}
          className="mt-4 font-semibold"
        />
      </section>

      <ResultsPanel
        title="검증 결과"
        description="라인별 검토와 변수별 피드백을 확인합니다."
        copyValue={copyValue}
        copyLabel="검증 요약 복사"
        copyAriaLabel=".env 검증 요약 복사"
        copyCopiedMessage="검증 요약을 복사했습니다."
        copyEmptyMessage="복사할 검증 결과가 없습니다."
        emptyMessage="검증할 .env 내용을 입력해주세요."
        isEmpty={!input.trim()}
      >
        <div className="grid gap-4">
          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-800">요약</h3>
              <span
                className={`rounded-md px-2 py-1 text-xs font-bold ${
                  hasBlockingError
                    ? 'bg-red-100 text-red-700'
                    : visibleIssues.length > 0
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {hasBlockingError ? '오류 있음' : visibleIssues.length > 0 ? '경고 있음' : '검증 통과'}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {copyValue}
            </p>
            <div
              aria-label="현재 .env 검증 상태"
              className={`mt-3 rounded-md border px-3 py-2 text-sm font-semibold ${
                liveFeedback.tone === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : liveFeedback.tone === 'warning'
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              <span className="mr-2 text-xs uppercase tracking-[0.12em] opacity-70">
                상태 메시지
              </span>
              {liveFeedback.message}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-bold text-slate-800">라인별 검토</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {envPreviewLines.map((line, index) => {
                const lineNumber = line.lineNumber;
                const lineIssues = lineIssueMap.get(lineNumber) ?? [];

                return (
                  <article
                    key={`${lineNumber}-${index}`}
                    className="grid gap-3 px-4 py-3 lg:grid-cols-[5rem_minmax(0,1fr)]"
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Line {lineNumber}
                    </span>
                    <div className="min-w-0">
                      <code className="block break-words rounded-md bg-slate-950 p-3 font-mono text-sm text-slate-100">
                        {line.raw || '(빈 줄)'}
                      </code>
                      {lineIssues.length > 0 ? (
                        <ul className="mt-2 grid gap-2">
                          {lineIssues.map((issue) => (
                            <li
                              key={`${issue.type}-${issue.key ?? 'line'}`}
                              className={`rounded-md border px-3 py-2 text-sm ${
                                issue.tone === 'error'
                                  ? 'border-red-200 bg-red-50 text-red-700'
                                  : 'border-amber-200 bg-amber-50 text-amber-700'
                              }`}
                            >
                              {issue.key && (
                                <span className="mr-2 font-semibold">
                                  변수 {issue.key}
                                </span>
                              )}
                              {getEnvIssueFeedback(issue).message}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm font-medium text-emerald-700">
                          이 라인은 유효합니다.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </ResultsPanel>
    </div>
  );
}

function validateEnvInput(
  value: string,
  options: {
    allowExport: boolean;
    warnDuplicateKeys: boolean;
    warnEmptyValues: boolean;
    showWarnings: boolean;
  },
): EnvIssue[] {
  const seenKeys = new Map<string, number>();
  const issues: EnvIssue[] = [];

  value.split(/\r?\n/).forEach((rawLine, index) => {
    const line = index + 1;
    const trimmedLine = rawLine.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }

    const normalizedLine =
      options.allowExport && trimmedLine.startsWith('export ')
        ? trimmedLine.slice('export '.length).trimStart()
        : trimmedLine;
    const separatorIndex = normalizedLine.indexOf('=');

    if (separatorIndex === -1) {
      issues.push({ line, type: 'invalid-line', tone: 'error' });
      return;
    }

    const key = normalizedLine.slice(0, separatorIndex).trim();
    const envValue = normalizedLine.slice(separatorIndex + 1);

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      issues.push({ line, key, type: 'invalid-key', tone: 'error' });
      return;
    }

    if (options.warnDuplicateKeys && seenKeys.has(key)) {
      issues.push({ line, key, type: 'duplicate-key', tone: 'warning' });
    }

    if (options.warnEmptyValues && envValue.trim() === '') {
      issues.push({ line, key, type: 'empty-value', tone: 'warning' });
    }

    seenKeys.set(key, line);
  });

  return options.showWarnings ? issues : issues.filter((issue) => issue.tone === 'error');
}

function buildEnvPreviewLines(value: string): EnvPreviewLine[] {
  return value.split(/\r?\n/).map((raw, index) => {
    const trimmedLine = raw.trim().replace(/^export\s+/, '');
    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex === -1) {
      return { lineNumber: index + 1, raw };
    }

    return {
      lineNumber: index + 1,
      raw,
      key: trimmedLine.slice(0, separatorIndex).trim(),
      value: trimmedLine.slice(separatorIndex + 1),
    };
  });
}

function getEnvValidationFeedbackState(value: string): EnvFeedbackState {
  if (!value.trim()) {
    return {
      tone: 'empty',
      message: '.env 내용을 입력하면 검증 결과가 표시됩니다.',
    };
  }

  const issues = validateEnvInput(value, {
    allowExport: true,
    warnDuplicateKeys: true,
    warnEmptyValues: true,
    showWarnings: true,
  });
  const hasError = issues.some((issue) => issue.tone === 'error');
  const hasWarning = issues.some((issue) => issue.tone === 'warning');

  if (hasError) {
    return {
      tone: 'error',
      message: '수정이 필요한 .env 형식 오류가 있습니다.',
    };
  }

  if (hasWarning) {
    return {
      tone: 'warning',
      message: '형식은 유효하지만 확인할 경고가 있습니다.',
    };
  }

  return {
    tone: 'valid',
    message: '.env 형식이 유효합니다.',
  };
}

function getEnvIssueFeedback(issue: EnvIssue): { message: string } {
  switch (issue.type) {
    case 'invalid-line':
      return { message: 'KEY=VALUE 형식으로 입력해주세요.' };
    case 'invalid-key':
      return { message: '변수명은 영문자 또는 밑줄로 시작하고 영문자, 숫자, 밑줄만 사용할 수 있습니다.' };
    case 'duplicate-key':
      return { message: '같은 변수가 이미 위에서 정의되었습니다.' };
    case 'empty-value':
      return { message: '값이 비어 있습니다. 의도한 빈 값인지 확인해주세요.' };
  }
}

function formatEnvValidationSummary(issues: EnvIssue[], value: string): string {
  const lines = value.trim() ? value.split(/\r?\n/).length : 0;
  const errors = issues.filter((issue) => issue.tone === 'error').length;
  const warnings = issues.filter((issue) => issue.tone === 'warning').length;

  return `총 ${lines}개 라인 검토, 오류 ${errors}개, 경고 ${warnings}개`;
}

function ToggleOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-blue-600"
      />
      <span className="font-semibold text-slate-800">{label}</span>
    </label>
  );
}
