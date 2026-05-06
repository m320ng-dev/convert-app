'use client';

import { useMemo, useState } from 'react';

import { ResultsPanel } from '@/app/components/results-panel';
import { TextToolInput } from '@/app/components/text-tool-input';
import { ToolValidationMessage } from '@/app/components/tool-validation-message';
import { convertTimestampText, type TimestampMode } from '@/app/lib/timestamp-converter';
import {
  createInputValidationFailure,
  executeToolConversion,
} from '@/app/lib/tool-error-message';

const modeOptions: Array<{
  id: TimestampMode;
  label: string;
  description: string;
}> = [
  {
    id: 'timestamp-to-date',
    label: 'Timestamp → ISO 날짜',
    description: '초 또는 밀리초 단위 Unix timestamp를 ISO 날짜로 변환합니다.',
  },
  {
    id: 'date-to-timestamp',
    label: '날짜 → Timestamp',
    description: '브라우저가 해석할 수 있는 날짜 문자열을 초 단위 timestamp로 변환합니다.',
  },
];

const emptyInputFailure = createInputValidationFailure('Timestamp 또는 날짜를 입력해주세요.');

export default function TimestampConverterPage() {
  const [input, setInput] = useState('1704067200');
  const [mode, setMode] = useState<TimestampMode>('timestamp-to-date');

  const { output, error, emptyMessage } = useMemo(() => {
    if (!input.trim()) {
      return {
        output: '',
        error: emptyInputFailure.message,
        emptyMessage: emptyInputFailure.emptyMessage,
      };
    }

    return executeToolConversion({
      input,
      transform: (input) => convertTimestampText(input, mode),
      emptyInputMessage: emptyInputFailure.message,
      emptyResultMessage: 'Timestamp 또는 날짜를 입력하면 결과가 표시됩니다.',
      defaultErrorMessage: 'Timestamp 변환 중 오류가 발생했습니다.',
    });
  }, [input, mode]);

  const activeMode = modeOptions.find((option) => option.id === mode);
  const copyValue = output;

  return (
    <div className="app-stack">
      <section className="app-panel app-panel-flat app-panel-body">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="app-kicker text-slate-500">Data Utility</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
              Unix Timestamp ↔ 날짜
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Unix timestamp와 날짜 문자열을 외부 API 없이 브라우저에서 변환합니다.
            </p>
          </div>
          <span className="app-chip rounded-lg">로컬 처리</span>
        </div>

        <div className="mt-5 grid gap-4">
          <div>
            <label htmlFor="timestamp-converter-mode" className="text-sm font-semibold text-slate-800">
              변환 모드
            </label>
            <select
              id="timestamp-converter-mode"
              value={mode}
              onChange={(event) => setMode(event.target.value as TimestampMode)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {modeOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-slate-500">{activeMode?.description}</p>
          </div>

          <TextToolInput
            id="timestamp-converter-input"
            label={mode === 'timestamp-to-date' ? 'Unix timestamp 입력' : '날짜 입력'}
            value={input}
            onValueChange={setInput}
            exampleValue={mode === 'timestamp-to-date' ? '1704067200' : '2024-01-01T00:00:00Z'}
            placeholder={mode === 'timestamp-to-date' ? '1704067200 또는 1704067200000' : '2024-01-01T00:00:00Z'}
            minHeightClassName="min-h-40"
          />

          <ToolValidationMessage message={error} />
        </div>
      </section>

      <ResultsPanel
        title="변환 결과"
        description="선택한 방향으로 timestamp와 날짜를 변환합니다."
        copyValue={copyValue}
        copyLabel="결과 복사"
        copyAriaLabel="Timestamp 변환 결과 복사"
        copyCopiedMessage="Timestamp 변환 결과를 클립보드에 복사했습니다."
        copyEmptyMessage="복사할 Timestamp 변환 결과가 없습니다."
        emptyMessage={emptyMessage}
        errorMessage={error}
        defaultErrorMessage="Timestamp 변환 중 오류가 발생했습니다."
        isEmpty={!output}
      >
        <pre className="result-output max-h-[560px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100">
          <code className="break-words font-mono">{output}</code>
        </pre>
      </ResultsPanel>
    </div>
  );
}
