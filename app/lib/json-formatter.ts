export type JsonFormatterMode = 'format' | 'minify' | 'validate';

export function formatJsonText(value: string, mode: JsonFormatterMode): string {
  if (!value.trim()) {
    return '';
  }

  try {
    const parsed = JSON.parse(value);
    if (mode === 'validate') {
      return '유효한 JSON입니다.';
    }

    return JSON.stringify(parsed, null, mode === 'format' ? 2 : 0);
  } catch {
    throw new Error('유효하지 않은 JSON 형식입니다. 입력값을 확인해주세요.');
  }
}
