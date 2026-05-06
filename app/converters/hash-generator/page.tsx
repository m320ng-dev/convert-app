'use client';

import { useCallback, useMemo, useState } from 'react';

import { CopyResultAction } from '@/app/components/copy-result-action';
import { FileToolInput } from '@/app/components/file-tool-input';
import { ResultsPanel, type ToolProcessingStage } from '@/app/components/results-panel';
import { TextToolInput } from '@/app/components/text-tool-input';
import { ToolValidationMessage } from '@/app/components/tool-validation-message';
import {
  formatHashResultsForCopy,
  generateHashResults,
  HASH_ALGORITHMS,
  verifyHash,
  type HashAlgorithmId,
  type HashResult,
  type HashVerificationResult,
} from '@/app/lib/hash-generator';
import type { LocalFileInput } from '@/app/lib/local-file-input';
import { createInputValidationFailure, resolveToolErrorMessage } from '@/app/lib/tool-error-message';

const DEFAULT_SELECTED_ALGORITHMS: HashAlgorithmId[] = ['md5', 'sha1', 'sha256'];
const DEFAULT_ERROR_MESSAGE = '해시 생성 또는 검증 중 오류가 발생했습니다.';
const emptyInputFailure = createInputValidationFailure('해시를 생성할 텍스트를 입력해주세요.');

