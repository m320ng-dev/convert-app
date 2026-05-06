'use client';

import { INPUT_VALIDATION_ERROR_RENDERING } from '@/app/lib/tool-error-message';

interface ToolValidationMessageProps {
  message: string | null | undefined;
  tone?: 'empty' | 'success' | 'warning' | 'error';
  id?: string;
  className?: string;
}

const toneClassNames = {
  empty: 'border-slate-200 bg-slate-50 text-slate-600',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  error: 'border-red-200 bg-red-50 text-red-700',
};

export function ToolValidationMessage({
  message,
  tone = INPUT_VALIDATION_ERROR_RENDERING.tone,
  id,
  className = '',
}: ToolValidationMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      id={id}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      data-validation-state={tone}
      className={`rounded-lg border px-4 py-3 text-sm font-medium ${toneClassNames[tone]} ${className}`.trim()}
    >
      {message}
    </div>
  );
}
