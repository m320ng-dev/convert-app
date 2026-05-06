'use client';

import { useId, useState } from 'react';

import { CopyButton } from '@/app/components/copy-button';
import { copyTextToClipboard } from '@/app/lib/clipboard-copy';

type CopyValue = string | null | undefined | (() => string | null | undefined);
type CopyStatus = { tone: 'success' | 'error'; message: string };

interface CopyResultActionProps {
  value: CopyValue;
  label?: string;
  ariaLabel?: string;
  copiedMessage?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

export function CopyResultAction({
  value,
  label = '복사',
  ariaLabel,
  copiedMessage = '클립보드에 복사했습니다.',
  emptyMessage = '복사할 값이 없습니다.',
  disabled = false,
  className = '',
}: CopyResultActionProps) {
  const [status, setStatus] = useState<CopyStatus | null>(null);
  const feedbackId = useId();
  const hasStaticEmptyValue = typeof value !== 'function' && !value;
  const isCopyDisabled = disabled || hasStaticEmptyValue;

  const copyToClipboard = async () => {
    const resolvedValue = typeof value === 'function' ? value() : value;

    const result = await copyTextToClipboard(resolvedValue, {
      copiedMessage,
      emptyMessage,
    });

    setStatus({
      tone: result.ok ? 'success' : 'error',
      message: result.message,
    });
  };

  return (
    <div className="min-w-0">
      <CopyButton
        onClick={copyToClipboard}
        disabled={isCopyDisabled}
        ariaLabel={ariaLabel}
        ariaDescribedBy={status ? feedbackId : undefined}
        label={label}
        className={className}
      />
      {status && (
        <p
          id={feedbackId}
          className={`mt-2 text-xs font-medium ${
            status.tone === 'success' ? 'text-emerald-700' : 'text-red-700'
          }`}
          role={status.tone === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {status.message}
        </p>
      )}
    </div>
  );
}
