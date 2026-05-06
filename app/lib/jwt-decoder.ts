export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  signingInput: string;
}

export interface JwtValidationOptions {
  algorithms?: string[];
  secret?: string;
  key?: string;
  clockToleranceSeconds?: number;
  expectedIssuer?: string;
  expectedAudience?: string;
  expectedSubject?: string;
  expectedCustomClaims?: Record<string, unknown>;
}

export interface JwtValidationResult extends DecodedJwt {
  valid: true;
}

const supportedAlgorithms = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512'] as const;

type SupportedAlgorithm = (typeof supportedAlgorithms)[number];

const hmacAlgorithms: Record<string, HmacImportParams> = {
  HS256: { name: 'HMAC', hash: 'SHA-256' },
  HS384: { name: 'HMAC', hash: 'SHA-384' },
  HS512: { name: 'HMAC', hash: 'SHA-512' },
};

const rsaAlgorithms: Record<string, RsaHashedImportParams> = {
  RS256: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
  RS384: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-384' },
  RS512: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-512' },
};

export function decodeJwt(token: string): DecodedJwt {
  const normalizedToken = token.trim();
  const parts = normalizedToken.split('.');

  if (parts.length !== 3 || parts[0].length === 0 || parts[1].length === 0) {
    throw new Error('JWT는 header.payload.signature 형식의 3개 구역으로 구성되어야 합니다.');
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const header = decodeJwtPart(encodedHeader, 'header');
  const payload = decodeJwtPart(encodedPayload, 'payload');

  return {
    header,
    payload,
    signature,
    signingInput: `${encodedHeader}.${encodedPayload}`,
  };
}

export async function validateJwt(
  token: string,
  options: JwtValidationOptions = {},
): Promise<JwtValidationResult> {
  const decoded = decodeJwt(token);
  const algorithm = decoded.header.alg;

  if (!decoded.signature) {
    throw new Error('JWT signature 구역이 비어 있어 서명을 검증할 수 없습니다.');
  }

  if (typeof algorithm !== 'string' || !isSupportedAlgorithm(algorithm)) {
    throw new Error('지원하지 않는 JWT alg 값입니다.');
  }

  if (options.algorithms !== undefined) {
    if (options.algorithms.length === 0) {
      throw new Error('검증할 JWT 알고리즘을 하나 이상 선택해주세요.');
    }

    if (!options.algorithms.every(isSupportedAlgorithm)) {
      throw new Error('지원하지 않는 JWT 검증 알고리즘 옵션입니다.');
    }

    if (!options.algorithms.includes(algorithm)) {
      throw new Error('JWT alg 값이 선택한 검증 알고리즘과 일치하지 않습니다.');
    }
  }

  const clockToleranceSeconds = options.clockToleranceSeconds ?? 0;
  if (!Number.isInteger(clockToleranceSeconds) || clockToleranceSeconds < 0) {
    throw new Error('JWT clock tolerance는 0 이상의 초 단위 정수여야 합니다.');
  }

  const verified = algorithm.startsWith('HS')
    ? await verifyHmacJwt(decoded, algorithm, options.secret)
    : await verifyRsaJwt(decoded, algorithm, options.key);

  if (!verified) {
    throw new Error('JWT 서명 검증 실패: 서명이 일치하지 않습니다.');
  }

  validateRegisteredClaims(decoded.payload, {
    clockToleranceSeconds,
    expectedIssuer: options.expectedIssuer,
    expectedAudience: options.expectedAudience,
    expectedSubject: options.expectedSubject,
    expectedCustomClaims: options.expectedCustomClaims,
  });

  return {
    ...decoded,
    valid: true,
  };
}

function decodeJwtPart(encodedPart: string, label: 'header' | 'payload'): Record<string, unknown> {
  let jsonText: string;

  try {
    jsonText = decodeBase64UrlToText(encodedPart);
  } catch {
    throw new Error(`JWT ${label} 구역을 Base64URL로 디코딩할 수 없습니다.`);
  }

  try {
    const parsed = JSON.parse(jsonText);
    if (!isPlainObject(parsed)) {
      throw new Error();
    }

    return parsed;
  } catch {
    throw new Error(`JWT ${label} 구역은 JSON 객체여야 합니다.`);
  }
}

function decodeBase64UrlToText(value: string): string {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) {
    throw new Error('invalid base64url');
  }

  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isSupportedAlgorithm(value: string): value is SupportedAlgorithm {
  return supportedAlgorithms.includes(value as SupportedAlgorithm);
}

async function verifyHmacJwt(
  decoded: DecodedJwt,
  algorithm: SupportedAlgorithm,
  secret: string | undefined,
): Promise<boolean> {
  if (!secret) {
    throw new Error('HMAC JWT 검증에 사용할 secret을 입력해주세요.');
  }

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    hmacAlgorithms[algorithm],
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    hmacAlgorithms[algorithm],
    cryptoKey,
    new TextEncoder().encode(decoded.signingInput),
  );

  return toBase64Url(new Uint8Array(signature)) === decoded.signature;
}

