export interface CurlToCodeOptions {
  language: 'javascript-fetch' | 'python-requests';
  includeTimeout?: boolean;
  includeComments?: boolean;
}

export interface CurlToCodeResult {
  code: string;
  summary: string;
}

export function generateCodeFromCurl(command: string, options: CurlToCodeOptions): CurlToCodeResult {
  if (!options || typeof options !== 'object') {
    throw new Error('코드 생성 옵션을 확인해주세요.');
  }

  const parsed = parseSimpleCurl(command);

  if (options.language === 'python-requests') {
    return {
      code: buildPythonRequests(parsed, options),
      summary: `${parsed.method} ${parsed.url}`,
    };
  }

  return {
    code: buildJavascriptFetch(parsed, options),
    summary: `${parsed.method} ${parsed.url}`,
  };
}

interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  data?: string;
}

function parseSimpleCurl(command: string): ParsedCurl {
  const tokens = command.match(/"[^"]*"|'[^']*'|\S+/g)?.map((token) => token.replace(/^['"]|['"]$/g, '')) ?? [];

  if (tokens[0] !== 'curl') {
    throw new Error('명령어는 curl로 시작해야 합니다.');
  }

  const result: ParsedCurl = {
    method: 'GET',
    url: '',
    headers: {},
  };

  for (let index = 1; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token === '-X' || token === '--request') {
      const method = tokens[++index] ?? '';
      if (!/^[A-Za-z]+$/.test(method)) {
        throw new Error('HTTP 메서드는 영문자로 입력해주세요.');
      }
      result.method = method.toUpperCase();
      continue;
    }

    if (token === '-H' || token === '--header') {
      const header = tokens[++index] ?? '';
      const separatorIndex = header.indexOf(':');
      if (separatorIndex < 1) {
        throw new Error('헤더는 "이름: 값" 형식이어야 합니다.');
      }
      result.headers[header.slice(0, separatorIndex).trim()] = header.slice(separatorIndex + 1).trim();
      continue;
    }

    if (token === '--data-raw' || token === '--data' || token === '-d') {
      result.data = tokens[++index] ?? '';
      if (result.method === 'GET') {
        result.method = 'POST';
      }
      continue;
    }

    if (!token.startsWith('-') && !result.url) {
      result.url = token;
    }
  }

  if (!result.url) {
    throw new Error('요청 URL을 입력해주세요.');
  }

  return result;
}

function buildPythonRequests(parsed: ParsedCurl, options: CurlToCodeOptions): string {
  const lines = ['import requests', '', `url = ${JSON.stringify(parsed.url)}`];

  if (Object.keys(parsed.headers).length > 0) {
    lines.push(`headers = ${JSON.stringify(parsed.headers, null, 2)}`);
  }

  if (parsed.data) {
    try {
      lines.push(`payload = ${JSON.stringify(JSON.parse(parsed.data), null, 2)}`);
    } catch {
      lines.push(`payload = ${JSON.stringify(parsed.data)}`);
    }
  }

  const args = [`method=${JSON.stringify(parsed.method)}`, 'url=url'];
  if (Object.keys(parsed.headers).length > 0) args.push('headers=headers');
  if (parsed.data) args.push(isJsonPayload(parsed) ? 'json=payload' : 'data=payload');
  if (options.includeTimeout) args.push('timeout=30');

  lines.push('', `response = requests.request(${args.join(', ')})`, 'print(response.text)');

  return lines.join('\n');
}

function buildJavascriptFetch(parsed: ParsedCurl, options: CurlToCodeOptions): string {
  const lines = [
    `const response = await fetch(${JSON.stringify(parsed.url)}, {`,
    `  method: ${JSON.stringify(parsed.method)},`,
  ];

  if (Object.keys(parsed.headers).length > 0) {
    lines.push(`  headers: ${JSON.stringify(parsed.headers, null, 2)},`);
  }
  if (parsed.data) {
    lines.push(`  body: ${JSON.stringify(parsed.data)},`);
  }
  if (options.includeTimeout) {
    lines.push('  signal: AbortSignal.timeout(30000),');
  }

  lines.push('});', 'console.log(await response.text());');

  return lines.join('\n');
}

function isJsonPayload(parsed: ParsedCurl): boolean {
  return /^application\/json\b/i.test(parsed.headers['Content-Type'] ?? '');
}
