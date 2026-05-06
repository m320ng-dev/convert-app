export interface CodeToCurlOptions {
  language: 'auto' | 'javascript-fetch' | 'python-requests' | 'http';
  multiline?: boolean;
  redactSensitiveValues?: boolean;
  followRedirects?: boolean;
}

export interface CodeToCurlResult {
  command: string;
  summary: string;
  warnings: string[];
}

const SENSITIVE_HEADER_NAMES = new Set(['authorization', 'cookie', 'x-api-key']);

export function convertCodeToCurl(input: string, options: CodeToCurlOptions): CodeToCurlResult {
  if (!options || typeof options !== 'object') {
    throw new Error('변환 옵션을 확인해주세요.');
  }

  const source = input.trim();

  if (options.language === 'auto') {
    if (/axios\./.test(source)) {
      throw new Error('axios 요청 패턴은 아직 지원하지 않습니다.');
    }
    if (/httpx\./.test(source)) {
      throw new Error('Python httpx 요청 패턴은 아직 지원하지 않습니다.');
    }
    if (/XMLHttpRequest/.test(source)) {
      throw new Error('XMLHttpRequest 패턴은 아직 지원하지 않습니다.');
    }
  }

  if (options.language === 'python-requests') {
    const timeoutMatch = source.match(/timeout\s*=\s*(\d+(?:\.\d+)?)/);
    if (timeoutMatch && Number(timeoutMatch[1]) < 1) {
      throw new Error('timeout 값은 1초 이상의 숫자여야 합니다.');
    }
    throw new Error('Python requests 호출을 찾을 수 없습니다.');
  }

  if (options.language === 'http') {
    return convertRawHttpToCurl(source, options);
  }

  return convertFetchToCurl(source, options);
}

function convertFetchToCurl(source: string, options: CodeToCurlOptions): CodeToCurlResult {
  const urlMatch = source.match(/fetch\(\s*(['"])(https?:\/\/[^'"]+)\1/);

  if (!urlMatch) {
    if (/fetch\(\s*[A-Za-z_$][\w$]*/.test(source)) {
      throw new Error('변수 URL 패턴은 아직 지원하지 않습니다.');
    }
    throw new Error('fetch URL 문자열을 찾을 수 없습니다.');
  }

  const url = urlMatch[2];
  const method = source.match(/method\s*:\s*['"]([A-Za-z]+)['"]/)?.[1]?.toUpperCase() ?? 'GET';
  const headers = parseJavascriptHeaders(source, options.redactSensitiveValues ?? false);
  const body = parseJsonStringifyBody(source);
  const parts = ['curl'];
  const warnings: string[] = [];

  if (method !== 'GET') {
    parts.push('-X', method);
  }

  parts.push(quoteShell(url));

  for (const header of headers) {
    if (header.redacted) {
      warnings.push(`${header.name} 헤더 값은 민감할 수 있어 가렸습니다.`);
    }
    parts.push('-H', quoteShell(`${header.name}: ${header.value}`));
  }

  if (body) {
    parts.push('--data-raw', quoteShell(body));
  }

  if (options.followRedirects) {
    parts.push('--location');
  }

  return {
    command: parts.join(' '),
    summary: `${method} ${url}`,
    warnings,
  };
}

function convertRawHttpToCurl(source: string, options: CodeToCurlOptions): CodeToCurlResult {
  const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const requestLine = lines[0] ?? '';
  const requestMatch = requestLine.match(/^([A-Z]+)\s+(\/\S*)\s+HTTP\/\d(?:\.\d)?$/);

  if (!requestMatch) {
    throw new Error('Raw HTTP 요청 첫 줄은 "METHOD /path HTTP/1.1" 형식이어야 합니다.');
  }

  const hostLine = lines.find((line) => /^Host:/i.test(line));
  if (!hostLine) {
    throw new Error('Raw HTTP 요청에는 Host 헤더가 필요합니다.');
  }

  for (const line of lines.slice(1)) {
    if (!line.includes(':')) {
      throw new Error('HTTP 헤더는 "이름: 값" 형식이어야 합니다.');
    }
  }

  const method = requestMatch[1];
  const host = hostLine.replace(/^Host:\s*/i, '');
  const url = `https://${host}${requestMatch[2]}`;
  const parts = ['curl'];

  if (method !== 'GET') {
    parts.push('-X', method);
  }

  parts.push(quoteShell(url));

  for (const line of lines.slice(1)) {
    if (/^Host:/i.test(line)) continue;
    parts.push('-H', quoteShell(line));
  }

  if (options.followRedirects) {
    parts.push('--location');
  }

  return {
    command: parts.join(' '),
    summary: `${method} ${url}`,
    warnings: [],
  };
}

function parseJavascriptHeaders(source: string, redactSensitiveValues: boolean) {
  const headersBlock = source.match(/headers\s*:\s*\{([\s\S]*?)\}\s*,?\s*(?:body|}\s*\))/)?.[1] ?? '';
  const headers: Array<{ name: string; value: string; redacted: boolean }> = [];
  const headerPattern = /['"]([^'"]+)['"]\s*:\s*['"]([^'"]*)['"]/g;
  let match: RegExpExecArray | null;

  while ((match = headerPattern.exec(headersBlock)) !== null) {
    const name = match[1];
    const isSensitive = SENSITIVE_HEADER_NAMES.has(name.toLowerCase());
    headers.push({
      name,
      value: redactSensitiveValues && isSensitive ? `<${name.toUpperCase().replaceAll('-', '_')}_VALUE>` : match[2],
      redacted: redactSensitiveValues && isSensitive,
    });
  }

  return headers;
}

function parseJsonStringifyBody(source: string): string | null {
  const bodyMatch = source.match(/body\s*:\s*JSON\.stringify\((\{[\s\S]*?\})\)/);

  if (!bodyMatch) {
    return null;
  }

  try {
    const normalized = bodyMatch[1].replace(/([,{]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":');
    return JSON.stringify(JSON.parse(normalized));
  } catch {
    return bodyMatch[1].replace(/\s+/g, ' ').trim();
  }
}

function quoteShell(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}
