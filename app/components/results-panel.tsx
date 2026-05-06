'use client';

import type { HTMLAttributes, ReactNode } from 'react';

import { CopyResultAction } from '@/app/components/copy-result-action';

interface ResultsPanelProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  copyValue?: string | null;
  copyLabel?: string;
  copyAriaLabel?: string;
  copyCopiedMessage?: string;
  copyDisabled?: boolean;
  copyEmptyMessage?: string;
  children: ReactNode;
  emptyMessage: string;
  isEmpty: boolean;
  isLoading?: boolean;
  loadingMessage?: string;
  className?: string;
  bodyClassName?: string;
  bodyProps?: HTMLAttributes<HTMLDivElement>;
}

export function ResultsPanel({
  title,
  description,
  actions,
  copyValue,
  copyLabel = '결과 복사',
  copyAriaLabel,
  copyCopiedMessage = '결과를 클립보드에 복사했습니다.',
  copyDisabled = false,
  copyEmptyMessage = '복사할 결과가 없습니다.',
  children,
  emptyMessage,
  isEmpty,
  isLoading = false,
  loadingMessage = '결과를 준비하고 있습니다.',
  className = '',
  bodyClassName = 'app-panel-body',
  bodyProps,
}: ResultsPanelProps) {
  const { className: bodyPropsClassName, ...restBodyProps } = bodyProps ?? {};
  const resolvedBodyClassName = [bodyClassName, bodyPropsClassName].filter(Boolean).join(' ');
  const hasHeaderActions = Boolean(actions) || copyValue !== undefined;

  return (
    <section className={`app-panel app-panel-flat ${className}`.trim()}>
      <div className="app-panel-header flex-col sm:flex-row">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
        {hasHeaderActions && (
          <div className="flex min-w-0 flex-wrap gap-2 sm:justify-end">
            {actions}
            {copyValue !== undefined && (
              <CopyResultAction
                value={copyValue}
                label={copyLabel}
                ariaLabel={copyAriaLabel}
                copiedMessage={copyCopiedMessage}
                emptyMessage={copyEmptyMessage}
                disabled={copyDisabled || isLoading || isEmpty}
              />
            )}
          </div>
        )}
      </div>

      <div
        {...restBodyProps}
        aria-busy={isLoading}
        className={resolvedBodyClassName}
      >
        {isLoading ? (
          <ResultStatusState message={loadingMessage} tone="loading" />
        ) : isEmpty ? (
          <ResultStatusState message={emptyMessage} tone="empty" />
        ) : (
          children
        )}
      </div>
    </section>
  );
}

export function FormattedResultBlock({
  title,
  value,
  copiedMessage,
  emptyMessage,
  tone = 'dark',
}: {
  title: string;
  value: string;
  copiedMessage: string;
  emptyMessage: string;
  tone?: 'dark' | 'light';
}) {
  const isDark = tone === 'dark';

  return (
    <section
      className={`result-output overflow-hidden rounded-lg border ${
        isDark ? 'border-slate-200 bg-slate-950' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 ${
          isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
        }`}
      >
        <h3
          className={`min-w-0 text-sm font-bold ${
            isDark ? 'text-slate-100' : 'uppercase tracking-[0.12em] text-slate-600'
          }`}
        >
          {title}
        </h3>
        <CopyResultAction
          value={value}
          label="복사"
          copiedMessage={copiedMessage}
          emptyMessage={emptyMessage}
          disabled={!value}
          className={`w-full rounded-md px-3 py-1.5 sm:w-fit ${
            isDark
              ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'
              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        />
      </div>
      <pre
        className={`result-output max-h-[680px] overflow-auto p-4 text-sm leading-6 ${
          isDark ? 'text-slate-100' : 'text-slate-800'
        }`}
      >
        <code className="break-words font-mono">{value}</code>
      </pre>
    </section>
  );
}

function ResultStatusState({
  message,
  tone,
}: {
  message: string;
  tone: 'empty' | 'loading';
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid min-h-80 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm font-medium text-slate-500"
    >
      <div className="grid justify-items-center gap-3">
        {tone === 'loading' && (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        )}
        <p className="max-w-md leading-6">{message}</p>
      </div>
    </div>
  );
}
