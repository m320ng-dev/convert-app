export type TimestampMode = 'timestamp-to-date' | 'date-to-timestamp';

export function convertTimestampText(value: string, mode: TimestampMode): string {
  if (!value.trim()) {
    return '';
  }

  return mode === 'timestamp-to-date'
    ? timestampToDateText(value)
    : dateTextToTimestamp(value);
}

function timestampToDateText(value: string): string {
  const numericValue = Number(value.trim());

  if (!Number.isFinite(numericValue)) {
    throw new Error('유효한 Unix timestamp 숫자를 입력해주세요.');
  }

  const milliseconds = Math.abs(numericValue) >= 100000000000 ? numericValue : numericValue * 1000;
  const date = new Date(milliseconds);

  if (Number.isNaN(date.getTime())) {
    throw new Error('유효한 Unix timestamp 범위를 입력해주세요.');
  }

  return formatTimestampResult(date);
}

function dateTextToTimestamp(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error('유효한 날짜 문자열을 입력해주세요.');
  }

  return formatTimestampResult(date);
}

function formatTimestampResult(date: Date): string {
  const milliseconds = date.getTime();
  const seconds = Math.floor(milliseconds / 1000);
  const localTime = date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });

  return [
    `UTC ISO: ${date.toISOString()}`,
    `로컬 시간: ${localTime}`,
    `Unix seconds: ${seconds}`,
    `Unix milliseconds: ${milliseconds}`,
  ].join('\n');
}
