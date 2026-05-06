'use client';

import { useMemo, useState } from 'react';

import { CopyResultAction } from '@/app/components/copy-result-action';
import { ResultsPanel, type ToolProcessingStage } from '@/app/components/results-panel';
import { ToolValidationMessage } from '@/app/components/tool-validation-message';
import {
  formatRandomTokenResults,
  generateRandomTokens,
  type RandomTokenCharacterSets,
} from '@/app/lib/random-token';
import { resolveToolErrorMessage } from '@/app/lib/tool-error-message';
import { parseToolNumberInput } from '@/app/lib/tool-input-state';

const characterSetOptions: Array<{
  id: keyof RandomTokenCharacterSets;
  label: string;
  helper: string;
}> = [
  { id: 'lowercase', label: '소문자', helper: 'a-z' },
  { id: 'uppercase', label: '대문자', helper: 'A-Z' },
  { id: 'numbers', label: '숫자', helper: '0-9' },
  { id: 'symbols', label: '기호', helper: '!@#...' },
];

const tokenPresetOptions: Array<{
  id: string;
  label: string;
  helper: string;
  length: number;
  characterSets: RandomTokenCharacterSets;
  excludeAmbiguous: boolean;
}> = [
  {
    id: 'api-key',
    label: 'API 키',
    helper: '영문 대소문자와 숫자로 긴 비밀값을 만듭니다.',
    length: 32,
    characterSets: {
      lowercase: true,
      uppercase: true,
      numbers: true,
      symbols: false,
    },
    excludeAmbiguous: true,
  },
  {
    id: 'session-token',
    label: '세션 토큰',
    helper: '기호를 포함해 임시 세션값의 엔트로피를 높입니다.',
    length: 48,
    characterSets: {
      lowercase: true,
      uppercase: true,
      numbers: true,
      symbols: true,
    },
    excludeAmbiguous: true,
  },
  {
    id: 'numeric-pin',
    label: '숫자 PIN',
    helper: '숫자만 사용하는 짧은 테스트 PIN을 만듭니다.',
    length: 6,
    characterSets: {
      lowercase: false,
      uppercase: false,
      numbers: true,
      symbols: false,
    },
    excludeAmbiguous: false,
  },
];

const copyFormatActions: Array<{
  format: 'json' | 'env' | 'csv';
  label: string;
}> = [
  { format: 'json', label: 'JSON 복사' },
  { format: 'env', label: '.env 복사' },
  { format: 'csv', label: 'CSV 복사' },
];

