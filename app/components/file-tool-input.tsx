'use client';

import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react';
import { useRef } from 'react';

import {
  getLocalFileValidationError,
  readLocalFileInputs,
  type LocalFileInput,
  type LocalFileReadMode,
} from '@/app/lib/local-file-input';
import { resolveToolErrorMessage } from '@/app/lib/tool-error-message';

type FileToolInputProps = {
  id: string;
  label: string;
  selectedFiles: File[];
  onFilesChange: (files: File[]) => void;
  readMode?: LocalFileReadMode;
  onLocalFilesRead?: (inputs: LocalFileInput[]) => void;
  onLocalFileReadError?: (message: string) => void;
  helperText?: ReactNode;
  emptyMessage?: string;
  resetLabel?: string;
  containerClassName?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id' | 'type' | 'onChange' | 'className'
>;

export function FileToolInput({
  id,
  label,
  selectedFiles,
  onFilesChange,
  readMode = 'text',
  onLocalFilesRead,
  onLocalFileReadError,
  helperText,
  emptyMessage = '선택된 파일이 없습니다.',
  resetLabel = '선택 초기화',
  containerClassName = '',
  accept,
  ...inputProps
}: FileToolInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);

    onFilesChange(files);

    if (!onLocalFilesRead) {
      return;
    }

    if (files.length === 0) {
      onLocalFilesRead([]);
      return;
    }

    const validationError = getLocalFileValidationError(files, accept);

    if (validationError) {
      onLocalFileReadError?.(validationError);
      onLocalFilesRead([]);
      return;
    }

    try {
      const inputs = await readLocalFileInputs(files, readMode);
      onLocalFilesRead(inputs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : undefined;
      onLocalFileReadError?.(
        resolveToolErrorMessage(errorMessage, '파일을 브라우저에서 읽는 중 오류가 발생했습니다.'),
      );
      onLocalFilesRead([]);
    }
  }

  function handleReset() {
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    onFilesChange([]);
    onLocalFilesRead?.([]);
  }

  return (
    <div className={containerClassName}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-slate-800">
          {label}
        </label>
        <button
          type="button"
          onClick={handleReset}
          disabled={selectedFiles.length === 0}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resetLabel}
        </button>
      </div>

      <input
        {...inputProps}
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="mt-2 block w-full cursor-pointer rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-700 shadow-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />

      {helperText && (
        <p className="mt-2 text-xs leading-5 text-slate-500">{helperText}</p>
      )}

      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        {selectedFiles.length === 0 ? (
          <p className="text-sm text-slate-500">{emptyMessage}</p>
        ) : (
          <ul className="space-y-2">
            {selectedFiles.map((file) => (
              <li
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-md bg-white px-3 py-2 text-sm"
              >
                <span className="min-w-0 break-all font-medium text-slate-800">
                  {file.name}
                </span>
                <span className="shrink-0 text-xs font-semibold text-slate-500">
                  {formatFileSize(file.size)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const unit = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(unit)),
    sizes.length - 1,
  );
  const value = bytes / Math.pow(unit, index);

  return `${Number(value.toFixed(2))} ${sizes[index]}`;
}