async function verifyRsaJwt(
  decoded: DecodedJwt,
  algorithm: SupportedAlgorithm,
  publicKeyPem: string | undefined,
): Promise<boolean> {
  if (!publicKeyPem) {
    throw new Error('RSA JWT 검증에 사용할 public key PEM을 입력해주세요.');
  }

  let cryptoKey: CryptoKey;
  try {
    cryptoKey = await crypto.subtle.importKey(
      'spki',
      pemToBytes(publicKeyPem),
      rsaAlgorithms[algorithm],
      false,
      ['verify'],
    );
  } catch {
    throw new Error('RSA 검증에 사용할 SPKI public key PEM을 확인해주세요.');
  }

  return crypto.subtle.verify(
    rsaAlgorithms[algorithm],
    cryptoKey,
    base64UrlToBytes(decoded.signature),
    new TextEncoder().encode(decoded.signingInput),
  );
}

function validateRegisteredClaims(
  payload: Record<string, unknown>,
  options: Required<Pick<JwtValidationOptions, 'clockToleranceSeconds'>> &
    Pick<
      JwtValidationOptions,
      'expectedIssuer' | 'expectedAudience' | 'expectedSubject' | 'expectedCustomClaims'
    >,
) {
  const now = Math.floor(Date.now() / 1000);
  const tolerance = options.clockToleranceSeconds;

  validateRegisteredClaimTypes(payload);

  if (typeof payload.exp === 'number' && now - tolerance >= payload.exp) {
    throw new Error('JWT exp 시간이 만료되었습니다.');
  }

  if (typeof payload.nbf === 'number' && now + tolerance < payload.nbf) {
    throw new Error('JWT nbf 시간이 아직 유효하지 않습니다.');
  }

  if (options.expectedIssuer && payload.iss !== options.expectedIssuer) {
    throw new Error('JWT issuer(iss)가 기대값과 일치하지 않습니다.');
  }

  if (options.expectedSubject && payload.sub !== options.expectedSubject) {
    throw new Error('JWT subject(sub)가 기대값과 일치하지 않습니다.');
  }

  if (options.expectedAudience && !matchesAudience(payload.aud, options.expectedAudience)) {
    throw new Error('JWT audience(aud)가 기대값과 일치하지 않습니다.');
  }

  for (const [key, value] of Object.entries(options.expectedCustomClaims ?? {})) {
    if (!Object.is(JSON.stringify(payload[key]), JSON.stringify(value))) {
      throw new Error(`JWT custom claim ${key} 값이 기대값과 일치하지 않습니다.`);
    }
  }
}

function validateRegisteredClaimTypes(payload: Record<string, unknown>) {
  for (const claim of ['exp', 'nbf', 'iat'] as const) {
    const value = payload[claim];
    if (
      value !== undefined &&
      (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0)
    ) {
      throw new Error(`JWT ${claim} 클레임은 Unix timestamp 숫자여야 합니다.`);
    }
  }

  for (const claim of ['iss', 'sub', 'jti'] as const) {
    const value = payload[claim];
    if (value !== undefined && typeof value !== 'string') {
      throw new Error(`JWT ${claim} 클레임은 문자열이어야 합니다.`);
    }
  }

  const audience = payload.aud;
  if (
    audience !== undefined &&
    typeof audience !== 'string' &&
    (!Array.isArray(audience) || !audience.every((item) => typeof item === 'string'))
  ) {
    throw new Error('JWT aud 클레임은 문자열 또는 문자열 배열이어야 합니다.');
  }
}

function matchesAudience(audience: unknown, expectedAudience: string): boolean {
  return audience === expectedAudience || (Array.isArray(audience) && audience.includes(expectedAudience));
}

function pemToBytes(pem: string): Uint8Array {
  const base64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s/g, '');

  if (!base64) {
    throw new Error('empty pem');
  }

  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');

  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