export default function RandomTokenGeneratorPage() {
  const [selectedPreset, setSelectedPreset] = useState(tokenPresetOptions[0].id);
  const [length, setLength] = useState(32);
  const [quantity, setQuantity] = useState(5);
  const [characterSets, setCharacterSets] = useState<RandomTokenCharacterSets>({
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: false,
  });
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [excludeCharacters, setExcludeCharacters] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [tokens, setTokens] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [errorStage, setErrorStage] = useState<ToolProcessingStage | null>(null);

  const primaryCopyValue = useMemo(
    () => formatRandomTokenResults(tokens, 'newline'),
    [tokens],
  );

  function clearGenerationError() {
    setError(null);
    setErrorStage(null);
  }

  const toggleCharacterSet = (id: keyof RandomTokenCharacterSets) => {
    clearGenerationError();
    setCharacterSets((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const applyPreset = (presetId: string) => {
    const preset = tokenPresetOptions.find((option) => option.id === presetId);
    if (!preset) return;

    clearGenerationError();
    setSelectedPreset(preset.id);
    setLength(preset.length);
    setCharacterSets(preset.characterSets);
    setExcludeAmbiguous(preset.excludeAmbiguous);
  };

  function handleResetInputs() {
    setSelectedPreset(tokenPresetOptions[0].id);
    setLength(tokenPresetOptions[0].length);
    setQuantity(5);
    setCharacterSets(tokenPresetOptions[0].characterSets);
    setExcludeAmbiguous(tokenPresetOptions[0].excludeAmbiguous);
    setExcludeCharacters('');
    setPrefix('');
    setSuffix('');
    setTokens([]);
    clearGenerationError();
  }

  function handleApplyExampleInputs() {
    const examplePreset = tokenPresetOptions[0];

    setSelectedPreset(examplePreset.id);
    setLength(examplePreset.length);
    setQuantity(3);
    setCharacterSets(examplePreset.characterSets);
    setExcludeAmbiguous(examplePreset.excludeAmbiguous);
    setExcludeCharacters('0OIl');
    setPrefix('sk_test_');
    setSuffix('');
    setTokens([]);
    clearGenerationError();
  }

  async function readClipboardTextForInput() {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
        setErrorStage('normalizing');
        setError('클립보드에서 텍스트를 가져오지 못했습니다.');
        return null;
      }

      const clipboardText = await navigator.clipboard.readText();

      setTokens([]);
      clearGenerationError();

      return clipboardText;
    } catch {
      setErrorStage('normalizing');
      setError('클립보드에서 텍스트를 가져오지 못했습니다.');
      return null;
    }
  }

  function formatRandomTokenInputForCopy() {
    return [
      `용도: ${selectedPreset}`,
      `길이: ${length}`,
      `생성 개수: ${quantity}`,
      `문자 종류: ${Object.entries(characterSets)
        .filter(([, enabled]) => enabled)
        .map(([key]) => key)
        .join(', ')}`,
      `헷갈리는 문자 제외: ${excludeAmbiguous ? '예' : '아니오'}`,
      `제외할 문자: ${excludeCharacters || '(없음)'}`,
      `접두사: ${prefix || '(없음)'}`,
      `접미사: ${suffix || '(없음)'}`,
    ].join('\n');
  }

  async function handlePasteExcludedCharactersFromClipboard() {
    const clipboardText = await readClipboardTextForInput();

    if (clipboardText !== null) {
      setExcludeCharacters(clipboardText);
    }
  }

  async function handlePastePrefixFromClipboard() {
    const clipboardText = await readClipboardTextForInput();

    if (clipboardText !== null) {
      setPrefix(clipboardText);
    }
  }

  async function handlePasteSuffixFromClipboard() {
    const clipboardText = await readClipboardTextForInput();

    if (clipboardText !== null) {
      setSuffix(clipboardText);
    }
  }

  const handleGenerate = () => {
    clearGenerationError();

    if (length < 4 || length > 256 || quantity < 1 || quantity > 100) {
      setTokens([]);
      setErrorStage('normalizing');
      setError('길이와 생성 개수 범위를 확인해주세요.');
      return;
    }

    try {
      const generatedTokens = generateRandomTokens({
        length,
        quantity,
        characterSets,
        excludeCharacters,
        excludeAmbiguous,
        prefix,
        suffix,
      });
      setTokens(generatedTokens);
      clearGenerationError();
    } catch (error) {
      setTokens([]);
      setErrorStage('converting');
      setError(resolveToolErrorMessage(error, '토큰 생성 중 오류가 발생했습니다.'));
    }
  };

  return (
    <div className="app-stack">
      <section className="app-panel app-panel-flat app-panel-body">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="app-kicker text-slate-500">보안 유틸리티</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
              토큰 생성기
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              브라우저 crypto API로 API 키, 임시 비밀값, 테스트 토큰을 로컬에서 생성합니다.
            </p>
          </div>
          <span className="app-chip rounded-lg">로컬 처리</span>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-slate-800">토큰 용도</legend>
          <div className="mt-2 grid gap-2 lg:grid-cols-3">
            {tokenPresetOptions.map((option) => (
              <label
                key={option.id}
                className={`cursor-pointer rounded-lg border p-4 text-sm transition ${
                  selectedPreset === option.id
                    ? 'border-slate-950 bg-slate-950 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="token-preset"
                  value={option.id}
                  checked={selectedPreset === option.id}
                  onChange={() => applyPreset(option.id)}
                  className="sr-only"
                />
                <span className="block font-semibold">{option.label}</span>
                <span
                  className={`mt-2 block text-xs leading-5 ${
                    selectedPreset === option.id ? 'text-slate-200' : 'text-slate-500'
                  }`}
                >
                  {option.helper}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <label htmlFor="token-length" className="text-sm font-semibold text-slate-800">
              길이
            </label>
            <input
              id="token-length"
              type="number"
              min={4}
              max={256}
              value={length}
              onChange={(event) => {
                clearGenerationError();
                setLength(parseToolNumberInput(event.target.value, length));
              }}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="token-quantity" className="text-sm font-semibold text-slate-800">
              생성 개수
            </label>
            <input
              id="token-quantity"
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(event) => {
                clearGenerationError();
                setQuantity(parseToolNumberInput(event.target.value, quantity));
              }}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-slate-800">문자 종류</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {characterSetOptions.map((option) => (
              <label
                key={option.id}
                className="flex min-h-16 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={characterSets[option.id]}
                  onChange={() => toggleCharacterSet(option.id)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-800">{option.label}</span>
                  <span className="block font-mono text-xs text-slate-500">{option.helper}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={excludeAmbiguous}
              onChange={(event) => {
                clearGenerationError();
                setExcludeAmbiguous(event.target.checked);
              }}
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            헷갈리는 문자 제외
          </label>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="token-exclude" className="text-sm font-semibold text-slate-800">
                제외할 문자
              </label>
              <button
                type="button"
                onClick={handlePasteExcludedCharactersFromClipboard}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                클립보드 붙여넣기
              </button>
            </div>
            <input
              id="token-exclude"
              type="text"
              value={excludeCharacters}
              onChange={(event) => {
                clearGenerationError();
                setExcludeCharacters(event.target.value);
              }}
              placeholder="예: /\\'&quot;"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="token-prefix" className="text-sm font-semibold text-slate-800">
                접두사
              </label>
              <button
                type="button"
                onClick={handlePastePrefixFromClipboard}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                클립보드 붙여넣기
              </button>
            </div>
            <input
              id="token-prefix"
              type="text"
              value={prefix}
              onChange={(event) => {
                clearGenerationError();
                setPrefix(event.target.value);
              }}
              placeholder="sk_test_"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="token-suffix" className="text-sm font-semibold text-slate-800">
                접미사
              </label>
              <button
                type="button"
                onClick={handlePasteSuffixFromClipboard}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                클립보드 붙여넣기
              </button>
            </div>
            <input
              id="token-suffix"
              type="text"
              value={suffix}
              onChange={(event) => {
                clearGenerationError();
                setSuffix(event.target.value);
              }}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <ToolValidationMessage message={error} className="mt-5" />

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:w-fit"
          >
            토큰 생성
          </button>
          <button
            type="button"
            onClick={handleApplyExampleInputs}
            className="app-button app-button-secondary w-full sm:w-fit"
          >
            예시 입력 적용
          </button>
          <CopyResultAction
            value={() => formatRandomTokenInputForCopy()}
            label="입력값 복사"
            ariaLabel="토큰 생성 입력값 복사"
            copiedMessage="토큰 생성 입력값을 클립보드에 복사했습니다."
            emptyMessage="복사할 토큰 생성 입력값이 없습니다."
            className="w-full sm:w-fit"
          />
          <button
            type="button"
            onClick={handleResetInputs}
            className="app-button app-button-secondary w-full sm:w-fit"
          >
            입력 초기화
          </button>
        </div>
      </section>

      <ResultsPanel
        title="생성 결과"
        description="결과는 브라우저 상태에만 보관되며 서버로 전송되지 않습니다."
        actions={copyFormatActions.map((action) => (
          <CopyResultAction
            key={action.format}
            value={() => formatRandomTokenResults(tokens, action.format)}
            label={action.label}
            ariaLabel={`${action.label} 결과 세트 복사`}
            copiedMessage={`${action.label}했습니다.`}
            emptyMessage="복사할 토큰이 없습니다."
            disabled={tokens.length === 0 || Boolean(error)}
          />
        ))}
        copyValue={primaryCopyValue}
        copyLabel="줄바꿈 복사"
        copyAriaLabel="생성된 토큰 줄바꿈 복사"
        copyCopiedMessage="생성된 토큰을 클립보드에 복사했습니다."
        copyEmptyMessage="복사할 토큰이 없습니다."
        emptyMessage={error ?? '옵션을 설정하고 토큰을 생성하면 결과가 표시됩니다.'}
        errorMessage={error}
        defaultErrorMessage="토큰 생성 중 오류가 발생했습니다."
        processingStage={tokens.length > 0 ? 'complete' : 'normalizing'}
        failureStage={errorStage}
        isEmpty={tokens.length === 0}
      >
        <div className="grid gap-2">
          {tokens.map((token, index) => (
            <div
              key={`${token}-${index}`}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <code className="min-w-0 break-all font-mono text-sm text-slate-900">{token}</code>
              <CopyResultAction
                value={token}
                label="복사"
                ariaLabel={`${index + 1}번 토큰 복사`}
                copiedMessage={`${index + 1}번 토큰을 클립보드에 복사했습니다.`}
                emptyMessage="복사할 토큰이 없습니다."
                className="w-full sm:w-fit"
              />
            </div>
          ))}
        </div>
      </ResultsPanel>
    </div>
  );
}
