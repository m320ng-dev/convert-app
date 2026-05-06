import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readSource(relativePath) {
  return readFileSync(resolve(import.meta.dirname, relativePath), 'utf8');
}

test('HTML Markdown 변환 결과 영역은 공용 복사 액션으로 결과 텍스트를 복사한다', () => {
  const source = readSource('../converters/html-to-markdown/page.tsx');

  assert.match(source, /import \{ CopyResultAction \} from '@\/app\/components\/copy-result-action';/);
  assert.match(source, /<CopyResultAction[\s\S]*value=\{markdown\}/);
  assert.match(source, /ariaLabel="Markdown 변환 결과 복사"/);
  assert.match(source, /copiedMessage="Markdown 변환 결과를 클립보드에 복사했습니다\."/);
  assert.match(source, /emptyMessage="복사할 Markdown 변환 결과가 없습니다\."/);
  assert.match(source, /disabled=\{!markdown\}/);
});

test('Markdown 뷰어 결과 영역은 공용 복사 액션으로 미리보기 원문을 복사한다', () => {
  const source = readSource('../converters/markdown-viewer/page.tsx');

  assert.match(source, /import \{ CopyResultAction \} from '@\/app\/components\/copy-result-action';/);
  assert.match(source, /<CopyResultAction[\s\S]*value=\{markdown\}/);
  assert.match(source, /label="원문 복사"/);
  assert.match(source, /ariaLabel="Markdown 미리보기 원문 복사"/);
  assert.match(source, /copiedMessage="Markdown 원문을 클립보드에 복사했습니다\."/);
  assert.match(source, /emptyMessage="복사할 Markdown 원문이 없습니다\."/);
  assert.match(source, /disabled=\{!markdown\.trim\(\)\}/);
});

test('JavaScript 코드 정리 결과 영역은 공용 복사 액션으로 정리된 코드를 복사한다', () => {
  const source = readSource('../converters/js-beautifier/page.tsx');

  assert.match(source, /import \{ CopyResultAction \} from '@\/app\/components\/copy-result-action';/);
  assert.match(source, /<CopyResultAction[\s\S]*value=\{output\}/);
  assert.match(source, /label="결과 복사"/);
  assert.match(source, /ariaLabel="JavaScript 정리 결과 복사"/);
  assert.match(source, /copiedMessage="정리된 JavaScript 코드를 클립보드에 복사했습니다\."/);
  assert.match(source, /emptyMessage="복사할 JavaScript 정리 결과가 없습니다\."/);
  assert.match(source, /disabled=\{!output\}/);
  assert.doesNotMatch(source, /navigator\.clipboard\.writeText\(output\)/);
});
