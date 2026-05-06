'use client';

import { useMemo } from 'react';

import { ResultsPanel, type ToolProcessingStage } from '@/app/components/results-panel';
import { TextToolInput } from '@/app/components/text-tool-input';
import { ToolValidationMessage } from '@/app/components/tool-validation-message';
import {
  createInputValidationFailure,
  executeToolConversion,
} from '@/app/lib/tool-error-message';
import { useToolInputState } from '@/app/lib/tool-input-state';
import { convertUrlText, type UrlCodecMode } from '@/app/lib/url-codec';

const modeOptions: Array<{
  id: UrlCodecMode;
  label: string;
  helper: string;
}> = [
  {
    id: 'encode-component',
    label: '컴포넌트 인코딩',
    helper: '쿼리 값, 경로 조각처럼 URL 일부에 안전합니다.',
  },
  {
    id: 'decode-component',
    label: '컴포넌트 디코딩',
    helper: '%ED%95%9C%EA%B8%80 같은 값을 원문으로 되돌립니다.',
  },
  {
    id: 'encode-full',
    label: '전체 URL 인코딩',
    helper: 'https://, ?, &, = 같은 URL 구분자는 유지합니다.',
  },
  {
    id: 'decode-full',
    label: '전체 URL 디코딩',
    helper: '전체 URL의 인코딩된 문자만 원문으로 되돌립니다.',
  },
  {
    id: 'parse',
    label: 'URL 파싱',
    helper: '프로토콜, 호스트, 경로, 쿼리 파라미터를 JSON으로 분해합니다.',
  },
];

const emptyInputFailure = createInputValidationFailure('URL 또는 URL 컴포넌트를 입력해주세요.');

export default function UrlEncoderDecoderPage() {
  const { inputState, setInputValue } = useToolInputState<{
    value: string;
    mode: UrlCodecMode;
  }>({
    value: '',
    mode: 'encode-component',
  });
  const { value: input, mode } = inputState.values;

  const { output, error, emptyMessage, processingFailureStage } = useMemo(() => {
    if (!input.trim()) {
      return {
        output: '',
        error: emptyInputFailure.message,
        emptyMessage: emptyInputFailure.emptyMessage,
        processingFailureStage: 'parsing' as ToolProcessingStage,
      };
    }

    const result = executeToolConversion({
      input,
      transform: (input) => convertUrlText(input, mode),
      emptyInputMessage: emptyInputFailure.message,
      emptyResultMessage: 'URL 또는 URL 컴포넌트를 입력하면 결과가 표시됩니다.',
      defaultErrorMessage: 'URL 변환 중 오류가 발생했습니다.',
    });

    return {
      ...result,
      processingFailureStage: result.error ? 'converting' as ToolProcessingStage : null,
    };
  }, [input, mode]);

  const activeMode = modeOptions.find((option) => option.id === mode);

  return (
    <div className="app-stack">
      <section className="app-panel app-panel-flat app-panel-body">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="app-kicker text-slate-500">URL Codec</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
              URL 인코딩/디코딩 및 파싱
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              외부 API 없이 브라우저에서만 처리됩니다.
            </p>
          </div>
          <span className="app-chip rounded-lg">로컬 처리</span>
        </div>

        <div className="mt-5 grid gap-4">
          <div>
            <label htmlFor="url-codec-mode" className="text-sm font-semibold text-slate-800">
              변환 모드
            </label>
            <select
              id="url-codec-mode"
              value={mode}
              onChange={(event) => setInputValue('mode', event.target.value as UrlCodecMode)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {modeOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-slate-500">{activeMode?.helper}</p>
          </div>

          <TextToolInput
            id="url-codec-input"
            label="입력"
            value={input}
            onValueChange={(value) => setInputValue('value', value)}
            exampleValue={mode === 'parse' ? 'https://example.com/search?q=dev%20tools&lang=ko' : 'https://example.com/search?q=한글 값&tag=dev tools'}
            placeholder="https://example.com/search?q=한글 값 또는 q%3Ddev%2520tools"
            minHeightClassName="min-h-52"
          />

          <ToolValidationMessage message={error} />
        </div>
      </section>

      <ResultsPanel
        title="변환 결과"
        description="입력값을 선택한 URL 모드로 즉시 변환합니다."
        copyValue={output}
        copyLabel="결과 복사"
        copyAriaLabel="URL 변환 결과 복사"
        copyCopiedMessage="URL 변환 결과를 클립보드에 복사했습니다."
        copyEmptyMessage="복사할 URL 변환 결과가 없습니다."
        emptyMessage={emptyMessage}
        errorMessage={error}
        defaultErrorMessage="URL 변환 중 오류가 발생했습니다."
        processingStage={output ? 'complete' : 'parsing'}
        failureStage={processingFailureStage}
        isEmpty={!output}
      >
        <pre className="result-output max-h-[520px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100">
          <code className="break-words font-mono">{output}</code>
        </pre>
      </ResultsPanel>
    </div>
  );
}
