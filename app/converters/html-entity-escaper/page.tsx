'use client';

import { useMemo } from 'react';

import { ResultsPanel } from '@/app/components/results-panel';
import { TextToolInput } from '@/app/components/text-tool-input';
import { ToolValidationMessage } from '@/app/components/tool-validation-message';
import {
  convertHtmlEntityText,
  type HtmlEntityCodecMode,
} from '@/app/lib/html-entity-codec';
import {
  createInputValidationFailure,
  executeToolConversion,
} from '@/app/lib/tool-error-message';
import { useToolInputState } from '@/app/lib/tool-input-state';

const modeOptions: Array<{
  id: HtmlEntityCodecMode;
  label: string;
  description: string;
}> = [
  {
    id: 'escape',
    label: '이스케이프',
    description: '<, >, &, 따옴표를 HTML 엔티티로 변환합니다.',
  },
  {
    id: 'unescape',
    label: '언이스케이프',
    description: '&lt;, &#39;, &#xD55C; 같은 엔티티를 원문으로 되돌립니다.',
  },
];

const emptyInputFailure = createInputValidationFailure('변환할 HTML 텍스트 또는 엔티티를 입력해주세요.');

export default function HtmlEntityEscaperPage() {
  const { inputState, setInputValue } = useToolInputState<{
    value: string;
    mode: HtmlEntityCodecMode;
  }>({
    value: '<button title="convertapp">실행</button>',
    mode: 'escape',
  });
  const { value: input, mode } = inputState.values;
  const setInput = (value: string) => setInputValue('value', value);
  const setMode = (value: HtmlEntityCodecMode) => setInputValue('mode', value);

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
      transform: (value) => convertHtmlEntityText(value, mode),
      emptyInputMessage: emptyInputFailure.message,
      emptyResultMessage: 'HTML 텍스트 또는 엔티티를 입력하면 결과가 표시됩니다.',
      defaultErrorMessage: 'HTML 엔티티 변환 중 오류가 발생했습니다.',
    });
  }, [input, mode]);

  const activeMode = modeOptions.find((option) => option.id === mode);

  return (
    <div className="app-stack">
      <section className="app-panel app-panel-flat app-panel-body">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="app-kicker text-slate-500">Text Utility</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
              HTML 엔티티 이스케이프/언이스케이프
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              외부 API 없이 브라우저에서만 처리됩니다.
            </p>
          </div>
          <span className="app-chip rounded-lg">로컬 처리</span>
        </div>

        <div className="mt-5 grid gap-4">
          <div>
            <label htmlFor="html-entity-mode" className="text-sm font-semibold text-slate-800">
              변환 모드
            </label>
            <select
              id="html-entity-mode"
              value={mode}
              onChange={(event) => setMode(event.target.value as HtmlEntityCodecMode)}
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
            id="html-entity-input"
            label={mode === 'escape' ? 'HTML 텍스트 입력' : 'HTML 엔티티 입력'}
            value={input}
            onValueChange={setInput}
            exampleValue={mode === 'escape' ? '<button title="convertapp">실행</button>' : '&lt;button title=&quot;convertapp&quot;&gt;실행&lt;/button&gt;'}
            placeholder={mode === 'escape' ? '<main>한글 & symbols</main>' : '&lt;main&gt;한글 &amp; symbols&lt;/main&gt;'}
            minHeightClassName="min-h-52"
          />

          <ToolValidationMessage message={error} />
        </div>
      </section>

      <ResultsPanel
        title="변환 결과"
        description="선택한 모드에 맞춰 HTML 특수 문자와 엔티티를 즉시 변환합니다."
        copyValue={output}
        copyLabel="결과 복사"
        copyAriaLabel="HTML 엔티티 변환 결과 복사"
        copyCopiedMessage="HTML 엔티티 변환 결과를 클립보드에 복사했습니다."
        copyEmptyMessage="복사할 HTML 엔티티 변환 결과가 없습니다."
        emptyMessage={emptyMessage}
        errorMessage={error}
        defaultErrorMessage="HTML 엔티티 변환 중 오류가 발생했습니다."
        isEmpty={!output}
      >
        <pre className="result-output max-h-[520px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100">
          <code className="break-words font-mono">{output}</code>
        </pre>
      </ResultsPanel>
    </div>
  );
}
