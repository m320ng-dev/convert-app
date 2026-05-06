import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const hashPageSource = readFileSync(
  resolve(import.meta.dirname, '../converters/hash-generator/page.tsx'),
  'utf8',
);
const markdownPageSource = readFileSync(
  resolve(import.meta.dirname, '../converters/markdown-viewer/page.tsx'),
  'utf8',
);
const imagePageSource = readFileSync(
  resolve(import.meta.dirname, '../converters/image-to-base64/page.tsx'),
  'utf8',
);

test('파일 기반 도구는 로컬 파일 입력을 읽어 변환 결과를 화면 상태로 만든다', () => {
  for (const source of [hashPageSource, markdownPageSource, imagePageSource]) {
    assert.match(source, /FileToolInput/);
    assert.match(source, /onLocalFilesRead=\{[a-zA-Z0-9_]+\}/);
    assert.doesNotMatch(source, /fetch\(/);
    assert.doesNotMatch(source, /\/api\/convert/);
  }

  assert.match(hashPageSource, /readMode="text"/);
  assert.match(hashPageSource, /const handleLocalFilesRead = useCallback\(\(inputs: LocalFileInput\[\]\) =>/);
  assert.match(hashPageSource, /setInput\(combinedText\)/);
  assert.match(hashPageSource, /generateHashes\(combinedText/);
  assert.match(hashPageSource, /선택한 파일의 텍스트를 해시 입력으로 사용했습니다\./);
  assert.match(hashPageSource, /생성된 해시값/);
  assert.match(hashPageSource, /onLocalFileReadError=\{\(message\) => setFileError\(message\)\}/);

  assert.match(markdownPageSource, /readMode="text"/);
  assert.match(markdownPageSource, /const handleLocalFilesRead = \(inputs: LocalFileInput\[\]\) =>/);
  assert.match(markdownPageSource, /setMarkdown\(input\.text \?\? ''\)/);
  assert.match(markdownPageSource, /setLoadedFileName\(input\.name\)/);
  assert.match(markdownPageSource, /불러온 파일/);
  assert.match(markdownPageSource, /onLocalFileReadError=\{\(message\) => setFileError\(message\)\}/);

  assert.match(imagePageSource, /readMode="dataUrl"/);
  assert.match(imagePageSource, /base64: input\.dataUrl \?\? ''/);
  assert.match(imagePageSource, /변환된 파일/);
  assert.match(imagePageSource, /onLocalFileReadError=\{\(message\) => setError\(message\)\}/);
});
