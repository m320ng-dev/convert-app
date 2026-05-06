export type JwtSigningAlgorithm = 'HS256' | 'HS384' | 'HS512';

export interface GenerateJwtInput {
  algorithm: JwtSigningAlgorithm;
  headerJson: string;
  payloadJson: string;
  key: string;
}

export interface JwtGeneratorClaimInput {
  basePayloadJson: string;
  standardClaims: {
    issuer?: string;
    subject?: string;
    audience?: string;
    expiresAt?: string;
    notBefore?: string;
    issuedAt?: string;
    jwtId?: string;
  };
  customClaimsJson: string;
}

const signingAlgorithms: Record<JwtSigningAlgorithm, HmacImportParams> = {
  HS256: { name: 'HMAC', hash: 'SHA-256' },
  HS384: { name: 'HMAC', hash: 'SHA-384' },
  HS512: { name: 'HMAC', hash: 'SHA-512' },
};

export async function generateJwt(input: GenerateJwtInput): Promise<string> {
  if (!input.key) {
    throw new Error('JWT 서명 secret을 입력해주세요.');
  }

  const header = parseJsonObject(input.headerJson, 'JWT header JSON');
  const payload = parseJsonObject(input.payloadJson, 'JWT payload JSON');
  const encodedHeader = encodeBase64UrlFromText(
    JSON.stringify({
      ...header,
      alg: input.algorithm,
    }),
  );
  const encodedPayload = encodeBase64UrlFromText(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(input.key),
    signingAlgorithms[input.algorithm],
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    signingAlgorithms[input.algorithm],
    cryptoKey,
    new TextEncoder().encode(signingInput),
  );

  return `${signingInput}.${toBase64Url(new Uint8Array(signature))}`;
}

export function buildJwtPayloadFromClaims(input: JwtGeneratorClaimInput): Record<string, unknown> {
  const payload = parseJsonObject(input.basePayloadJson || '{}', 'JWT payload JSON');
  const customClaims = parseJsonObject(input.customClaimsJson || '{}', 'Custom claims JSON');
  const standardClaims = {
    iss: input.standardClaims.issuer,
    sub: input.standardClaims.subject,
    aud: input.standardClaims.audience,
    exp: parseOptionalTimestamp(input.standardClaims.expiresAt, 'expires-at'),
    nbf: parseOptionalTimestamp(input.standardClaims.notBefore, 'not-before'),
    iat: parseOptionalTimestamp(input.standardClaims.issuedAt, 'issued-at'),
    jti: input.standardClaims.jwtId,
  };

  return Object.fromEntries(
    Object.entries({
      ...payload,
      ...customClaims,
      ...standardClaims,
    }).filter(([, value]) => value !== undefined && value !== ''),
  );
}

export function validateJwtGeneratorJsonInputs({
  headerJson,
  payloadJson,
}: {
  headerJson: string;
  payloadJson: string;
}): { valid: true; headerError: null; payloadError: null } | {
  valid: false;
  headerError: string | null;
  payloadError: string | null;
} {
  const headerError = getJsonObjectError(headerJson, 'JWT header JSON');
  const payloadError = getJsonObjectError(payloadJson, 'JWT payload JSON');

  if (headerError || payloadError) {
    return {
      valid: false,
      headerError,
      payloadError,
    };
  }

  return {
    valid: true,
    headerError: null,
    payloadError: null,
  };
}

function parseJsonObject(value: string, label: string): Record<string, unknown> {
  const error = getJsonObjectError(value, label);
  if (error) {
    throw new Error(error);
  }

  return JSON.parse(value);
}

function getJsonObjectError(value: string, label: string): string | null {
  if (!value.trim()) {
    return `${label}을 입력해주세요.`;
  }

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return `${label}을 파싱할 수 없습니다. JSON 객체를 입력해주세요.`;
    }
  } catch {
    return `${label}을 파싱할 수 없습니다.`;
  }

  return null;
}

function parseOptionalTimestamp(value: string | undefined, label: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`${label} 값은 안전한 Unix timestamp 범위 안에서 입력해주세요.`);
  }

  return parsed;
}

function encodeBase64UrlFromText(value: string): string {
  const bytes = new TextEncoder().encode(value);

  return toBase64Url(bytes);
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
