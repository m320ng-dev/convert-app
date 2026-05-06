import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const componentPath = resolve(import.meta.dirname, '../components/file-tool-input.tsx');

test('파일 기반 도구 공통 업로드 입력 UI는 파일 선택과 선택 파일 목록 표시를 지원한다', () => {
  assert.equal(existsSync(componentPath), true, 'FileToolInput 컴포넌트가 있어야 합니다.');

  const source = readFileSync(componentPath, 'utf8');

  assert.match(source, /export function FileToolInput/);
  assert.match(source, /selectedFiles: File\[\]/);
  assert.match(source, /onFilesChange: \(files: File\[\]\) => void/);
  assert.match(source, /type="file"/);
  assert.match(source, /onChange=\{handleFileChange\}/);
  assert.match(source, /function handleFileChange/);
  assert.match(source, /Array\.from\(event\.currentTarget\.files \?\? \[\]\)/);
  assert.match(source, /onFilesChange\(files\)/);
  assert.match(source, /selectedFiles\.map\(\(file\) => \(/);
  assert.match(source, /\{file\.name\}/);
  assert.match(source, /formatFileSize\(file\.size\)/);
});

test('파일 기반 도구 공통 업로드 입력 UI는 입력 초기화를 지원한다', () => {
  const source = readFileSync(componentPath, 'utf8');

  assert.match(source, /inputRef = useRef<HTMLInputElement>\(null\)/);
  assert.match(source, /function handleReset/);
  assert.match(source, /inputRef\.current\.value = ''/);
  assert.match(source, /onFilesChange\(\[\]\)/);
  assert.match(source, /선택 초기화/);
  assert.match(source, /disabled=\{selectedFiles\.length === 0\}/);
});

test('파일 기반 도구는 서버 전송 없이 FileReader로 텍스트와 바이너리 입력을 만든다', () => {
  const utilityPath = resolve(import.meta.dirname, './local-file-input.ts');

  assert.equal(existsSync(utilityPath), true, '로컬 파일 변환 유틸이 있어야 합니다.');

  const utilitySource = readFileSync(utilityPath, 'utf8');
  const componentSource = readFileSync(componentPath, 'utf8');

  assert.match(utilitySource, /export type LocalFileReadMode = 'text' \| 'arrayBuffer' \| 'dataUrl'/);
  assert.match(utilitySource, /export interface LocalFileInput/);
  assert.match(utilitySource, /file: File/);
  assert.match(utilitySource, /text\?: string/);
  assert.match(utilitySource, /arrayBuffer\?: ArrayBuffer/);
  assert.match(utilitySource, /const reader = new FileReader\(\)/);
  assert.match(utilitySource, /reader\.readAsText\(file\)/);
  assert.match(utilitySource, /reader\.readAsArrayBuffer\(file\)/);
  assert.match(utilitySource, /reader\.readAsDataURL\(file\)/);
  assert.doesNotMatch(utilitySource, /fetch\(/);
  assert.doesNotMatch(utilitySource, /XMLHttpRequest/);

  assert.match(componentSource, /readMode\?: LocalFileReadMode/);
  assert.match(componentSource, /onLocalFilesRead\?: \(inputs: LocalFileInput\[\]\) => void/);
  assert.match(componentSource, /readLocalFileInputs\(files, readMode\)/);
  assert.match(componentSource, /onLocalFilesRead\(inputs\)/);
});

test('파일 기반 도구는 읽기 실패, 미지원 형식, 빈 파일을 명확한 오류로 전달한다', () => {
  const utilityPath = resolve(import.meta.dirname, './local-file-input.ts');
  const utilitySource = readFileSync(utilityPath, 'utf8');
  const componentSource = readFileSync(componentPath, 'utf8');

  assert.match(utilitySource, /export function isAcceptedLocalFile/);
  assert.match(utilitySource, /지원하지 않는 파일 형식입니다/);
  assert.match(utilitySource, /빈 파일은 처리할 수 없습니다/);
  assert.match(utilitySource, /new Error\('파일을 브라우저에서 읽는 중 오류가 발생했습니다\.'\)/);

  assert.match(componentSource, /getLocalFileValidationError\(files, accept\)/);
  assert.match(componentSource, /onLocalFileReadError\?\.\(validationError\)/);
  assert.match(componentSource, /error instanceof Error \? error\.message/);
  assert.match(componentSource, /onLocalFilesRead\(\[\]\)/);
});

test('이미지 파일 변환 도구는 공통 파일 업로드 입력 UI를 사용한다', () => {
  const source = readFileSync(
    resolve(import.meta.dirname, '../converters/image-to-base64/page.tsx'),
    'utf8',
  );

  assert.match(source, /FileToolInput/);
  assert.match(source, /selectedFiles=\{selectedFiles\}/);
  assert.match(source, /onFilesChange=\{handleSelectedFilesChange\}/);
  assert.match(source, /readMode="dataUrl"/);
  assert.match(source, /onLocalFilesRead=\{convertLocalInputs\}/);
});
