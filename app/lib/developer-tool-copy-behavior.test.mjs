import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readSource(relativePath) {
  return readFileSync(resolve(import.meta.dirname, relativePath), 'utf8');
}

function assertCopyContract(source, contractName, patterns) {
  for (const [description, pattern] of Object.entries(patterns)) {
    assert.match(source, pattern, `${contractName} should ${description}`);
  }
}

test('random token generator provides copy behavior for full result sets and individual tokens', () => {
  const source = readSource('../converters/random-token-generator/page.tsx');

  assertCopyContract(source, 'random token result panel', {
    'copy the primary newline payload': /copyValue=\{primaryCopyValue\}/,
    'label the primary copy action as newline copy': /copyLabel="줄바꿈 복사"/,
    'announce newline copy success in Korean': /copyCopiedMessage="줄바꿈 형식으로 복사했습니다\."/,
    'show a Korean empty-result copy error': /copyEmptyMessage="복사할 토큰이 없습니다\."/,
  });

  assertCopyContract(source, 'random token alternate format actions', {
    'copy JSON, .env, and CSV payloads through formatter callbacks':
      /value=\{\(\) => formatRandomTokenResults\(tokens, action\.format\)\}/,
    'disable alternate copy actions before tokens exist': /disabled=\{tokens\.length === 0\}/,
    'use distinct accessible labels for format copy actions':
      /ariaLabel=\{`\$\{action\.label\} 결과 세트 복사`\}/,
  });

  assertCopyContract(source, 'random token item copy action', {
    'copy each generated token directly': /value=\{token\}/,
    'use distinct accessible labels per token': /ariaLabel=\{`\$\{index \+ 1\}번 토큰 복사`\}/,
    'announce item copy success in Korean': /copiedMessage=\{`\$\{index \+ 1\}번 토큰을 복사했습니다\.`\}/,
  });
});

test('JWT decoder and generator provide copy behavior for generated and decoded results', () => {
  const source = readSource('../converters/jwt-decoder/page.tsx');

  assertCopyContract(source, 'JWT generator copy action', {
    'copy only the generated token': /value=\{generatedToken\}/,
    'announce generated token copy success in Korean': /copiedMessage="생성된 JWT를 복사했습니다\."/,
    'show a Korean empty generated-result error': /emptyMessage="복사할 생성 결과가 없습니다\."/,
    'disable generated copy before a token exists': /disabled=\{!generatedToken\}/,
  });

  assertCopyContract(source, 'JWT decoded result panel', {
    'copy the formatted full decoded payload': /copyValue=\{decodedCopyValue\}/,
    'label full decoded copy clearly': /copyLabel="전체 복사"/,
    'announce full decoded copy success in Korean': /copyCopiedMessage="전체 결과를 복사했습니다\."/,
    'show a Korean empty decoded-result error': /copyEmptyMessage="복사할 디코딩 결과가 없습니다\."/,
  });

  assertCopyContract(source, 'JWT detail result blocks', {
    'copy header JSON': /copiedMessage="Header JSON을 복사했습니다\."/,
    'copy payload JSON': /copiedMessage="Payload JSON을 복사했습니다\."/,
    'copy signature segment': /copiedMessage="Signature segment를 복사했습니다\."/,
    'copy common claims without requiring raw token persistence':
      /copiedMessage="공통 클레임 정보를 복사했습니다\."/,
  });
});

test('request converters provide copy behavior for input, options, and converted output', () => {
  const source = readSource('../components/request-converter-workbench.tsx');

  assertCopyContract(source, 'request converter input copy action', {
    'copy the current conversion input': /value=\{input\}/,
    'label input copy clearly': /label="입력 복사"/,
    'announce input copy success in Korean': /copiedMessage="변환 입력을 복사했습니다\."/,
    'show a Korean empty input error': /emptyMessage="복사할 변환 입력이 없습니다\."/,
  });

  assertCopyContract(source, 'request converter option copy action', {
    'copy a generated options summary': /value=\{getOptionsCopyValue\}/,
    'label option copy clearly': /label="옵션 복사"/,
    'announce option copy success in Korean': /copiedMessage="변환 옵션을 복사했습니다\."/,
    'state that sensitive authentication values are omitted': /민감한 인증 값: 복사하지 않음/,
  });

  assertCopyContract(source, 'request converter result copy action', {
    'copy the converted output from the results panel': /copyValue=\{output\}/,
    'label result copy clearly': /copyLabel="결과 복사"/,
    'announce result copy success with the active output label':
      /copyCopiedMessage=\{`\$\{panelState\.outputLabel\}를 복사했습니다\.`\}/,
    'show a Korean empty converted-result error': /copyEmptyMessage="복사할 변환 결과가 없습니다\."/,
  });
});

test('regex tester provides copy behavior for formatted match results', () => {
  const source = readSource('../converters/regex-tester/page.tsx');

  assertCopyContract(source, 'regex tester result panel', {
    'format match results for copy': /function formatResultForCopy\(result: RegexTestResult\): string/,
    'include flags in the copied payload': /`flags: \$\{result\.flags \|\| '\(none\)'\}`/,
    'include match count in the copied payload': /`total matches: \$\{result\.matchCount\}`/,
    'copy the formatted result value': /copyValue=\{resultCopyValue\}/,
    'announce regex copy success in Korean': /copyCopiedMessage="테스트 결과를 클립보드에 복사했습니다\."/,
    'show a Korean empty regex-result error': /copyEmptyMessage="복사할 테스트 결과가 없습니다\."/,
  });
});

test('.env validator provides copy behavior without exposing sensitive values', () => {
  const source = readSource('../converters/env-validator/page.tsx');

  assertCopyContract(source, '.env validator result copy actions', {
    'derive copy text from sanitized validation results': /formatEnvValidationResult\(result\)/,
    'copy the hidden-value summary from the input side action': /value=\{hiddenValueSummary\}/,
    'copy the hidden-value summary from the result panel': /copyValue=\{hiddenValueSummary\}/,
    'copy the hidden-value summary from the preview action': /<code className="font-mono">\{hiddenValueSummary\}<\/code>/,
    'announce validation copy success in Korean': /검사 결과를 클립보드에 복사했습니다\./,
    'show a Korean empty validation-result error': /복사할 검사 결과가 없습니다\./,
    'explain that actual sensitive values are not included': /실제 값이 포함되지 않습니다/,
  });
});
