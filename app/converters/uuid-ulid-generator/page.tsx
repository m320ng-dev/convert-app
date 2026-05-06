'use client';

import { useMemo, useState } from 'react';

import { CopyResultAction } from '@/app/components/copy-result-action';
import { ResultsPanel, type ToolProcessingStage } from '@/app/components/results-panel';
import { ToolValidationMessage } from '@/app/components/tool-validation-message';
import { parseToolNumberInput } from '@/app/lib/tool-input-state';
import {
  formatUuidUlidResults,
  generateUuidUlidResults,
  validateUuid,
  type UuidValidationResult,
  type UuidUlidItem,
  type UuidUlidKind,
} from '@/app/lib/uuid-ulid';

const kindOptions: Array<{ value: UuidUlidKind; label: string; description: string }> = [
  {
    value: 'both',
    label: 'UUID + ULID',
    description: '각 개수마다 UUID v4와 ULID를 함께 생성합니다.',
  },
  {
    value: 'uuid',
    label: 'UUID v4',
    description: '브라우저 crypto API 기반 UUID v4만 생성합니다.',
  },
  {
    value: 'ulid',
    label: 'ULID',
    description: '시간 정렬 가능한 26자 ULID만 생성합니다.',
  },
];

export default function UuidUlidGeneratorPage() {
  const [kind, setKind] = useState<UuidUlidKind>('both');
  const [quantity, setQuantity] = useState(5);
  const [items, setItems] = useState<UuidUlidItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [errorStage, setErrorStage] = useState<ToolProcessingStage | null>(null);
  const [uuidInput, setUuidInput] = useState('');
  const [validationResult, setValidationResult] = useState<UuidValidationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const copyValue = useMemo(() => formatUuidUlidResults(items), [items]);
  const validationCopyValue = useMemo(() => {
    if (!validationResult) {
      return '';
    }

    return validationResult.isValid
      ? [
          validationResult.message,
          `정규화: ${validationResult.normalized}`,
          `버전: v${validationResult.version}`,
          `Variant: ${validationResult.variant}`,
        ].join('\n')
    : validationResult.message;
  }, [validationResult]);

  function clearGeneratorError() {
    setError(null);
    setErrorStage(null);
  }

  function clearValidationError() {
    setValidationError(null);
  }

  const handleGenerate = () => {
    clearGeneratorError();

    if (quantity < 1 || quantity > 100) {
      setItems([]);
      setErrorStage('normalizing');
      setError('생성 개수는 1 이상 100 이하로 입력해주세요.');
      return;
    }

    try {
      const result = generateUuidUlidResults({ kind, quantity });

      setItems(result.items);
      clearGeneratorError();
    } catch (caughtError) {
      setItems([]);
      setErrorStage('converting');
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : '식별자를 생성하는 중 오류가 발생했습니다.',
      );
    }
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    clearGeneratorError();
    setQuantity(parseToolNumberInput(event.target.value, quantity));
  };

  function handleResetGeneratorInputs() {
    setKind('both');
    setQuantity(5);
    setItems([]);
    clearGeneratorError();
  }

  function handleApplyGeneratorExample() {
    setKind('both');
    setQuantity(3);
    setItems([]);
    clearGeneratorError();
  }

  const handleValidateUuid = () => {
    clearValidationError();

    try {
      const result = validateUuid(uuidInput);

      setValidationResult(result);
      clearValidationError();
    } catch (caughtError) {
      setValidationResult(null);
      setValidationError(
        caughtError instanceof Error
          ? caughtError.message
          : 'UUID를 검증하는 중 오류가 발생했습니다.',
      );
    }
  };

  function handleResetValidationInputs() {
    setUuidInput('');
    setValidationResult(null);
    clearValidationError();
  }

  function handleApplyValidationExample() {
    setUuidInput('f47ac10b-58cc-4372-a567-0e02b2c3d479');
    setValidationResult(null);
    clearValidationError();
  }

  async function handlePasteUuidFromClipboard() {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
        setValidationError('클립보드에서 텍스트를 가져오지 못했습니다.');
        return;
      }

      const clipboardText = await navigator.clipboard.readText();

      setUuidInput(clipboardText.trim());
      setValidationResult(null);
      clearValidationError();
    } catch {
      setValidationError('클립보드에서 텍스트를 가져오지 못했습니다.');
    }
  }

  function formatUuidUlidGeneratorInputForCopy() {
    const selectedKind = kindOptions.find((option) => option.value === kind)?.label ?? kind;

    return [
      `생성 종류: ${selectedKind}`,
      `생성 개수: ${quantity}`,
    ].join('\n');
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              UUID/ULID 생성 옵션
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              외부 서버 호출 없이 브라우저 crypto API로 테스트 데이터, 요청 ID, 임시 키에 쓸
              식별자를 만듭니다.
            </p>
          </div>

          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold text-slate-800">생성 종류</legend>
            <div className="grid gap-2 md:grid-cols-3">
              {kindOptions.map((option) => (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-md border p-4 transition ${
                    kind === option.value
                      ? 'border-slate-950 bg-slate-950 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="kind"
                    value={option.value}
                    checked={kind === option.value}
                    onChange={(event) => {
                      clearGeneratorError();
                      setKind(event.target.value as UuidUlidKind);
                    }}
                    className="sr-only"
                  />
                  <span className="block text-sm font-bold">{option.label}</span>
                  <span
                    className={`mt-2 block text-xs leading-5 ${
                      kind === option.value ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {option.description}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="grid gap-2 sm:max-w-xs">
            <span className="text-sm font-semibold text-slate-800">생성 개수</span>
            <input
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={handleQuantityChange}
              className="h-11 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-950 shadow-sm focus:border-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <ToolValidationMessage message={error} className="rounded-md font-semibold" />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              식별자 생성
            </button>
            <button
              type="button"
              onClick={handleApplyGeneratorExample}
              className="app-button app-button-secondary"
            >
              예시 입력 적용
            </button>
            <CopyResultAction
              value={() => formatUuidUlidGeneratorInputForCopy()}
              label="입력값 복사"
              ariaLabel="식별자 생성 입력값 복사"
              copiedMessage="식별자 생성 입력값을 클립보드에 복사했습니다."
              emptyMessage="복사할 식별자 생성 입력값이 없습니다."
            />
            <button
              type="button"
              onClick={handleResetGeneratorInputs}
              className="app-button app-button-secondary"
            >
              입력 초기화
            </button>
          </div>
        </div>
      </section>

      <ResultsPanel
        title="생성 결과"
        description="각 항목은 개별 복사하거나 전체 결과를 줄 단위와 JSON 형식으로 복사할 수 있습니다."
        actions={(
          <CopyResultAction
            value={() => formatUuidUlidResults(items, 'json')}
            label="JSON 복사"
            ariaLabel="생성된 식별자 JSON 복사"
            copiedMessage="식별자 JSON을 복사했습니다."
            emptyMessage="복사할 식별자가 없습니다."
            disabled={items.length === 0 || Boolean(error)}
          />
        )}
        copyValue={copyValue}
        copyLabel="전체 복사"
        copyAriaLabel="생성된 식별자 전체 복사"
        copyCopiedMessage="식별자 목록을 복사했습니다."
        copyEmptyMessage="복사할 식별자가 없습니다."
        isEmpty={items.length === 0}
        emptyMessage={error ?? '생성 버튼을 누르면 UUID/ULID 결과가 여기에 표시됩니다.'}
        errorMessage={error}
        defaultErrorMessage="식별자를 생성하는 중 오류가 발생했습니다."
        processingStage={items.length > 0 ? 'complete' : 'normalizing'}
        failureStage={errorStage}
      >
        <div className="grid gap-3">
          {items.map((item, index) => (
            <div
              key={`${item.label}-${item.value}`}
              className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  {item.label}
                </p>
                <code className="mt-2 block break-all font-mono text-sm font-semibold text-slate-950">
                  {item.value}
                </code>
              </div>
              <CopyResultAction
                value={item.value}
                label="복사"
                ariaLabel={`${index + 1}번 ${item.label} 복사`}
                copiedMessage={`${index + 1}번 식별자를 복사했습니다.`}
                emptyMessage="복사할 식별자가 없습니다."
              />
            </div>
          ))}
        </div>
      </ResultsPanel>

      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              UUID 검증
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              입력한 UUID의 하이픈 형식, 버전, variant를 브라우저에서 바로 확인합니다.
            </p>
          </div>

          <div className="grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="uuid-validation-input" className="text-sm font-semibold text-slate-800">
                검증할 UUID
              </label>
              <button
                type="button"
                onClick={handlePasteUuidFromClipboard}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                클립보드 붙여넣기
              </button>
            </div>
            <input
              id="uuid-validation-input"
              type="text"
              value={uuidInput}
              onChange={(event) => {
                clearValidationError();
                setValidationResult(null);
                setUuidInput(event.target.value);
              }}
              placeholder="f47ac10b-58cc-4372-a567-0e02b2c3d479"
              className="h-11 rounded-md border border-slate-300 px-3 font-mono text-sm text-slate-950 shadow-sm focus:border-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <ToolValidationMessage message={validationError} className="rounded-md font-semibold" />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleValidateUuid}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              UUID 검증
            </button>
            <button
              type="button"
              onClick={handleApplyValidationExample}
              className="app-button app-button-secondary"
            >
              예시 입력 적용
            </button>
            <CopyResultAction
              value={uuidInput}
              label="입력값 복사"
              ariaLabel="UUID 검증 입력값 복사"
              copiedMessage="UUID 검증 입력값을 클립보드에 복사했습니다."
              emptyMessage="복사할 UUID 검증 입력값이 없습니다."
              disabled={!uuidInput}
            />
            <button
              type="button"
              onClick={handleResetValidationInputs}
              className="app-button app-button-secondary"
            >
              입력 초기화
            </button>
          </div>
        </div>
      </section>

      <ResultsPanel
        title="검증 결과"
        description="유효한 UUID는 정규화된 값과 버전 정보를 함께 표시합니다."
        copyValue={validationCopyValue}
        copyLabel="검증 결과 복사"
        copyAriaLabel="UUID 검증 결과 복사"
        copyCopiedMessage="UUID 검증 결과를 복사했습니다."
        copyEmptyMessage="복사할 UUID 검증 결과가 없습니다."
        isEmpty={!validationResult}
        emptyMessage={validationError ?? 'UUID를 입력하고 검증 버튼을 누르면 결과가 표시됩니다.'}
        errorMessage={validationError}
        defaultErrorMessage="UUID를 검증하는 중 오류가 발생했습니다."
      >
        {validationResult && (
          <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
            <p
              className={`text-sm font-bold ${
                validationResult.isValid ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {validationResult.message}
            </p>
            {validationResult.isValid && (
              <dl className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="font-semibold text-slate-500">정규화</dt>
                  <dd className="mt-1 break-all font-mono font-semibold text-slate-950">
                    {validationResult.normalized}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">버전</dt>
                  <dd className="mt-1 font-mono font-semibold text-slate-950">
                    v{validationResult.version}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Variant</dt>
                  <dd className="mt-1 font-mono font-semibold text-slate-950">
                    {validationResult.variant}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        )}
      </ResultsPanel>
    </div>
  );
}