export default function HashGeneratorPage() {
  const [input, setInput] = useState('convertapp');
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<Set<HashAlgorithmId>>(
    new Set(DEFAULT_SELECTED_ALGORITHMS),
  );
  const [verificationAlgorithm, setVerificationAlgorithm] = useState<HashAlgorithmId>('sha256');
  const [expectedHash, setExpectedHash] = useState('');
  const [results, setResults] = useState<HashResult[]>([]);
  const [verification, setVerification] = useState<HashVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorStage, setErrorStage] = useState<ToolProcessingStage | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileMessage, setFileMessage] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const selectedAlgorithmIds = useMemo(
    () => HASH_ALGORITHMS
      .filter((algorithm) => selectedAlgorithms.has(algorithm.id))
      .map((algorithm) => algorithm.id),
    [selectedAlgorithms],
  );
  const copyValue = results.length > 0 ? formatHashResultsForCopy(results, verification) : '';

  const generateHashes = useCallback((
    text: string,
    algorithms: readonly HashAlgorithmId[] = selectedAlgorithmIds,
  ) => {
    if (!text.trim()) {
      setResults([]);
      setVerification(null);
      setErrorStage('parsing');
      setError(emptyInputFailure.message);
      return;
    }

    try {
      const nextResults = generateHashResults(text, algorithms);
      setResults(nextResults);
      setVerification(null);
      setErrorStage(null);
      setError(null);
    } catch (caughtError) {
      setResults([]);
      setVerification(null);
      setErrorStage('converting');
      setError(resolveToolErrorMessage(caughtError, DEFAULT_ERROR_MESSAGE));
    }
  }, [selectedAlgorithmIds]);

  const handleInputChange = (value: string) => {
    setInput(value);

    if (value.trim()) {
      generateHashes(value);
      return;
    }

    setResults([]);
    setVerification(null);
    setErrorStage('parsing');
    setError(emptyInputFailure.message);
  };

  const handleGenerate = () => {
    generateHashes(input);
  };

  const handleVerify = () => {
    try {
      const nextResults = generateHashResults(input, selectedAlgorithmIds);
      const nextVerification = verifyHash({
        text: input,
        algorithm: verificationAlgorithm,
        expectedHash,
      });

      setResults(nextResults);
      setVerification(nextVerification);
      setErrorStage(null);
      setError(null);
    } catch (caughtError) {
      setVerification(null);
      setErrorStage('converting');
      setError(resolveToolErrorMessage(caughtError, DEFAULT_ERROR_MESSAGE));
    }
  };

  async function handlePasteExpectedHashFromClipboard() {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
        setErrorStage('normalizing');
        setError('클립보드에서 텍스트를 가져오지 못했습니다.');
        return;
      }

      const clipboardText = await navigator.clipboard.readText();

      setExpectedHash(clipboardText.trim());
      setErrorStage(null);
      setError(null);
    } catch {
      setErrorStage('normalizing');
      setError('클립보드에서 텍스트를 가져오지 못했습니다.');
    }
  }

  const toggleAlgorithm = (algorithmId: HashAlgorithmId) => {
    const nextSelectedAlgorithms = new Set(selectedAlgorithms);

    if (nextSelectedAlgorithms.has(algorithmId)) {
      nextSelectedAlgorithms.delete(algorithmId);
    } else {
      nextSelectedAlgorithms.add(algorithmId);
    }

    setSelectedAlgorithms(nextSelectedAlgorithms);

    if (input.trim()) {
      generateHashes(input, Array.from(nextSelectedAlgorithms));
    }
  };

  const handleLocalFilesRead = useCallback((inputs: LocalFileInput[]) => {
    setFileError(null);

    if (inputs.length === 0) {
      setFileMessage(null);
      return;
    }

    const combinedText = inputs
      .map((input) => input.text ?? '')
      .join('\n');

    if (!combinedText.trim()) {
      setInput('');
      setResults([]);
      setVerification(null);
      setErrorStage('parsing');
      setFileMessage(null);
      setFileError('텍스트가 있는 파일을 선택해주세요.');
      return;
    }

    setInput(combinedText);
    generateHashes(combinedText);
    setFileMessage('선택한 파일의 텍스트를 해시 입력으로 사용했습니다.');
  }, [generateHashes]);

  const handleSelectedFilesChange = useCallback((files: File[]) => {
    setSelectedFiles(files);

    if (files.length === 0) {
      setFileMessage(null);
      setFileError(null);
    }
  }, []);

  return (
    <div className="app-stack">
      <section className="app-panel app-panel-flat app-panel-body">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="app-kicker text-slate-500">보안 유틸리티</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
              해시 생성/검증
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              텍스트나 로컬 파일 내용을 MD5, SHA 계열, RIPEMD160 해시로 계산하고 예상 해시와 비교합니다.
            </p>
          </div>
          <span className="app-chip rounded-lg">로컬 처리</span>
        </div>

        <div className="mt-5 grid gap-4">
          <TextToolInput
            id="hash-generator-input"
            label="원문 텍스트"
            value={input}
            onValueChange={handleInputChange}
            exampleValue="convertapp local hash sample"
            placeholder="해시를 생성하거나 검증할 텍스트를 입력하세요."
            minHeightClassName="min-h-48"
          />

          <FileToolInput
            id="hash-file-input"
            label="텍스트 파일"
            selectedFiles={selectedFiles}
            onFilesChange={handleSelectedFilesChange}
            readMode="text"
            onLocalFilesRead={handleLocalFilesRead}
            onLocalFileReadError={(message) => setFileError(message)}
            accept=".txt,.json,.md,.csv,.log,.env,text/*,application/json"
            multiple
            helperText="텍스트 기반 파일을 선택하면 브라우저에서 로컬로 읽은 내용의 해시값을 생성합니다."
          />

          <div>
            <h3 className="text-sm font-semibold text-slate-800">해시 알고리즘</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {HASH_ALGORITHMS.map((algorithm) => (
                <button
                  key={algorithm.id}
                  type="button"
                  onClick={() => toggleAlgorithm(algorithm.id)}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    selectedAlgorithms.has(algorithm.id)
                      ? 'border-slate-950 bg-slate-950 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {algorithm.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)]">
              <div>
                <label htmlFor="hash-verification-algorithm" className="text-sm font-semibold text-slate-800">
                  검증 알고리즘
                </label>
                <select
                  id="hash-verification-algorithm"
                  value={verificationAlgorithm}
                  onChange={(event) => setVerificationAlgorithm(event.target.value as HashAlgorithmId)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {HASH_ALGORITHMS.map((algorithm) => (
                    <option key={algorithm.id} value={algorithm.id}>
                      {algorithm.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="hash-expected-value" className="text-sm font-semibold text-slate-800">
                    검증할 해시값
                  </label>
                  <button
                    type="button"
                    onClick={handlePasteExpectedHashFromClipboard}
                    className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    클립보드 붙여넣기
                  </button>
                  <CopyResultAction
                    value={expectedHash}
                    label="입력값 복사"
                    ariaLabel="검증할 해시 입력값 복사"
                    copiedMessage="검증할 해시 입력값을 클립보드에 복사했습니다."
                    emptyMessage="복사할 검증 해시 입력값이 없습니다."
                    disabled={!expectedHash}
                    className="px-3 py-1.5"
                  />
                </div>
                <input
                  id="hash-expected-value"
                  value={expectedHash}
                  onChange={(event) => setExpectedHash(event.target.value)}
                  placeholder="비교할 해시 문자열"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {verification && (
              <ToolValidationMessage
                message={verification.message}
                tone={verification.isMatch ? 'success' : 'warning'}
              />
            )}
          </div>

          {fileMessage && <ToolValidationMessage message={fileMessage} tone="success" />}
          <ToolValidationMessage message={fileError ?? error} />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              해시 생성
            </button>
            <button
              type="button"
              onClick={handleVerify}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
            >
              해시 검증
            </button>
          </div>
        </div>
      </section>

      <ResultsPanel
        title="생성된 해시값"
        description="선택한 알고리즘별 해시와 선택적 검증 결과를 확인합니다."
        copyValue={copyValue}
        copyLabel="해시 결과 복사"
        copyAriaLabel="해시 생성 및 검증 결과 복사"
        copyCopiedMessage="해시 결과를 클립보드에 복사했습니다."
        copyEmptyMessage="복사할 해시 결과가 없습니다."
        emptyMessage={error ? '오류를 해결하면 결과가 표시됩니다.' : '해시 생성 버튼을 누르면 결과가 표시됩니다.'}
        errorMessage={error}
        defaultErrorMessage={DEFAULT_ERROR_MESSAGE}
        isEmpty={results.length === 0}
        processingStage={results.length > 0 ? 'complete' : 'converting'}
        failureStage={errorStage}
      >
        <div className="grid gap-4">
          {verification && (
            <div
              className={`rounded-lg border p-4 text-sm ${
                verification.isMatch
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
            >
              <p className="font-semibold">{verification.message}</p>
              <dl className="mt-3 grid gap-2">
                <div>
                  <dt className="text-xs font-bold uppercase text-slate-500">예상 해시</dt>
                  <dd className="mt-1 break-all font-mono">{verification.expectedHash}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-slate-500">계산 해시</dt>
                  <dd className="mt-1 break-all font-mono">{verification.actualHash}</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="grid gap-3">
            {results.map((result) => (
              <section
                key={result.algorithm}
                className="result-output rounded-lg border border-slate-200 bg-slate-950 p-4 text-slate-100"
              >
                <h3 className="text-sm font-bold">{result.algorithm}</h3>
                <pre className="mt-3 overflow-auto text-sm leading-6">
                  <code className="break-all font-mono">{result.hash}</code>
                </pre>
              </section>
            ))}
          </div>
        </div>
      </ResultsPanel>
    </div>
  );
}
