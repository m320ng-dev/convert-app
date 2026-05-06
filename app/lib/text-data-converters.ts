export type Base64ConversionMode = 'encode' | 'decode';

const JSON_ERROR_MESSAGE = 'JSON 파싱에 실패했습니다. 입력 형식을 확인해주세요.';
const BASE64_ERROR_MESSAGE = 'Base64 디코딩에 실패했습니다. 올바른 Base64 문자열인지 확인해주세요.';

export function formatJsonText(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    throw new Error(JSON_ERROR_MESSAGE);
  }
}

export function minifyJsonText(value: string) {
  try {
    return JSON.stringify(JSON.parse(value));
  } catch {
    throw new Error(JSON_ERROR_MESSAGE);
  }
}

export function convertBase64Text(value: string, mode: Base64ConversionMode) {
  if (mode === 'encode') {
    return bytesToBase64(new TextEncoder().encode(value));
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(base64ToBytes(value));
  } catch {
    throw new Error(BASE64_ERROR_MESSAGE);
  }
}

export function timestampToDateTimeLocal(value: string) {
  const trimmedValue = value.trim();
  const timestamp = Number(trimmedValue);

  if (!Number.isFinite(timestamp) || !/^-?\d+$/.test(trimmedValue)) {
    throw new Error('유효한 Unix timestamp가 아닙니다.');
  }

  const milliseconds = Math.abs(timestamp) >= 100000000000 ? timestamp : timestamp * 1000;
  const date = new Date(milliseconds);

  if (Number.isNaN(date.getTime())) {
    throw new Error('유효한 Unix timestamp가 아닙니다.');
  }

  return date.toISOString().slice(0, 19);
}

export function dateTimeLocalToTimestamp(value: string) {
  const date = new Date(`${value.trim()}Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error('유효한 날짜가 아닙니다.');
  }

  return Math.floor(date.getTime() / 1000).toString();
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToBytes(value: string) {
  const normalizedValue = value.trim();
  const binary = atob(normalizedValue);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}
