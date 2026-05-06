'use client';

import { useMemo, useState } from 'react';

import { CopyResultAction } from '@/app/components/copy-result-action';
import {
  FormattedResultBlock,
  ResultsPanel,
  type ToolProcessingStage,
} from '@/app/components/results-panel';
import { TextToolInput } from '@/app/components/text-tool-input';
import { ToolValidationMessage } from '@/app/components/tool-validation-message';
import { decodeJwt, validateJwt } from '@/app/lib/jwt-decoder';
import {
  buildJwtPayloadFromClaims,
  generateJwt,
  type JwtSigningAlgorithm,
} from '@/app/lib/jwt-generator';
import {
  DEFAULT_EXCESSIVE_INPUT_ERROR_MESSAGE,
  resolveToolErrorMessage,
  validateToolTextInput,
} from '@/app/lib/tool-error-message';

const defaultHeaderJson = '{\n  "typ": "JWT"\n}';
const defaultPayloadJson = '{\n  "sub": "developer-123"\n}';
const exampleJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXZlbG9wZXItMTIzIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzA0MDY3MjAwfQ.signature';

type ValidationAlgorithm = 'auto' | 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';

const validationAlgorithmOptions: Array<{
  value: ValidationAlgorithm;
  label: string;
  validationKeyLabel: string;
}> = [
  { value: 'auto', label: '토큰 alg 자동', validationKeyLabel: 'secret 또는 public key PEM' },
  { value: 'HS256', label: 'HS256', validationKeyLabel: 'HMAC secret' },
  { value: 'HS384', label: 'HS384', validationKeyLabel: 'HMAC secret' },
  { value: 'HS512', label: 'HS512', validationKeyLabel: 'HMAC secret' },
  { value: 'RS256', label: 'RS256', validationKeyLabel: 'SPKI public key PEM' },
  { value: 'RS384', label: 'RS384', validationKeyLabel: 'SPKI public key PEM' },
  { value: 'RS512', label: 'RS512', validationKeyLabel: 'SPKI public key PEM' },
];

