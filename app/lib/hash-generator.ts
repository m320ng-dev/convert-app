import CryptoJS from 'crypto-js';

export type HashAlgorithmId = 'md5' | 'sha1' | 'sha256' | 'sha512' | 'sha3' | 'ripemd160';

export interface HashAlgorithmOption {
  id: HashAlgorithmId;
  name: string;
  hash: (text: string) => CryptoJS.lib.WordArray;
}

export interface HashResult {
  algorithm: string;
  hash: string;
}

export interface HashVerificationInput {
  text: string;
  algorithm: HashAlgorithmId;
  expectedHash: string;
}

export interface HashVerificationResult {
  algorithm: string;
  expectedHash: string;
  actualHash: string;
  isMatch: boolean;
  message: string;
}

export const HASH_ALGORITHMS: HashAlgorithmOption[] = [
  { id: 'md5', name: 'MD5', hash: CryptoJS.MD5 },
  { id: 'sha1', name: 'SHA-1', hash: CryptoJS.SHA1 },
  { id: 'sha256', name: 'SHA-256', hash: CryptoJS.SHA256 },
  { id: 'sha512', name: 'SHA-512', hash: CryptoJS.SHA512 },
  { id: 'sha3', name: 'SHA-3', hash: CryptoJS.SHA3 },
  { id: 'ripemd160', name: 'RIPEMD160', hash: CryptoJS.RIPEMD160 },
];

export function generateHashResults(text: string, algorithmIds: readonly string[]): HashResult[] {
  if (!text.trim()) {
    throw new Error('해시를 생성할 텍스트를 입력해주세요.');
  }

  if (algorithmIds.length === 0) {
    throw new Error('하나 이상의 해시 알고리즘을 선택해주세요.');
  }

  return algorithmIds.map((algorithmId) => {
    const algorithm = findHashAlgorithm(algorithmId);

    return {
      algorithm: algorithm.name,
      hash: algorithm.hash(text).toString(),
    };
  });
}

export function verifyHash({
  text,
  algorithm,
  expectedHash,
}: HashVerificationInput): HashVerificationResult {
  if (!expectedHash.trim()) {
    throw new Error('검증할 해시값을 입력해주세요.');
  }

  const [result] = generateHashResults(text, [algorithm]);
  const normalizedExpectedHash = normalizeHash(expectedHash);
  const isMatch = result.hash === normalizedExpectedHash;

  return {
    algorithm: result.algorithm,
    expectedHash: normalizedExpectedHash,
    actualHash: result.hash,
    isMatch,
    message: isMatch
      ? `${result.algorithm} 해시가 일치합니다.`
      : `${result.algorithm} 해시가 일치하지 않습니다.`,
  };
}

export function formatHashResultsForCopy(
  results: readonly HashResult[],
  verification: HashVerificationResult | null = null,
) {
  const resultLines = results.map((result) => `${result.algorithm}: ${result.hash}`);

  if (!verification) {
    return resultLines.join('\n');
  }

  return [
    ...resultLines,
    '',
    `검증 결과: ${verification.message}`,
    `예상 해시: ${verification.expectedHash}`,
    `계산 해시: ${verification.actualHash}`,
  ].join('\n');
}

function findHashAlgorithm(algorithmId: string) {
  const algorithm = HASH_ALGORITHMS.find((option) => option.id === algorithmId);

  if (!algorithm) {
    throw new Error('지원하지 않는 해시 알고리즘입니다.');
  }

  return algorithm;
}

function normalizeHash(hash: string) {
  return hash.trim().toLowerCase();
}
