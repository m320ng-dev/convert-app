'use client';

import { useMemo, useState } from 'react';

import { ResultsPanel } from '@/app/components/results-panel';
import { TextToolInput } from '@/app/components/text-tool-input';
import { ToolValidationMessage } from '@/app/components/tool-validation-message';
import { formatJsonText, type JsonFormatterMode } from '@/app/lib/json-formatter';
import {
  createInputValidationFailure,
  executeToolConversion,
} from '@/app/lib/tool-error-message';

const modeOptions: Array<{
  id: JsonFormatterMode;
  label: string;
  description: string;
}> = [
  {
    id: 'format',
    label: '포맷팅',
    description: '2칸 들여쓰기로 읽기 쉽게 정렬합니다.',
  },
  {
    id: 'minify',
    label: '압축',
    description: '공백과 줄바꿈을 제거한 한 줄 JSON으로 변환합니다.',
  },
  {
    id: 'validate',
    label: '검증',
    description: 'JSON 파싱 가능 여부를 확인합니다.',
  },
];

const emptyInputFailure = createInputValidationFailure('JSON을 입력해주세요.');

export default function JsonFormatterPage() {
  const [input, setInput] = useState('{"name":"convertapp","localOnly":true}');
  const [mode, setMode] = useState<JsonFormatterMode>('format');

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
      transform: (input) => formatJsonText(input, mode),
      emptyInputMessage: emptyInputFailure.message,
      emptyResultMessage: 'JSON을 입력하면 결과가 표시됩니다.',
      defaultErrorMessage: 'JSON 변환 중 오류가 발생했습니다.',
    });
  }, [input, mode]);

  const activeMode = modeOptions.find((option) => option.id === mode);
  const copyValue = output;

  return (
    <div className="app-stack">
      <section className="app-panel app-panel-flat app-panel-body">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="app-kicker text-slate-500">JSON Utility</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
              JSON 포맷팅/압축/검증
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              외부 API 없이 브라우저에서만 처리됩니다.
            </p>
          </div>
          <span className="app-chip rounded-lg">로컬 처리</span>
        </div>

        <div className="mt-5 grid gap-4">
          <div>
            <label htmlFor="json-formatter-mode" className="text-sm font-semibold text-slate-800">
              처리 모드
            </label>
            <select
              id="json-formatter-mode"
              value={mode}
              onChange={(event) => setMode(event.target.value as JsonFormatterMode)}
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
            id="json-formatter-input"
            label="JSON 입력"
            value={input}
            onValueChange={setInput}
            exampleValue='{"name":"convertapp","localOnly":true,"tags":["api","utility"]}'
            placeholder='{"id": 1, "name": "convertapp"}'
            minHeightClassName="min-h-64"
          />

          <ToolValidationMessage message={error} />
        </div>
      </section>

      <ResultsPanel
        title="변환 결과"
        description="입력한 JSON을 선택한 모드로 즉시 변환합니다."
        copyValue={copyValue}
        copyLabel="결과 복사"
        copyAriaLabel="JSON 변환 결과 복사"
        copyCopiedMessage="JSON 결과를 클립보드에 복사했습니다."
        copyEmptyMessage="복사할 JSON 결과가 없습니다."
        emptyMessage={emptyMessage}
        errorMessage={error}
        defaultErrorMessage="JSON 변환 중 오류가 발생했습니다."
        isEmpty={!output}
      >
        <pre className="result-output max-h-[560px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100">
          <code className="break-words font-mono">{output}</code>
        </pre>
      </ResultsPanel>
    </div>
  );
}
