'use client';

import { useMemo, useState } from 'react';

import { ResultsPanel } from '@/app/components/results-panel';
import { TextToolInput } from '@/app/components/text-tool-input';
import { ToolValidationMessage } from '@/app/components/tool-validation-message';
import { formatSqlText } from '@/app/lib/sql-formatter-tool';
import {
  createInputValidationFailure,
  executeToolConversion,
} from '@/app/lib/tool-error-message';

const emptyInputFailure = createInputValidationFailure('SQL 쿼리를 입력해주세요.');

export default function SqlFormatterPage() {
  const [input, setInput] = useState('select id, name from users where active = true order by created_at desc');

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
      transform: (input) => formatSqlText(input),
      emptyInputMessage: emptyInputFailure.message,
      emptyResultMessage: 'SQL 쿼리를 입력하면 결과가 표시됩니다.',
      defaultErrorMessage: 'SQL 포맷팅 중 오류가 발생했습니다.',
    });
  }, [input]);

  const copyValue = output;

  return (
    <div className="app-stack">
      <section className="app-panel app-panel-flat app-panel-body">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="app-kicker text-slate-500">Code Utility</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
              SQL 쿼리 포맷터
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              외부 API 없이 브라우저에서만 처리됩니다.
            </p>
          </div>
          <span className="app-chip rounded-lg">로컬 처리</span>
        </div>

        <div className="mt-5 grid gap-4">
          <TextToolInput
            id="sql-formatter-input"
            label="SQL 입력"
            value={input}
            onValueChange={setInput}
            exampleValue="select id, name from users where active = true order by created_at desc"
            placeholder="SELECT * FROM users WHERE active = true"
            minHeightClassName="min-h-64"
          />

          <ToolValidationMessage message={error} />
        </div>
      </section>

      <ResultsPanel
        title="포맷팅 결과"
        description="SQL 키워드와 줄바꿈을 읽기 쉬운 형태로 정리합니다."
        copyValue={copyValue}
        copyLabel="결과 복사"
        copyAriaLabel="SQL 포맷팅 결과 복사"
        copyCopiedMessage="SQL 결과를 클립보드에 복사했습니다."
        copyEmptyMessage="복사할 SQL 결과가 없습니다."
        emptyMessage={emptyMessage}
        errorMessage={error}
        defaultErrorMessage="SQL 포맷팅 중 오류가 발생했습니다."
        isEmpty={!output}
      >
        <pre className="result-output max-h-[560px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100">
          <code className="break-words font-mono">{output}</code>
        </pre>
      </ResultsPanel>
    </div>
  );
}
