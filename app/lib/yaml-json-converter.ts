export type YamlJsonConversionMode = 'yaml-to-json' | 'json-to-yaml';

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

interface YamlLine {
  indent: number;
  text: string;
}

export function convertYamlJson(value: string, mode: YamlJsonConversionMode) {
  return mode === 'yaml-to-json' ? yamlToJson(value) : jsonToYaml(value);
}

export function yamlToJson(value: string) {
  if (!value.trim()) {
    throw new Error('YAML을 입력해주세요.');
  }

  const lines = normalizeYamlLines(value);
  const { value: parsedValue, nextIndex } = parseYamlBlock(lines, 0, lines[0]?.indent ?? 0);

  if (nextIndex < lines.length) {
    throw new Error('YAML 들여쓰기를 확인해주세요.');
  }

  return JSON.stringify(parsedValue, null, 2);
}

export function jsonToYaml(value: string) {
  if (!value.trim()) {
    throw new Error('JSON을 입력해주세요.');
  }

  let parsed: JsonValue;

  try {
    parsed = JSON.parse(value) as JsonValue;
  } catch {
    throw new Error('유효한 JSON 형식이 아닙니다.');
  }

  return stringifyYamlValue(parsed, 0);
}

function normalizeYamlLines(value: string): YamlLine[] {
  return value
    .split(/\r?\n/)
    .map((line) => {
      if (/^\s*#/.test(line) || !line.trim()) {
        return null;
      }

      if (line.includes('\t')) {
        throw new Error('YAML 들여쓰기는 공백만 사용할 수 있습니다.');
      }

      const indent = line.match(/^ */)?.[0].length ?? 0;

      if (indent % 2 !== 0) {
        throw new Error('YAML 들여쓰기를 확인해주세요.');
      }

      return { indent, text: line.trim() };
    })
    .filter((line): line is YamlLine => Boolean(line));
}

function parseYamlBlock(lines: YamlLine[], startIndex: number, indent: number): { value: JsonValue; nextIndex: number } {
  const firstLine = lines[startIndex];

  if (!firstLine || firstLine.indent < indent) {
    return { value: {}, nextIndex: startIndex };
  }

  if (firstLine.indent !== indent) {
    throw new Error('YAML 들여쓰기를 확인해주세요.');
  }

  return firstLine.text.startsWith('- ')
    ? parseYamlArray(lines, startIndex, indent)
    : parseYamlObject(lines, startIndex, indent);
}

function parseYamlArray(lines: YamlLine[], startIndex: number, indent: number): { value: JsonValue[]; nextIndex: number } {
  const values: JsonValue[] = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index];

    if (line.indent < indent) {
      break;
    }

    if (line.indent > indent || !line.text.startsWith('- ')) {
      throw new Error('YAML 들여쓰기를 확인해주세요.');
    }

    const itemText = line.text.slice(2).trim();

    if (itemText) {
      values.push(parseScalar(itemText));
      index += 1;
      continue;
    }

    const nextLine = lines[index + 1];

    if (!nextLine || nextLine.indent <= indent) {
      values.push(null);
      index += 1;
      continue;
    }

    const child = parseYamlBlock(lines, index + 1, indent + 2);
    values.push(child.value);
    index = child.nextIndex;
  }

  return { value: values, nextIndex: index };
}

function parseYamlObject(lines: YamlLine[], startIndex: number, indent: number): { value: Record<string, JsonValue>; nextIndex: number } {
  const record: Record<string, JsonValue> = {};
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index];

    if (line.indent < indent) {
      break;
    }

    if (line.indent > indent || line.text.startsWith('- ')) {
      throw new Error('YAML 들여쓰기를 확인해주세요.');
    }

    const separatorIndex = line.text.indexOf(':');

    if (separatorIndex <= 0) {
      throw new Error('YAML 키와 값을 확인해주세요.');
    }

    const key = line.text.slice(0, separatorIndex).trim();
    const rawValue = line.text.slice(separatorIndex + 1).trim();

    if (!key) {
      throw new Error('YAML 키와 값을 확인해주세요.');
    }

    if (rawValue) {
      record[key] = parseScalar(rawValue);
      index += 1;
      continue;
    }

    const nextLine = lines[index + 1];

    if (!nextLine || nextLine.indent <= indent) {
      record[key] = null;
      index += 1;
      continue;
    }

    const child = parseYamlBlock(lines, index + 1, indent + 2);
    record[key] = child.value;
    index = child.nextIndex;
  }

  return { value: record, nextIndex: index };
}

function parseScalar(value: string): JsonValue {
  if (value === 'null' || value === '~') {
    return null;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) {
    return Number(value);
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function stringifyYamlValue(value: JsonValue, indent: number): string {
  if (Array.isArray(value)) {
    return value.map((item) => stringifyYamlArrayItem(item, indent)).join('\n');
  }

  if (isRecord(value)) {
    return Object.entries(value)
      .map(([key, item]) => stringifyYamlProperty(key, item, indent))
      .join('\n');
  }

  return stringifyScalar(value);
}

function stringifyYamlProperty(key: string, value: JsonValue, indent: number) {
  const prefix = `${' '.repeat(indent)}${key}:`;

  if (Array.isArray(value) || isRecord(value)) {
    const nested = stringifyYamlValue(value, indent + 2);
    return nested ? `${prefix}\n${nested}` : `${prefix} []`;
  }

  return `${prefix} ${stringifyScalar(value)}`;
}

function stringifyYamlArrayItem(value: JsonValue, indent: number) {
  const prefix = `${' '.repeat(indent)}-`;

  if (Array.isArray(value) || isRecord(value)) {
    const nested = stringifyYamlValue(value, indent + 2);
    return nested ? `${prefix}\n${nested}` : `${prefix} []`;
  }

  return `${prefix} ${stringifyScalar(value)}`;
}

function stringifyScalar(value: Exclude<JsonValue, JsonValue[] | { [key: string]: JsonValue }>) {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'string') {
    return shouldQuoteString(value) ? JSON.stringify(value) : value;
  }

  return String(value);
}

function shouldQuoteString(value: string) {
  return value === '' || /^[\s-]|[:#\n\r]|[\s]$/.test(value);
}

function isRecord(value: JsonValue): value is { [key: string]: JsonValue } {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
