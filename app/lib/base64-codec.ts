export type Base64Mode = 'encode' | 'decode';

export function convertBase64Text(value: string, mode: Base64Mode): string {
  if (!value.trim()) {
    return '';
  }

  try {
    return mode === 'encode' ? encodeBase64(value) : decodeBase64(value);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Base64는 유효하지만 UTF-8 텍스트로 디코딩할 수 없습니다.'
    ) {
      throw error;
    }

    throw new Error(
      mode === 'encode'
        ? '텍스트를 Base64로 인코딩하는 중 오류가 발생했습니다.'
        : 'Base64를 디코딩할 수 없습니다. 올바른 Base64 문자열인지 확인해주세요.',
    );
  }
}

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');

  return btoa(binary);
}

function decodeBase64(value: string): string {
  const normalized = value.replace(/\s/g, '');

  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized) || normalized.length % 4 === 1) {
    throw new Error('invalid base64');
  }

  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Error('Base64는 유효하지만 UTF-8 텍스트로 디코딩할 수 없습니다.');
  }
}
