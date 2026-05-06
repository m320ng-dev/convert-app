export type UuidUlidKind = 'uuid' | 'ulid' | 'both';

export interface UuidUlidItem {
  label: 'UUID v4' | 'ULID';
  value: string;
}

export interface UuidValidationResult {
  isValid: boolean;
  input: string;
  normalized: string | null;
  version: number | null;
  variant: string | null;
  message: string;
}

export interface BrowserCryptoLike {
  randomUUID?: () => `${string}-${string}-${string}-${string}-${string}`;
  getRandomValues: <T extends Uint8Array>(array: T) => T;
}

interface GenerateUlidOptions {
  crypto?: BrowserCryptoLike;
  now?: () => number;
}

interface GenerateUuidUlidOptions extends GenerateUlidOptions {
  kind: UuidUlidKind;
  quantity: number;
}

const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const MAX_QUANTITY = 100;
const UUID_PATTERN =
  /^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/i;

export function generateUuid(cryptoSource = getBrowserCrypto()): string {
  if (typeof cryptoSource.randomUUID === 'function') {
    return cryptoSource.randomUUID();
  }

  const bytes = cryptoSource.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
}

export function generateUlid({ crypto: cryptoSource = getBrowserCrypto(), now = Date.now }: GenerateUlidOptions = {}) {
  const time = now();

  if (!Number.isSafeInteger(time) || time < 0 || time > 0xffffffffffff) {
    throw new Error('ULID timestamp는 안전한 양의 밀리초 값이어야 합니다.');
  }

  const timePart = encodeTime(time);
  const randomBytes = cryptoSource.getRandomValues(new Uint8Array(16));
  const randomPart = encodeRandom(randomBytes).slice(0, 16);

  return `${timePart}${randomPart}`;
}

export function generateUuidUlidResults({
  kind,
  quantity,
  crypto: cryptoSource = getBrowserCrypto(),
  now = Date.now,
}: GenerateUuidUlidOptions): { items: UuidUlidItem[] } {
  if (!['uuid', 'ulid', 'both'].includes(kind)) {
    throw new Error('생성할 식별자 종류를 확인해주세요.');
  }

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw new Error('생성 개수는 1~100개 사이로 입력해주세요.');
  }

  const items: UuidUlidItem[] = [];

  for (let index = 0; index < quantity; index += 1) {
    if (kind === 'uuid' || kind === 'both') {
      items.push({ label: 'UUID v4', value: generateUuid(cryptoSource) });
    }

    if (kind === 'ulid' || kind === 'both') {
      items.push({ label: 'ULID', value: generateUlid({ crypto: cryptoSource, now }) });
    }
  }

  return { items };
}

export function formatUuidUlidResults(items: UuidUlidItem[], format: 'newline' | 'json' = 'newline') {
  if (format === 'json') {
    return JSON.stringify(items, null, 2);
  }

  return items.map((item) => item.value).join('\n');
}

export function validateUuid(value: string): UuidValidationResult {
  const input = value.trim();

  if (!input) {
    throw new Error('검증할 UUID를 입력해주세요.');
  }

  const match = UUID_PATTERN.exec(input);

  if (!match) {
    return {
      isValid: false,
      input,
      normalized: null,
      version: null,
      variant: null,
      message: 'UUID 형식이 아닙니다. 8-4-4-4-12 하이픈 형식을 확인해주세요.',
    };
  }

  const normalized = input.toLowerCase();
  const version = Number.parseInt(match[3][0], 16);
  const variant = resolveUuidVariant(match[4][0]);

  return {
    isValid: true,
    input,
    normalized,
    version,
    variant,
    message: `유효한 UUID v${version} 형식입니다.`,
  };
}

function encodeTime(time: number) {
  let remaining = time;
  const characters = Array.from({ length: 10 }, () => '0');

  for (let index = 9; index >= 0; index -= 1) {
    characters[index] = CROCKFORD_BASE32[remaining % 32];
    remaining = Math.floor(remaining / 32);
  }

  return characters.join('');
}

function encodeRandom(bytes: Uint8Array) {
  let bits = '';

  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, '0');
  }

  let encoded = '';

  for (let index = 0; index < bits.length; index += 5) {
    const chunk = bits.slice(index, index + 5).padEnd(5, '0');
    encoded += CROCKFORD_BASE32[Number.parseInt(chunk, 2)];
  }

  return encoded;
}

function resolveUuidVariant(character: string) {
  const value = Number.parseInt(character, 16);

  if (value <= 0x7) {
    return 'NCS';
  }

  if (value <= 0xb) {
    return 'RFC 4122';
  }

  if (value <= 0xd) {
    return 'Microsoft';
  }

  return 'Future';
}

function getBrowserCrypto(): BrowserCryptoLike {
  if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
    throw new Error('브라우저 crypto API를 사용할 수 없습니다.');
  }

  return crypto;
}
