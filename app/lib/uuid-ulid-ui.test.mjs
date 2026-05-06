import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { converters } from './converters.ts';

const pageSource = readFileSync(
  resolve(import.meta.dirname, '../converters/uuid-ulid-generator/page.tsx'),
  'utf8',
);

test('UUID/ULID 생성 도구는 /converters 구조와 유틸리티 분류에 등록된다', () => {
  const tool = converters.find((converter) => converter.id === 'uuid-ulid-generator');

  assert.equal(tool?.path, '/converters/uuid-ulid-generator');
  assert.equal(tool?.group, '유틸리티');
  assert.match(tool?.title ?? '', /UUID\/ULID/);
});

test('UUID/ULID 페이지는 로컬 생성 입력, 결과, 복사, 오류 처리를 제공한다', () => {
  assert.match(pageSource, /generateUuidUlidResults/);
  assert.match(pageSource, /ResultsPanel/);
  assert.match(pageSource, /copyValue=\{copyValue\}/);
  assert.match(pageSource, /copyEmptyMessage="복사할 식별자가 없습니다\."/);
  assert.match(pageSource, /<ToolValidationMessage message=\{error\}/);
  assert.match(pageSource, /브라우저 crypto API/);
});

test('UUID/ULID 페이지는 UUID 검증 입력, 결과, 복사, 오류 처리를 제공한다', () => {
  assert.match(pageSource, /validateUuid/);
  assert.match(pageSource, /검증할 UUID/);
  assert.match(pageSource, /handleValidateUuid/);
  assert.match(pageSource, /validationCopyValue/);
  assert.match(pageSource, /copyEmptyMessage="복사할 UUID 검증 결과가 없습니다\."/);
});
