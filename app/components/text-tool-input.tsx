'use client';

import type { ChangeEvent, ClipboardEvent, TextareaHTMLAttributes } from 'react';
import { useState } from 'react';

type TextToolInputProps = {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  exampleValue?: string;
  exampleLabel?: string;
  pasteFromClipboardLabel?: string;
  copyInputLabel?: string;
  resetLabel?: string;
  containerClassName?: string;
  textareaClassName?: string;
  minHeightClassName?: string;
} & Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'id' | 'value' | 'onChange' | 'onPaste' | 'placeholder' | 'className' | 'spellCheck'
>;

export function TextToolInput({
  id,
  label,
  value,
  onValueChange,
  placeholder,
  helperText,
  exampleValue,
  exampleLabel = '예시 입력 적용',
  pasteFromClipboardLabel = '클립보드 붙여넣기',
  copyInputLabel = '입력값 복사',
  resetLabel = '입력 초기화',
  containerClassName = '',
  textareaClassName = '',
  minHeightClassName = 'min-h-52',
  ...textareaProps
}: TextToolInputProps) {
  const [clipboardStatus, setClipboardStatus] = useState<{
    tone: 'success' | 'error';
    message: string;
  } | null>(null);

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setClipboardStatus(null);
    onValueChange(event.currentTarget.value);
  }

  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const target = event.currentTarget;

    setClipboardStatus(null);
    window.setTimeout(() => onValueChange(target.value), 0);
  }

  function handleReset() {
    setClipboardStatus(null);
    onValueChange('');
  }

  function handleApplyExample() {
    if (exampleValue === undefined) {
      return;
    }

    setClipboardStatus(null);
    onValueChange(exampleValue);
  }

  async function handlePasteFromClipboard() {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
        setClipboardStatus({
          tone: 'error',
          message: '클립보드에서 텍스트를 가져오지 못했습니다.',
        });
        return;
      }

      const clipboardText = await navigator.clipboard.readText();
      onValueChange(clipboardText);
      setClipboardStatus(null);
    } catch {
      setClipboardStatus({
        tone: 'error',
        message: '클립보드에서 텍스트를 가져오지 못했습니다.',
      });
    }
  }

  async function handleCopyInputToClipboard() {
    if (!value) {
      setClipboardStatus({ tone: 'error', message: '복사할 입력값이 없습니다.' });
      return;
    }

    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        setClipboardStatus({ tone: 'error', message: '클립보드에 복사하지 못했습니다.' });
        return;
      }

      await navigator.clipboard.writeText(value);
      setClipboardStatus({ tone: 'success', message: '입력값을 클립보드에 복사했습니다.' });
    } catch {
      setClipboardStatus({ tone: 'error', message: '클립보드에 복사하지 못했습니다.' });
    }
  }

  const resolvedTextareaClassName = [
    'mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white p-3 font-mono text-sm leading-6 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
    minHeightClassName,
    textareaClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-slate-800">
          {label}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {exampleValue !== undefined && (
            <button
              type="button"
              onClick={handleApplyExample}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {exampleLabel}
            </button>
          )}
          <button
            type="button"
            onClick={handlePasteFromClipboard}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {pasteFromClipboardLabel}
          </button>
          <button
            type="button"
            onClick={handleCopyInputToClipboard}
            disabled={value.length === 0}
            aria-label={`${label} 복사`}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copyInputLabel}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={value.length === 0}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resetLabel}
          </button>
        </div>
      </div>
      <textarea
        {...textareaProps}
        id={id}
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder={placeholder}
        className={resolvedTextareaClassName}
        spellCheck={false}
      />
      {helperText && (
        <p className="mt-2 text-xs leading-5 text-slate-500">{helperText}</p>
      )}
      {clipboardStatus && (
        <p
          className={`mt-2 text-xs font-semibold leading-5 ${
            clipboardStatus.tone === 'success' ? 'text-emerald-700' : 'text-red-600'
          }`}
          role={clipboardStatus.tone === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {clipboardStatus.message}
        </p>
      )}
    </div>
  );
}
