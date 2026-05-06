import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pagePath = resolve(import.meta.dirname, '../converters/random-token-generator/page.tsx');

test('토큰 생성 도구 화면은 길이와 문자 종류 옵션을 제공한다', () => {
  assert.equal(existsSync(pagePath), true, '토큰 생성 도구 페이지가 있어야 합니다.');

  const source = readFileSync(pagePath, 'utf8');

  assert.match(source, /id="token-length"/, '길이 입력을 제공해야 합니다.');
  assert.match(source, /setLength/, '길이 상태를 변경할 수 있어야 합니다.');
  assert.match(source, /characterSetOptions/, '문자 종류 옵션 목록을 제공해야 합니다.');
  assert.match(source, /lowercase/, '소문자 옵션을 제공해야 합니다.');
  assert.match(source, /uppercase/, '대문자 옵션을 제공해야 합니다.');
  assert.match(source, /numbers/, '숫자 옵션을 제공해야 합니다.');
  assert.match(source, /symbols/, '기호 옵션을 제공해야 합니다.');
});

test('토큰 생성 도구 화면은 용도 프리셋과 상세 입력 옵션을 제공한다', () => {
  assert.equal(existsSync(pagePath), true, '토큰 생성 도구 페이지가 있어야 합니다.');

  const source = readFileSync(pagePath, 'utf8');

  assert.match(source, /tokenPresetOptions/, '토큰 용도 프리셋 목록을 제공해야 합니다.');
  assert.match(source, /name="token-preset"/, '토큰 용도 프리셋을 선택할 수 있어야 합니다.');
  assert.match(source, /API 키/, 'API 키 프리셋을 제공해야 합니다.');
  assert.match(source, /세션 토큰/, '세션 토큰 프리셋을 제공해야 합니다.');
  assert.match(source, /숫자 PIN/, '숫자 PIN 프리셋을 제공해야 합니다.');
  assert.match(source, /id="token-quantity"/, '생성 개수를 입력할 수 있어야 합니다.');
  assert.match(source, /id="token-exclude"/, '제외할 문자를 입력할 수 있어야 합니다.');
  assert.match(source, /id="token-prefix"/, '접두사를 입력할 수 있어야 합니다.');
  assert.match(source, /id="token-suffix"/, '접미사를 입력할 수 있어야 합니다.');
});

test('토큰 생성 도구 화면은 생성된 토큰을 클립보드에 복사할 수 있다', () => {
  assert.equal(existsSync(pagePath), true, '토큰 생성 도구 페이지가 있어야 합니다.');

  const source = readFileSync(pagePath, 'utf8');

  assert.match(source, /<CopyResultAction/, '공용 복사 액션을 사용해야 합니다.');
  assert.match(source, /copyValue=\{primaryCopyValue\}/, '생성된 토큰 전체 결과를 복사할 수 있어야 합니다.');
  assert.match(source, /copyAriaLabel="생성된 토큰 줄바꿈 복사"/, '전체 복사 버튼의 접근성 라벨을 제공해야 합니다.');
  assert.match(source, /copyCopiedMessage="생성된 토큰을 클립보드에 복사했습니다\."/);
  assert.match(source, /value=\{token\}/, '개별 생성 토큰도 직접 복사할 수 있어야 합니다.');
  assert.match(source, /copiedMessage=\{`\$\{index \+ 1\}번 토큰을 클립보드에 복사했습니다\.`\}/);
  assert.match(source, /emptyMessage="복사할 토큰이 없습니다\."/);
});
