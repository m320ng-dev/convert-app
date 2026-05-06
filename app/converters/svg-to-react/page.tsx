'use client';

import { useMemo, useState } from 'react';

import { ResultsPanel } from '@/app/components/results-panel';
import { TextToolInput } from '@/app/components/text-tool-input';
import { ToolValidationMessage } from '@/app/components/tool-validation-message';
import { convertSvgToReactComponent } from '@/app/lib/svg-to-react';
import {
  createInputValidationFailure,
  executeToolConversion,
} from '@/app/lib/tool-error-message';

const emptyInputFailure = createInputValidationFailure('SVG 마크업을 입력해주세요.');

export default function SvgToReactPage() {
  const [input, setInput] = useState('<svg viewBox="0 0 24 24"><path class="icon" d="M4 12h16" /></svg>');
  const [componentName, setComponentName] = useState('SvgIcon');

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
      transform: (input) => convertSvgToReactComponent(input, componentName),
      emptyInputMessage: emptyInputFailure.message,
      emptyResultMessage: 'SVG 마크업을 입력하면 결과가 표시됩니다.',
      defaultErrorMessage: 'SVG 변환 중 오류가 발생했습니다.',
    });
  }, [input, componentName]);

  const copyValue = output;

  return (
    <div className="app-stack">
      <section className="app-panel app-panel-flat app-panel-body">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="app-kicker text-slate-500">Code Utility</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
              SVG → React 변환기
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              SVG 마크업을 React 컴포넌트 코드로 브라우저에서 변환합니다.
            </p>
          </div>
          <span className="app-chip rounded-lg">로컬 처리</span>
        </div>

        <div className="mt-5 grid gap-4">
          <div>
            <label htmlFor="svg-component-name" className="text-sm font-semibold text-slate-800">
              컴포넌트 이름
            </label>
            <input
              id="svg-component-name"
              type="text"
              value={componentName}
              onChange={(event) => setComponentName(event.target.value)}
              placeholder="SvgIcon"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <TextToolInput
            id="svg-to-react-input"
            label="SVG 마크업"
            value={input}
            onValueChange={setInput}
            exampleValue='<svg viewBox="0 0 24 24"><path class="icon" d="M4 12h16" /></svg>'
            placeholder='<svg viewBox="0 0 24 24">...</svg>'
            minHeightClassName="min-h-64"
          />

          <ToolValidationMessage message={error} />
        </div>
      </section>

      <ResultsPanel
        title="변환 결과"
        description="SVG 속성명을 React JSX 속성명으로 정리한 컴포넌트 코드를 표시합니다."
        copyValue={copyValue}
        copyLabel="결과 복사"
        copyAriaLabel="SVG React 변환 결과 복사"
        copyCopiedMessage="SVG React 변환 결과를 클립보드에 복사했습니다."
        copyEmptyMessage="복사할 SVG React 변환 결과가 없습니다."
        emptyMessage={emptyMessage}
        errorMessage={error}
        defaultErrorMessage="SVG 변환 중 오류가 발생했습니다."
        isEmpty={!output}
      >
        <pre className="result-output max-h-[560px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100">
          <code className="break-words font-mono">{output}</code>
        </pre>
      </ResultsPanel>
    </div>
  );
}
