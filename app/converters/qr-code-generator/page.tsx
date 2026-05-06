'use client';

import { useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';

import { ResultsPanel, type ToolProcessingStage } from '@/app/components/results-panel';
import { TextToolInput } from '@/app/components/text-tool-input';
import { ToolValidationMessage } from '@/app/components/tool-validation-message';
import {
  DEFAULT_EXCESSIVE_INPUT_ERROR_MESSAGE,
  validateToolTextInput,
} from '@/app/lib/tool-error-message';
import { parseToolNumberInput, useToolInputState } from '@/app/lib/tool-input-state';

const DEFAULT_ERROR_MESSAGE = 'QR 코드 생성 중 오류가 발생했습니다.';
const QR_CAPACITY_ERROR_MESSAGE =
  '입력값이 QR 코드에 담기에는 너무 깁니다. 텍스트를 줄이거나 핵심 값만 입력해주세요.';
const QR_TEXT_INPUT_MAX_LENGTH = 10000;

export default function QrCodeGeneratorPage() {
  const { inputState, setInputValue } = useToolInputState({
    value: 'https://example.com',
    size: 256,
    margin: 2,
  });
  const { value: input, size, margin } = inputState.values;
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorStage, setErrorStage] = useState<ToolProcessingStage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  function clearQrCodeError() {
    setError(null);
    setErrorStage(null);
  }

  function handleInputChange(value: string) {
    clearQrCodeError();
    setInputValue('value', value);
  }

  function handleSizeChange(event: React.ChangeEvent<HTMLInputElement>) {
    clearQrCodeError();
    setInputValue('size', parseToolNumberInput(event.target.value, size));
  }

  function handleMarginChange(event: React.ChangeEvent<HTMLInputElement>) {
    clearQrCodeError();
    setInputValue('margin', parseToolNumberInput(event.target.value, margin));
  }

  const handleGenerate = async () => {
    clearQrCodeError();

    const inputValidationFailure = validateToolTextInput(input, 'QR 코드로 만들 텍스트나 URL을 입력해주세요.', {
      maxLength: QR_TEXT_INPUT_MAX_LENGTH,
      excessiveInputMessage: DEFAULT_EXCESSIVE_INPUT_ERROR_MESSAGE,
    });

    if (inputValidationFailure) {
      setQrDataUrl('');
      setErrorStage('parsing');
      setError(inputValidationFailure.message);
      return;
    }

    try {
      setIsGenerating(true);
      const dataUrl = await QRCode.toDataURL(input.trim(), {
        width: Math.min(Math.max(size, 128), 1024),
        margin: Math.min(Math.max(margin, 0), 8),
        errorCorrectionLevel: 'M',
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });

      setQrDataUrl(dataUrl);
      clearQrCodeError();
    } catch (caughtError) {
      setQrDataUrl('');
      setErrorStage('converting');
      setError(resolveQrCodeGenerationError(caughtError));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-stack">
      <section className="app-panel app-panel-flat app-panel-body">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="app-kicker text-slate-500">QR 유틸리티</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
              QR 코드 생성
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              텍스트, URL, 짧은 설정값을 QR 코드 PNG 데이터 URL로 만듭니다. 외부 API 없이 브라우저에서만 처리됩니다.
            </p>
          </div>
          <span className="app-chip rounded-lg">로컬 처리</span>
        </div>

        <div className="mt-5 grid gap-4">
          <TextToolInput
            id="qr-code-input"
            label="QR 코드 원문"
            value={input}
            onValueChange={handleInputChange}
            exampleValue="https://example.com"
            placeholder="https://example.com 또는 QR 코드에 넣을 텍스트"
            minHeightClassName="min-h-36"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="qr-code-size" className="text-sm font-semibold text-slate-800">
                이미지 크기
              </label>
              <input
                id="qr-code-size"
                type="number"
                min={128}
                max={1024}
                step={32}
                value={size}
                onChange={handleSizeChange}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="qr-code-margin" className="text-sm font-semibold text-slate-800">
                여백
              </label>
              <input
                id="qr-code-margin"
                type="number"
                min={0}
                max={8}
                value={margin}
                onChange={handleMarginChange}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <ToolValidationMessage message={error} />

          <div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isGenerating ? '생성 중' : 'QR 코드 생성'}
            </button>
          </div>
        </div>
      </section>

      <ResultsPanel
        title="생성 결과"
        description="생성된 PNG 데이터 URL을 복사하거나 미리보기로 확인합니다."
        copyValue={qrDataUrl}
        copyLabel="데이터 URL 복사"
        copyAriaLabel="QR 코드 데이터 URL 복사"
        copyCopiedMessage="QR 코드 데이터 URL을 클립보드에 복사했습니다."
        copyEmptyMessage="복사할 QR 코드 결과가 없습니다."
        emptyMessage={error ?? 'QR 코드 생성 버튼을 누르면 결과가 표시됩니다.'}
        errorMessage={error}
        defaultErrorMessage="QR 코드 생성 중 오류가 발생했습니다."
        isEmpty={!qrDataUrl}
        isLoading={isGenerating}
        processingStage={qrDataUrl ? 'complete' : 'parsing'}
        failureStage={errorStage}
        loadingMessage="QR 코드를 생성하고 있습니다."
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start">
          <div className="grid place-items-center rounded-lg border border-slate-200 bg-white p-4">
            {/* img 요소는 data URL 미리보기에만 사용하며 네트워크 요청을 만들지 않습니다. */}
            <Image
              src={qrDataUrl}
              alt="생성된 QR 코드"
              width={320}
              height={320}
              unoptimized
              className="h-auto max-h-80 w-full max-w-80 rounded-md"
            />
          </div>

          <pre className="result-output max-h-80 overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-xs leading-5 text-slate-100">
            <code className="break-all font-mono">{qrDataUrl}</code>
          </pre>
        </div>
      </ResultsPanel>
    </div>
  );
}

function resolveQrCodeGenerationError(error: unknown) {
  if (!(error instanceof Error)) {
    return DEFAULT_ERROR_MESSAGE;
  }

  const message = error.message.trim();

  if (/data is too big|too much data|code length overflow/i.test(message)) {
    return QR_CAPACITY_ERROR_MESSAGE;
  }

  return message || DEFAULT_ERROR_MESSAGE;
}
