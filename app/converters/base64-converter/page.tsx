'use client';

import { useMemo, useState } from 'react';

import { ResultsPanel } from '@/app/components/results-panel';
import { TextToolInput } from '@/app/components/text-tool-input';
import { ToolValidationMessage } from '@/app/components/tool-validation-message';
import { convertBase64Text, type Base64Mode } from '@/app/lib/base64-codec';
import {
  createInputValidationFailure,
  executeToolConversion,
} from '@/app/lib/tool-error-message';

const modeOptions: Array<{
  id: Base64Mode;
  label: string;
  description: string;
}> = [
  {
    id: 'encode',
    label: '인코딩',
    description: 'UTF-8 텍스트를 Base64 문자열로 변환합니다.',
  },
  {
    id: 'decode',
    label: '디코딩',
    description: 'Base64 문자열을 UTF-8 텍스트로 변환합니다.',
  },
];

const emptyInputFailure = createInputValidationFailure('변환할 텍스트 또는 Base64 문자열을 입력해주세요.');

export default function Base64ConverterPage() {
  const [input, setInput] = useState('convertapp 로컬 도구');
  const [mode, setMode] = useState<Base64Mode>('encode');

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
      transform: (input) => convertBase64Text(input, mode),
      emptyInputMessage: emptyInputFailure.message,
      emptyResultMessage: '텍스트를 입력하면 결과가 표시됩니다.',
      defaultErrorMessage: 'Base64 변환 중 오류가 발생했습니다.',
    });
  }, [input, mode]);

  const activeMode = modeOptions.find((option) => option.id === mode);
  const copyValue = output;

  return (
    <div className="app-stack">
      <section className="app-panel app-panel-flat app-panel-body">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="app-kicker text-slate-500">Text Utility</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
              Base64 인코더/디코더
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              외부 API 없이 브라우저에서만 처리됩니다.
            </p>
          </div>
          <span className="app-chip rounded-lg">로컬 처리</span>
        </div>

        <div className="mt-5 grid gap-4">
          <div>
            <label htmlFor="base64-converter-mode" className="text-sm font-semibold text-slate-800">
              변환 모드
            </label>
            <select
              id="base64-converter-mode"
              value={mode}
              onChange={(event) => setMode(event.target.value as Base64Mode)}
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
            id="base64-converter-input"
            label={mode === 'encode' ? '텍스트 입력' : 'Base64 입력'}
            value={input}
            onValueChange={setInput}
            exampleValue={mode === 'encode' ? 'convertapp 로컬 도구' : 'Y29udmVydGFwcCDroZzsu7wg64+E6rWs'}
            placeholder={mode === 'encode' ? '변환할 텍스트를 입력하세요.' : 'Base64 문자열을 입력하세요.'}
            minHeightClassName="min-h-64"
          />

          <ToolValidationMessage message={error} />
        </div>
      </section>

      <ResultsPanel
        title="변환 결과"
        description="선택한 모드에 맞춰 입력값을 즉시 변환합니다."
        copyValue={copyValue}
        copyLabel="결과 복사"
        copyAriaLabel="Base64 변환 결과 복사"
        copyCopiedMessage="Base64 변환 결과를 클립보드에 복사했습니다."
        copyEmptyMessage="복사할 Base64 변환 결과가 없습니다."
        emptyMessage={emptyMessage}
        errorMessage={error}
        defaultErrorMessage="Base64 변환 중 오류가 발생했습니다."
        isEmpty={!output}
      >
        <pre className="result-output max-h-[560px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100">
          <code className="break-words font-mono">{output}</code>
        </pre>
      </ResultsPanel>
    </div>
  );
}
