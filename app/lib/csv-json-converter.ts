export type CsvJsonConversionMode = 'csv-to-json' | 'json-to-csv';

const EMPTY_CSV_MESSAGE = 'CSV를 입력해주세요.';
const EMPTY_JSON_MESSAGE = 'JSON을 입력해주세요.';
const CSV_COLUMN_MISMATCH_MESSAGE = 'CSV 행의 열 개수가 헤더와 다릅니다.';
const JSON_ARRAY_MESSAGE = 'JSON 객체 배열을 입력해주세요.';
const JSON_VALUE_MESSAGE = '문자열, 숫자, 불리언, null 값만 CSV로 변환할 수 있습니다.';

type CsvPrimitive = string | number | boolean | null;
type CsvRecord = Record<string, CsvPrimitive | undefined>;

export function convertCsvJson(value: string, mode: CsvJsonConversionMode) {
  return mode === 'csv-to-json' ? csvToJson(value) : jsonToCsv(value);
}

export function csvToJson(value: string) {
  if (!value.trim()) {
    throw new Error(EMPTY_CSV_MESSAGE);
  }

  const rows = parseCsvRows(value);
  const headers = rows[0]?.map((header) => header.trim()) ?? [];

  if (headers.length === 0 || headers.some((header) => !header)) {
    throw new Error('CSV 헤더를 확인해주세요.');
  }

  const records = rows.slice(1).map((row) => {
    if (row.length !== headers.length) {
      throw new Error(CSV_COLUMN_MISMATCH_MESSAGE);
    }

    return Object.fromEntries(headers.map((header, index) => [header, row[index] ?? '']));
  });

  return JSON.stringify(records, null, 2);
}

export function jsonToCsv(value: string) {
  if (!value.trim()) {
    throw new Error(EMPTY_JSON_MESSAGE);
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error('유효한 JSON 형식이 아닙니다.');
  }

  if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.every(isPlainRecord)) {
    throw new Error(JSON_ARRAY_MESSAGE);
  }

  const records = parsed as CsvRecord[];
  validateCsvRecordValues(records);
  const headers = collectHeaders(records);
  const csvRows = [
    headers.map(escapeCsvCell).join(','),
    ...records.map((record) => headers.map((header) => stringifyCsvValue(record[header])).join(',')),
  ];

  return csvRows.join('\n');
}

function parseCsvRows(value: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const nextChar = value[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';

      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }
      continue;
    }

    field += char;
  }

  if (inQuotes) {
    throw new Error('CSV 따옴표가 닫히지 않았습니다.');
  }

  row.push(field);
  rows.push(row);

  return rows.filter((csvRow) => !(csvRow.length === 1 && csvRow[0] === ''));
}

function isPlainRecord(value: unknown): value is CsvRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validateCsvRecordValues(records: CsvRecord[]) {
  for (const record of records) {
    for (const fieldValue of Object.values(record)) {
      if (
        fieldValue !== null &&
        fieldValue !== undefined &&
        typeof fieldValue !== 'string' &&
        typeof fieldValue !== 'number' &&
        typeof fieldValue !== 'boolean'
      ) {
        throw new Error(JSON_VALUE_MESSAGE);
      }
    }
  }
}

function collectHeaders(records: CsvRecord[]) {
  const headers = new Set<string>();

  for (const record of records) {
    for (const key of Object.keys(record)) {
      headers.add(key);
    }
  }

  if (headers.size === 0) {
    throw new Error(JSON_ARRAY_MESSAGE);
  }

  return Array.from(headers);
}

function stringifyCsvValue(value: CsvPrimitive | undefined) {
  if (
    value !== null &&
    value !== undefined &&
    typeof value !== 'string' &&
    typeof value !== 'number' &&
    typeof value !== 'boolean'
  ) {
    throw new Error(JSON_VALUE_MESSAGE);
  }

  return escapeCsvCell(value === null || value === undefined ? '' : String(value));
}

function escapeCsvCell(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}
