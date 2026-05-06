'use client';

import { useMemo, useState } from 'react';

import { ResultsPanel } from '@/app/components/results-panel';
import { TextToolInput } from '@/app/components/text-tool-input';
import { ToolValidationMessage } from '@/app/components/tool-validation-message';
import {
  convertCsvJson,
  type CsvJsonConversionMode,
} from '@/app/lib/csv-json-converter';
import {
  createInputValidationFailure,
  executeToolConversion,
} from '@/app/lib/tool-error-message';

const modeOptions: Array<{
  id: CsvJsonConversionMode;
  label: string;
  description: string;
}> = [
  {
    id: 'csv-to-json',
    label: 'CSV → JSON',
    description: '첫 행을 헤더로 사용해 JSON 객체 배열로 변환합니다.',
  },
  {
    id: 'json-to-csv',
    label: 'JSON → CSV',
    description: 'JSON 객체 배열을 헤더가 있는 CSV 텍스트로 변환합니다.',
  },
];

const sampleInputs: Record<CsvJsonConversionMode, string> = {
  'csv-to-json': 'name,role\nLee,developer\nKim,tester',
  'json-to-csv': '[{"name":"Lee","role":"developer"},{"name":"Kim","role":"tester"}]',
};

const emptyInputFailure = createInputValidationFailure('CSV 또는 JSON을 입력해주세요.');

export default function CsvJsonConverterPage() {
  const [mode, setMode] = useState<CsvJsonConversionMode>('csv-to-json');
  const [input, setInput] = useState(sampleInputs['csv-to-json']);

  function handleModeChange(nextMode: CsvJsonConversionMode) {
    setMode(nextMode);
    setInput(sampleInputs[nextMode]);
  }

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
      transform: (input) => convertCsvJson(input, mode),
      emptyInputMessage: emptyInputFailure.message,
      emptyResultMessage: 'CSV 또는 JSON을 입력하면 결과가 표시됩니다.',
      defaultErrorMessage: 'CSV/JSON 변환 중 오류가 발생했습니다.',
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
              CSV ↔ JSON 변환기
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              외부 API 없이 브라우저에서만 처리됩니다.
            </p>
          </div>
          <span className="app-chip rounded-lg">로컬 처리</span>
        </div>

        <div className="mt-5 grid gap-4">
          <div>
            <label htmlFor="csv-json-converter-mode" className="text-sm font-semibold text-slate-800">
              변환 모드
            </label>
            <select
              id="csv-json-converter-mode"
              value={mode}
              onChange={(event) => handleModeChange(event.target.value as CsvJsonConversionMode)}
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
            id="csv-json-converter-input"
            label={mode === 'csv-to-json' ? 'CSV 입력' : 'JSON 입력'}
            value={input}
            onValueChange={setInput}
            exampleValue={sampleInputs[mode]}
            placeholder={mode === 'csv-to-json' ? 'name,role\nLee,developer' : '[{"name":"Lee","role":"developer"}]'}
            minHeightClassName="min-h-64"
          />

          <ToolValidationMessage message={error} />
        </div>
      </section>

      <ResultsPanel
        title="변환 결과"
        description="선택한 방향에 맞춰 CSV와 JSON을 즉시 변환합니다."
        copyValue={copyValue}
        copyLabel="결과 복사"
        copyAriaLabel="CSV/JSON 변환 결과 복사"
        copyCopiedMessage="CSV/JSON 변환 결과를 클립보드에 복사했습니다."
        copyEmptyMessage="복사할 CSV/JSON 변환 결과가 없습니다."
        emptyMessage={emptyMessage}
        errorMessage={error}
        defaultErrorMessage="CSV/JSON 변환 중 오류가 발생했습니다."
        isEmpty={!output}
      >
        <pre className="result-output max-h-[560px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100">
          <code className="break-words font-mono">{output}</code>
        </pre>
      </ResultsPanel>
    </div>
  );
}