export default function JwtDecoderPage() {
  const [token, setToken] = useState('');
  const [validationAlgorithm, setValidationAlgorithm] = useState<ValidationAlgorithm>('auto');
  const [validationSecret, setValidationSecret] = useState('');
  const [clockTolerance, setClockTolerance] = useState('0');
  const [expectedIssuer, setExpectedIssuer] = useState('');
  const [expectedAudience, setExpectedAudience] = useState('');
  const [expectedSubject, setExpectedSubject] = useState('');
  const [expectedCustomClaimsJson, setExpectedCustomClaimsJson] = useState('{}');
  const [verificationState, setVerificationState] = useState<'idle' | 'passed' | 'failed'>('idle');
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [algorithm, setAlgorithm] = useState<JwtSigningAlgorithm>('HS256');
  const [headerJson, setHeaderJson] = useState(defaultHeaderJson);
  const [payloadJson, setPayloadJson] = useState(defaultPayloadJson);
  const [signingSecret, setSigningSecret] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [generatorError, setGeneratorError] = useState<string | null>(null);
  const [generatorMessage, setGeneratorMessage] = useState<string | null>(null);

  const decodedResult = useMemo(() => {
    const inputValidationFailure = validateToolTextInput(token, 'JWT를 입력해주세요.', {
      excessiveInputMessage: DEFAULT_EXCESSIVE_INPUT_ERROR_MESSAGE,
    });

    if (inputValidationFailure) {
      return {
        headerJson: '',
        payloadJson: '',
        signature: '',
        error: inputValidationFailure.message,
        failureStage: 'parsing' as ToolProcessingStage,
      };
    }

    try {
      const decoded = decodeJwt(token);

      return {
        headerJson: JSON.stringify(decoded.header, null, 2),
        payloadJson: JSON.stringify(decoded.payload, null, 2),
        signature: decoded.signature,
        error: null,
        failureStage: null,
      };
    } catch (error) {
      return {
        headerJson: '',
        payloadJson: '',
        signature: '',
        error: resolveToolErrorMessage(error, 'JWT를 디코딩하는 중 오류가 발생했습니다.'),
        failureStage: 'converting' as ToolProcessingStage,
      };
    }
  }, [token]);

  const decodedCopyValue = useMemo(() => {
    if (!decodedResult.headerJson || !decodedResult.payloadJson) {
      return '';
    }

    try {
      return JSON.stringify(
        {
          header: JSON.parse(decodedResult.headerJson),
          payload: JSON.parse(decodedResult.payloadJson),
          signature: decodedResult.signature,
        },
        null,
        2,
      );
    } catch {
      return '';
    }
  }, [decodedResult.headerJson, decodedResult.payloadJson, decodedResult.signature]);
  const commonClaimsCopyValue = useMemo(() => {
    if (!decodedResult.payloadJson) {
      return '';
    }

    try {
      const payload = JSON.parse(decodedResult.payloadJson) as Record<string, unknown>;
      const commonClaims = Object.fromEntries(
        ['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti']
          .filter((claim) => payload[claim] !== undefined)
          .map((claim) => [claim, payload[claim]]),
      );

      return Object.keys(commonClaims).length > 0 ? JSON.stringify(commonClaims, null, 2) : '';
    } catch {
      return '';
    }
  }, [decodedResult.payloadJson]);
  const validationAlgorithmOption =
    validationAlgorithmOptions.find((option) => option.value === validationAlgorithm) ??
    validationAlgorithmOptions[0];

  const handleVerify = async () => {
    try {
      const parsedClockTolerance = Number(clockTolerance || '0');
      const parsedExpectedCustomClaims = parseExpectedCustomClaimsJson(expectedCustomClaimsJson);

      await validateJwt(token, {
        algorithms: validationAlgorithm === 'auto' ? undefined : [validationAlgorithm],
        secret: validationSecret,
        key: validationSecret,
        clockToleranceSeconds: parsedClockTolerance,
        expectedIssuer: expectedIssuer || undefined,
        expectedAudience: expectedAudience || undefined,
        expectedSubject: expectedSubject || undefined,
        expectedCustomClaims: parsedExpectedCustomClaims,
      });
      setVerificationState('passed');
      setVerificationMessage('JWT 서명 검증 통과');
    } catch (error) {
      setVerificationState('failed');
      setVerificationMessage(
        error instanceof Error
          ? error.message
          : 'JWT 서명 검증 실패: 검증 secret 또는 public key가 토큰을 발급할 때 사용한 값과 같은지 확인해주세요.',
      );
    }
  };

  const handleTokenChange = (value: string) => {
    setToken(value);
    setVerificationState('idle');
    setVerificationMessage(null);
  };

  const handleGenerate = async () => {
    try {
      const payload = buildJwtPayloadFromClaims({
        basePayloadJson: payloadJson,
        standardClaims: {},
        customClaimsJson: '{}',
      });
      const token = await generateJwt({
        algorithm,
        headerJson,
        payloadJson: JSON.stringify(payload),
        key: signingSecret,
      });

      setGeneratedToken(token);
      setGeneratorError(null);
      setGeneratorMessage('JWT 생성이 완료되었습니다.');
    } catch (error) {
      setGeneratedToken('');
      setGeneratorError(resolveToolErrorMessage(error, 'JWT를 생성하는 중 오류가 발생했습니다.'));
      setGeneratorMessage(null);
    }
  };

  const handleResetGeneratedResult = () => {
    setGeneratedToken('');
    setGeneratorError(null);
    setGeneratorMessage(null);
  };

  const handleClearGenerator = () => {
    setAlgorithm('HS256');
    setHeaderJson(defaultHeaderJson);
    setPayloadJson(defaultPayloadJson);
    setSigningSecret('');
    setGeneratedToken('');
    setGeneratorError(null);
    setGeneratorMessage(null);
  };

  return (
    <div className="app-stack">
      <section className="app-panel app-panel-flat app-panel-body">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="app-kicker text-slate-500">API Security Utility</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
              JWT 디코더
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              JWT header와 payload를 브라우저에서만 디코딩하고, 선택적으로 서명과 클레임을 검증합니다.
            </p>
          </div>
          <span className="app-chip rounded-lg">로컬 처리</span>
        </div>

        <TextToolInput
          id="jwt-token"
          label="JWT 토큰 입력"
          value={token}
          onValueChange={handleTokenChange}
          exampleValue={exampleJwtToken}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          containerClassName="mt-5"
          minHeightClassName="min-h-44"
        />

        <ToolValidationMessage message={decodedResult.error} className="mt-4" />
      </section>

      <ResultsPanel
        title="디코딩 결과"
        description="header, payload, signature를 분리해 확인하고 필요한 값만 복사할 수 있습니다."
        copyValue={decodedCopyValue}
        copyLabel="전체 복사"
        copyAriaLabel="JWT 디코딩 전체 결과 복사"
        copyCopiedMessage="전체 결과를 복사했습니다."
        copyEmptyMessage="복사할 디코딩 결과가 없습니다."
        emptyMessage={decodedResult.error ?? 'JWT를 입력하면 디코딩 결과가 표시됩니다.'}
        errorMessage={decodedResult.error}
        defaultErrorMessage="JWT를 디코딩하는 중 오류가 발생했습니다."
        processingStage={decodedResult.headerJson ? 'complete' : 'parsing'}
        failureStage={decodedResult.failureStage}
        isEmpty={!decodedResult.headerJson || Boolean(decodedResult.error)}
      >
        <div className="grid gap-4">
          <FormattedResultBlock
            title="Header"
            value={decodedResult.headerJson}
            copiedMessage="Header JSON을 복사했습니다."
            emptyMessage="복사할 JWT header가 없습니다."
          />
          <FormattedResultBlock
            title="Payload"
            value={decodedResult.payloadJson}
            copiedMessage="Payload JSON을 복사했습니다."
            emptyMessage="복사할 JWT payload가 없습니다."
          />
          <FormattedResultBlock
            title="Signature"
            value={decodedResult.signature}
            copiedMessage="Signature segment를 복사했습니다."
            emptyMessage="복사할 JWT signature가 없습니다."
            tone="light"
          />
          <FormattedResultBlock
            title="Common Claims"
            value={commonClaimsCopyValue}
            copiedMessage="공통 클레임 정보를 복사했습니다."
            emptyMessage="복사할 공통 클레임 정보가 없습니다."
            tone="light"
          />
        </div>
      </ResultsPanel>

      <section className="app-panel app-panel-flat app-panel-body">
        <h2 className="text-lg font-semibold tracking-tight text-slate-950">
          검증 알고리즘 설정
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          서명, 시간, issuer, audience, subject, custom claim 검증을 브라우저에서 실행합니다.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <label htmlFor="jwt-validation-algorithm" className="text-sm font-semibold text-slate-800">
              검증 알고리즘
            </label>
            <select
              id="jwt-validation-algorithm"
              value={validationAlgorithm}
              onChange={(event) => setValidationAlgorithm(event.target.value as ValidationAlgorithm)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {validationAlgorithmOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="jwt-validation-secret" className="text-sm font-semibold text-slate-800">
                검증 키: {validationAlgorithmOption.validationKeyLabel}
              </label>
              <button
                type="button"
                onClick={() => setValidationSecret('local-development-secret')}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                예시 입력 적용
              </button>
            </div>
            <input
              id="jwt-validation-secret"
              value={validationSecret}
              onChange={(event) => setValidationSecret(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="jwt-clock-tolerance" className="text-sm font-semibold text-slate-800">
                Clock tolerance (초)
              </label>
              <button
                type="button"
                onClick={() => setClockTolerance('60')}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                예시 입력 적용
              </button>
            </div>
            <input
              id="jwt-clock-tolerance"
              type="number"
              min={0}
              value={clockTolerance}
              onChange={(event) => setClockTolerance(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <TextInput id="jwt-expected-issuer" label="Expected issuer (iss)" value={expectedIssuer} onChange={setExpectedIssuer} exampleValue="convertapp" />
          <TextInput id="jwt-expected-audience" label="Expected audience (aud)" value={expectedAudience} onChange={setExpectedAudience} exampleValue="developer-tools" />
          <TextInput id="jwt-expected-subject" label="Expected subject (sub)" value={expectedSubject} onChange={setExpectedSubject} exampleValue="developer-123" />
        </div>

        <TextToolInput
          id="jwt-custom-claims"
          label="Expected custom claims JSON"
          value={expectedCustomClaimsJson}
          onValueChange={setExpectedCustomClaimsJson}
          exampleValue='{"role":"admin"}'
          containerClassName="mt-4"
          minHeightClassName="min-h-28"
        />

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleVerify}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            JWT 검증
          </button>
          <ToolValidationMessage
            message={verificationMessage}
            tone={verificationState === 'passed' ? 'success' : 'error'}
            className="w-full font-semibold sm:w-auto"
          />
        </div>
      </section>

      <section className="app-panel app-panel-flat app-panel-body">
        <h2 className="text-lg font-semibold tracking-tight text-slate-950">JWT 생성</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <label htmlFor="jwt-generate-algorithm" className="text-sm font-semibold text-slate-800">
              생성 알고리즘
            </label>
            <select
              id="jwt-generate-algorithm"
              value={algorithm}
              onChange={(event) => setAlgorithm(event.target.value as JwtSigningAlgorithm)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="HS256">HS256</option>
              <option value="HS384">HS384</option>
              <option value="HS512">HS512</option>
            </select>
          </div>
          <TextInput id="jwt-signing-secret" label="서명 secret" value={signingSecret} onChange={setSigningSecret} exampleValue="local-development-secret" />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <JsonTextarea id="jwt-header-json" label="Header JSON" value={headerJson} onChange={setHeaderJson} exampleValue={defaultHeaderJson} />
          <JsonTextarea id="jwt-payload-json" label="Payload JSON" value={payloadJson} onChange={setPayloadJson} exampleValue='{"sub":"developer-123","role":"admin"}' />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            JWT 생성
          </button>
          <button type="button" onClick={handleClearGenerator} className="app-button app-button-secondary">
            생성 입력 초기화
          </button>
        </div>

        <ToolValidationMessage message={generatorError} className="mt-4 font-semibold" />
        <ToolValidationMessage
          message={generatorMessage}
          tone="success"
          className="mt-4 font-semibold"
        />

        <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-bold text-slate-800">생성 결과</h3>
            <div className="flex flex-wrap gap-2">
              <CopyResultAction
                value={generatedToken}
                label="생성 JWT 복사"
                ariaLabel="생성된 JWT 토큰 복사"
                copiedMessage="생성된 JWT를 복사했습니다."
                emptyMessage="복사할 생성 결과가 없습니다."
                disabled={!generatedToken}
              />
              <button type="button" onClick={handleResetGeneratedResult} className="app-button app-button-secondary">
                생성 결과 초기화
              </button>
            </div>
          </div>
          {generatorError ? (
            <ToolValidationMessage message={generatorError} className="mt-4 font-semibold" />
          ) : generatedToken ? (
            <code className="mt-4 block break-all rounded-lg bg-white p-3 font-mono text-sm text-slate-900">
              {generatedToken}
            </code>
          ) : (
            <p className="mt-4 text-sm text-slate-500">생성된 JWT가 여기에 표시됩니다.</p>
          )}
        </section>
      </section>
    </div>
  );
}

function parseExpectedCustomClaimsJson(value: string): Record<string, unknown> | undefined {
  if (!value.trim() || value.trim() === '{}') {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Expected custom claims JSON은 JSON 객체여야 합니다.');
    }

    return parsed;
  } catch (error) {
    if (error instanceof Error && error.message.includes('JSON 객체')) {
      throw error;
    }

    throw new Error('Expected custom claims JSON을 파싱할 수 없습니다.');
  }
}

function TextInput({
  id,
  label,
  value,
  onChange,
  exampleValue,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  exampleValue?: string;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-slate-800">
          {label}
        </label>
        {exampleValue !== undefined && (
          <button
            type="button"
            onClick={() => onChange(exampleValue)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            예시 입력 적용
          </button>
        )}
      </div>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function JsonTextarea({
  id,
  label,
  value,
  onChange,
  exampleValue,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  exampleValue: string;
}) {
  return (
    <TextToolInput
      id={id}
      label={label}
      value={value}
      onValueChange={onChange}
      exampleValue={exampleValue}
      minHeightClassName="min-h-40"
    />
  );
}
