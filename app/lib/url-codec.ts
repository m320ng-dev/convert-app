export type UrlCodecMode =
  | 'encode-component'
  | 'decode-component'
  | 'encode-full'
  | 'decode-full'
  | 'parse';

const DECODE_ERROR_MESSAGE = 'URL 디코딩에 실패했습니다. 퍼센트 인코딩 형식을 확인해주세요.';
const PARSE_ERROR_MESSAGE = 'URL 파싱에 실패했습니다. https://example.com/path 같은 전체 URL을 입력해주세요.';

type ParsedUrlQueryValue = string | string[];

export function encodeUrlComponent(value: string) {
  return encodeURIComponent(value);
}

export function decodeUrlComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    throw new Error(DECODE_ERROR_MESSAGE);
  }
}

export function encodeUrlFull(value: string) {
  return encodeURI(value);
}

export function decodeUrlFull(value: string) {
  try {
    return decodeURI(value);
  } catch {
    throw new Error(DECODE_ERROR_MESSAGE);
  }
}

export function parseUrlText(value: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(PARSE_ERROR_MESSAGE);
  }

  const query: Record<string, ParsedUrlQueryValue> = {};

  for (const [key, queryValue] of url.searchParams.entries()) {
    const currentValue = query[key];
    if (Array.isArray(currentValue)) {
      currentValue.push(queryValue);
    } else if (typeof currentValue === 'string') {
      query[key] = [currentValue, queryValue];
    } else {
      query[key] = queryValue;
    }
  }

  return JSON.stringify(
    {
      href: url.href,
      protocol: url.protocol,
      username: url.username,
      password: url.password,
      origin: url.origin,
      host: url.host,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      query,
    },
    null,
    2,
  );
}

export function convertUrlText(value: string, mode: UrlCodecMode) {
  switch (mode) {
    case 'encode-component':
      return encodeUrlComponent(value);
    case 'decode-component':
      return decodeUrlComponent(value);
    case 'encode-full':
      return encodeUrlFull(value);
    case 'decode-full':
      return decodeUrlFull(value);
    case 'parse':
      return parseUrlText(value);
  }
}
