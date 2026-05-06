import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const componentPath = resolve(import.meta.dirname, '../components/text-tool-input.tsx');

test('텍스트 기반 도구 공통 입력 UI는 직접 입력과 붙여넣기 값을 상태 갱신 콜백에 저장한다', () => {
  assert.equal(existsSync(componentPath), true, 'TextToolInput 컴포넌트가 있어야 합니다.');

  const source = readFileSync(componentPath, 'utf8');

  assert.match(source, /export function TextToolInput/);
  assert.match(source, /value: string/);
  assert.match(source, /onValueChange: \(value: string\) => void/);
  assert.match(source, /onChange=\{handleChange\}/);
  assert.match(source, /onPaste=\{handlePaste\}/);
  assert.match(source, /function handleChange/);
  assert.match(source, /onValueChange\(event\.currentTarget\.value\)/);
  assert.match(source, /function handlePaste/);
  assert.match(source, /const target = event\.currentTarget/);
  assert.match(source, /window\.setTimeout\(\(\) => onValueChange\(target\.value\), 0\)/);
  assert.match(source, /spellCheck=\{false\}/);
});

test('텍스트 기반 도구 공통 입력 UI는 처리 전 입력 초기화를 지원한다', () => {
  const source = readFileSync(componentPath, 'utf8');

  assert.match(source, /resetLabel\?: string/);
  assert.match(source, /resetLabel = '입력 초기화'/);
  assert.match(source, /function handleReset/);
  assert.match(source, /onValueChange\(''\)/);
  assert.match(source, /disabled=\{value\.length === 0\}/);
  assert.match(source, />\s*\{resetLabel\}\s*<\/button>/);
});

test('텍스트 기반 도구 공통 입력 UI는 예시 입력 적용을 지원한다', () => {
  const source = readFileSync(componentPath, 'utf8');

  assert.match(source, /exampleValue\?: string/);
  assert.match(source, /exampleLabel = '예시 입력 적용'/);
  assert.match(source, /function handleApplyExample/);
  assert.match(source, /onValueChange\(exampleValue\)/);
  assert.match(source, />\s*\{exampleLabel\}\s*<\/button>/);
});

test('텍스트 기반 도구 공통 입력 UI는 클립보드에서 입력을 붙여넣을 수 있다', () => {
  const source = readFileSync(componentPath, 'utf8');

  assert.match(source, /pasteFromClipboardLabel\?: string/);
  assert.match(source, /pasteFromClipboardLabel = '클립보드 붙여넣기'/);
  assert.match(source, /function handlePasteFromClipboard/);
  assert.match(source, /navigator\.clipboard\?\.readText/);
  assert.match(source, /const clipboardText = await navigator\.clipboard\.readText\(\)/);
  assert.match(source, /onValueChange\(clipboardText\)/);
  assert.match(source, /클립보드에서 텍스트를 가져오지 못했습니다\./);
  assert.match(source, />\s*\{pasteFromClipboardLabel\}\s*<\/button>/);
});

test('텍스트 기반 도구 공통 입력 UI는 현재 입력값을 클립보드로 복사할 수 있다', () => {
  const source = readFileSync(componentPath, 'utf8');

  assert.match(source, /copyInputLabel\?: string/);
  assert.match(source, /copyInputLabel = '입력값 복사'/);
  assert.match(source, /function handleCopyInputToClipboard/);
  assert.match(source, /navigator\.clipboard\?\.writeText/);
  assert.match(source, /await navigator\.clipboard\.writeText\(value\)/);
  assert.match(source, /복사할 입력값이 없습니다\./);
  assert.match(source, /입력값을 클립보드에 복사했습니다\./);
  assert.match(source, />\s*\{copyInputLabel\}\s*<\/button>/);
});

test('핵심 텍스트 기반 신규 도구는 공통 입력 UI를 사용한다', () => {
  const pagePaths = [
    '../converters/string-case-converter/page.tsx',
    '../converters/regex-tester/page.tsx',
  ];

  for (const relativePath of pagePaths) {
    const source = readFileSync(resolve(import.meta.dirname, relativePath), 'utf8');

    assert.match(
      source,
      /TextToolInput/,
      `${relativePath}에서 TextToolInput을 사용해야 합니다.`,
    );
  }
});
