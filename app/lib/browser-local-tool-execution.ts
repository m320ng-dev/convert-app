import QRCode from 'qrcode';

import {
  normalizeBrowserLocalToolInput,
  validateBrowserLocalToolInput,
} from './converters.ts';
import { convertBase64Text, type Base64Mode } from './base64-codec.ts';
import { convertCsvJson, type CsvJsonConversionMode } from './csv-json-converter.ts';
import { generateHashResults, verifyHash, type HashAlgorithmId } from './hash-generator.ts';
import { convertHtmlEntityText, type HtmlEntityCodecMode } from './html-entity-codec.ts';
import { formatJsonText, type JsonFormatterMode } from './json-formatter.ts';
import { decodeJwt } from './jwt-decoder.ts';
import { generateRandomTokens, type RandomTokenCharacterSets } from './random-token.ts';
import { testRegexPattern } from './regex-tester.ts';
import { formatSqlText } from './sql-formatter-tool.ts';
import { convertStringCases } from './string-case.ts';
import { convertSvgToReactComponent } from './svg-to-react.ts';
import { convertTimestampText, type TimestampMode } from './timestamp-converter.ts';
import { convertUrlText, type UrlCodecMode } from './url-codec.ts';
import { generateUuidUlidResults, validateUuid, type UuidUlidKind } from './uuid-ulid.ts';
import { convertYamlJson, type YamlJsonConversionMode } from './yaml-json-converter.ts';
import { resolveToolErrorMessage } from './tool-error-message.ts';

export interface BrowserLocalToolExecutionResult {
  normalizedInput: Record<string, unknown>;
  output: Record<string, unknown> | null;
  errors: string[];
}

type BrowserLocalToolExecutor = (
  input: Record<string, unknown>,
) => Record<string, unknown> | Promise<Record<string, unknown>>;

const browserLocalToolExecutors: Record<string, BrowserLocalToolExecutor> = {
  'random-token-generator': (input) => ({
    tokens: generateRandomTokens({
      length: input.length as number,
      quantity: input.quantity as number,
      characterSets: input.characterSets as RandomTokenCharacterSets,
      excludeCharacters: '',
      excludeAmbiguous: false,
    }),
  }),
  'uuid-ulid-generator': (input) => {
    const identifiers = generateUuidUlidResults({
      kind: input.kind as UuidUlidKind,
      quantity: input.quantity as number,
    }).items;

    return {
      identifiers,
      ...(typeof input.uuidToValidate === 'string' && input.uuidToValidate.trim()
        ? { uuidValidation: validateUuid(input.uuidToValidate) }
        : {}),
    };
  },
  'url-encoder-decoder': (input) => ({
    result: convertUrlText(input.value as string, input.mode as UrlCodecMode),
  }),
  'jwt-decoder': (input) => {
    const decoded = decodeJwt(input.token as string);

    return {
      header: decoded.header,
      payload: decoded.payload,
      signature: decoded.signature,
      verification: null,
    };
  },
  'regex-tester': (input) => {
    const execution = testRegexPattern(
      input.pattern as string,
      input.text as string,
      typeof input.flags === 'string' ? input.flags : '',
    );

    if (execution.error || !execution.result) {
      throw new Error(execution.error ?? 'Regex 테스트 중 오류가 발생했습니다.');
    }

    return {
      matches: execution.result.matches,
      summary: `총 ${execution.result.matchCount}개 일치`,
    };
  },
  'string-case-converter': (input) => ({
    ...convertStringCases(input.text as string),
  }),
  'qr-code-generator': async (input) => ({
    dataUrl: await QRCode.toDataURL((input.text as string).trim(), {
      width: clampNumber(input.size, 128, 1024, 256),
      margin: clampNumber(input.margin, 0, 8, 2),
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    }),
  }),
  'json-formatter': (input) => ({
    formattedJson: formatJsonText(input.json as string, input.mode as JsonFormatterMode),
  }),
  'base64-converter': (input) => ({
    result: convertBase64Text(input.value as string, input.mode as Base64Mode),
  }),
  'timestamp-converter': (input) => ({
    result: convertTimestampText(input.value as string, input.mode as TimestampMode),
  }),
  'sql-formatter': (input) => ({
    formattedSql: formatSqlText(input.sql as string),
  }),
  'svg-to-react': (input) => ({
    componentCode: convertSvgToReactComponent(
      input.svg as string,
      typeof input.componentName === 'string' ? input.componentName : 'SvgIcon',
    ),
  }),
  'html-entity-escaper': (input) => ({
    result: convertHtmlEntityText(input.value as string, input.mode as HtmlEntityCodecMode),
  }),
  'csv-json-converter': (input) => ({
    result: convertCsvJson(input.value as string, input.mode as CsvJsonConversionMode),
  }),
  'yaml-json-converter': (input) => ({
    result: convertYamlJson(input.value as string, input.mode as YamlJsonConversionMode),
  }),
  'hash-generator': (input) => {
    const hashes = generateHashResults(input.text as string, input.algorithms as string[]);
    const verification =
      typeof input.expectedHash === 'string' && input.expectedHash.trim()
        ? verifyHash({
            text: input.text as string,
            algorithm: (input.algorithms as HashAlgorithmId[])[0],
            expectedHash: input.expectedHash,
          })
        : null;

    return { hashes, verification };
  },
};

export async function executeBrowserLocalToolConversion(
  toolId: string,
  parsedInput: Record<string, unknown>,
): Promise<BrowserLocalToolExecutionResult> {
  const normalizedInput = normalizeBrowserLocalToolInput(toolId, parsedInput);
  const validationErrors = validateBrowserLocalToolInput(toolId, normalizedInput);

  if (validationErrors.length > 0) {
    return {
      normalizedInput,
      output: null,
      errors: validationErrors,
    };
  }

  const executor = browserLocalToolExecutors[toolId];

  if (!executor) {
    return {
      normalizedInput,
      output: null,
      errors: ['도구 실행 로직을 찾을 수 없습니다.'],
    };
  }

  try {
    return {
      normalizedInput,
      output: await executor(normalizedInput),
      errors: [],
    };
  } catch (error) {
    return {
      normalizedInput,
      output: null,
      errors: [resolveToolErrorMessage(error)],
    };
  }
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(Math.max(value, min), max)
    : fallback;
}
