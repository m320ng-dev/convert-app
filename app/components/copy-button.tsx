import type { ButtonHTMLAttributes } from 'react';

type CopyButtonProps = {
  label?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'className' | 'aria-label' | 'aria-describedby' | 'children'
>;

export function CopyButton({
  label = '복사',
  ariaLabel,
  ariaDescribedBy,
  disabled = false,
  className = '',
  ...buttonProps
}: CopyButtonProps) {
  return (
    <button
      {...buttonProps}
      type="button"
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      aria-describedby={ariaDescribedBy}
      className={`app-button app-button-secondary ${className}`.trim()}
    >
      {label}
    </button>
  );
}
