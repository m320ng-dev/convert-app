export interface RandomTokenCharacterSets {
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

export interface RandomTokenOptions {
  length: number;
  quantity: number;
  characterSets: RandomTokenCharacterSets;
  excludeCharacters: string;
  excludeAmbiguous: boolean;
  prefix?: string;
  suffix?: string;
  cryptoSource?: Pick<Crypto, 'getRandomValues'>;
}

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>?';
const AMBIGUOUS = '0O1lI|`\'"';

export function generateRandomTokens(options: RandomTokenOptions): string[] {
  validateRandomTokenOptions(options);

  const pool = buildCharacterPool(options.characterSets, options.excludeCharacters, options.excludeAmbiguous);
  if (!pool) {
    throw new Error('제외 문자 설정 때문에 사용할 수 있는 문자가 없습니다. 문자 종류나 제외 문자를 조정해주세요.');
  }

  const cryptoSource = options.cryptoSource ?? globalThis.crypto;
  if (!cryptoSource?.getRandomValues) {
    throw new Error('브라우저 crypto API를 사용할 수 없습니다.');
  }

  return Array.from({ length: options.quantity }, () => {
    const body = generateTokenBody(options.length, pool, cryptoSource);
    return `${options.prefix ?? ''}${body}${options.suffix ?? ''}`;
  });
}

export function formatRandomTokenResults(
  tokens: string[],
  format: 'newline' | 'json' | 'env' | 'csv',
): string {
  if (format === 'json') {
    return JSON.stringify(tokens, null, 2);
  }

  if (format === 'env') {
    return tokens.map((token, index) => `TOKEN_${index + 1}=${token}`).join('\n');
  }

  if (format === 'csv') {
    return tokens.map((token, index) => `${index + 1},"${token.replaceAll('"', '""')}"`).join('\n');
  }

  return tokens.join('\n');
}

function validateRandomTokenOptions(options: RandomTokenOptions) {
  if (!Number.isInteger(options.length) || options.length < 4 || options.length > 256) {
    throw new Error('토큰 길이는 4~256자 사이의 숫자로 입력해주세요.');
  }

  if (!Number.isInteger(options.quantity) || options.quantity < 1) {
    throw new Error('생성 개수는 1개 이상 입력해주세요.');
  }

  if (options.quantity > 100) {
    throw new Error('생성 개수는 100개 이하로 입력해주세요.');
  }

  if (options.prefix && options.prefix.length > 256) {
    throw new Error('접두사는 256자 이하로 입력해주세요.');
  }

  if (options.suffix && options.suffix.length > 256) {
    throw new Error('접미사는 256자 이하로 입력해주세요.');
  }
}

function generateTokenBody(
  length: number,
  pool: string,
  cryptoSource: Pick<Crypto, 'getRandomValues'>,
): string {
  const maxValidByte = Math.floor(256 / pool.length) * pool.length;
  let token = '';

  while (token.length < length) {
    const bytes = new Uint8Array(length - token.length);
    cryptoSource.getRandomValues(bytes);

    for (const byte of bytes) {
      if (byte >= maxValidByte) {
        continue;
      }

      token += pool[byte % pool.length];
      if (token.length === length) {
        break;
      }
    }
  }

  return token;
}

function buildCharacterPool(
  characterSets: RandomTokenCharacterSets,
  excludeCharacters: string,
  excludeAmbiguous: boolean,
): string {
  let pool = '';

  if (characterSets.lowercase) pool += LOWERCASE;
  if (characterSets.uppercase) pool += UPPERCASE;
  if (characterSets.numbers) pool += NUMBERS;
  if (characterSets.symbols) pool += SYMBOLS;

  const excluded = new Set([
    ...excludeCharacters,
    ...(excludeAmbiguous ? AMBIGUOUS : ''),
  ]);

  return Array.from(new Set(pool))
    .filter((character) => !excluded.has(character))
    .join('');
}
