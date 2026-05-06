import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(
  resolve(import.meta.dirname, '../components/copy-result-action.tsx'),
  'utf8',
);
const copyButtonPath = resolve(import.meta.dirname, '../components/copy-button.tsx');
const clipboardCopyPath = resolve(import.meta.dirname, './clipboard-copy.ts');

test('shared copy result action centralizes clipboard behavior and Korean feedback', () => {
  assert.match(source, /type CopyValue = string \| null \| undefined \| \(\(\) => string \| null \| undefined\)/);
  assert.match(source, /const copyToClipboard = async \(\) =>/);
  assert.match(source, /import \{ copyTextToClipboard \} from '@\/app\/lib\/clipboard-copy';/);
  assert.match(source, /const result = await copyTextToClipboard\(resolvedValue, \{/);
  assert.match(source, /copiedMessage,\s+emptyMessage,/);
  assert.match(source, /tone: result\.ok \? 'success' : 'error'/);
  assert.match(source, /message: result\.message/);
  assert.match(source, /'status'/);
  assert.match(source, /aria-live="polite"/);
});

test('클립보드 복사 유틸리티는 클립보드 API 부재와 쓰기 실패를 한글 오류로 처리한다', () => {
  assert.equal(existsSync(clipboardCopyPath), true, '공통 클립보드 복사 유틸리티 파일이 있어야 합니다.');

  const clipboardSource = readFileSync(clipboardCopyPath, 'utf8');

  assert.match(clipboardSource, /export async function copyTextToClipboard/);
  assert.match(clipboardSource, /DEFAULT_CLIPBOARD_COPY_ERROR_MESSAGE = '클립보드에 복사하지 못했습니다\.'/);
  assert.match(
    clipboardSource,
    /if \(!clipboard\?\.writeText\)/,
    '클립보드 API가 없을 때 writeText 호출 전에 기본 오류 메시지를 반환해야 합니다.',
  );
  assert.match(clipboardSource, /await clipboard\.writeText\(value\)/);
  assert.match(clipboardSource, /catch \{/);
});

test('공용 복사 액션은 사용자에게 성공과 실패 상태를 구분해 표시한다', () => {
  assert.match(
    source,
    /type CopyStatus = \{ tone: 'success' \| 'error'; message: string \}/,
    '복사 결과는 성공과 실패 상태를 구분해야 합니다.',
  );
  assert.match(source, /tone: result\.ok \? 'success' : 'error'/);
  assert.match(source, /message: result\.message/);
  assert.match(source, /role=\{status\.tone === 'error' \? 'alert' : 'status'\}/);
  assert.match(source, /status\.tone === 'success'/);
  assert.match(source, /text-emerald-700/);
  assert.match(source, /text-red-700/);
});

test('공용 복사 액션은 복사 버튼과 상태 피드백을 접근성 속성으로 연결한다', () => {
  assert.match(source, /import \{ useId, useState \} from 'react';/);
  assert.match(source, /const feedbackId = useId\(\)/);
  assert.match(source, /ariaDescribedBy=\{status \? feedbackId : undefined\}/);
  assert.match(source, /id=\{feedbackId\}/);
});

test('공용 복사 액션은 정적 결과가 없으면 버튼을 비활성화하고 동적 값은 오류 메시지로 처리한다', () => {
  assert.match(
    source,
    /const hasStaticEmptyValue = typeof value !== 'function' && !value;/,
    '정적 복사 값이 없으면 버튼을 비활성화할 수 있어야 합니다.',
  );
  assert.match(
    source,
    /const isCopyDisabled = disabled \|\| hasStaticEmptyValue;/,
    '명시적 비활성화와 정적 빈 결과 상태를 함께 반영해야 합니다.',
  );
  assert.match(
    source,
    /disabled=\{isCopyDisabled\}/,
    '계산된 비활성화 상태를 공통 복사 버튼에 전달해야 합니다.',
  );
  assert.match(
    source,
    /const resolvedValue = typeof value === 'function' \? value\(\) : value;/,
    '동적 복사 값은 클릭 시 평가한 뒤 빈 값 오류 메시지를 표시해야 합니다.',
  );
});

test('공통 복사 버튼 컴포넌트는 버튼 스타일과 접근성 속성을 중앙화한다', () => {
  assert.equal(existsSync(copyButtonPath), true, '공통 복사 버튼 컴포넌트 파일이 있어야 합니다.');

  const buttonSource = readFileSync(copyButtonPath, 'utf8');

  assert.match(buttonSource, /export function CopyButton/);
  assert.match(buttonSource, /type="button"/);
  assert.match(buttonSource, /aria-label=\{ariaLabel \?\? label\}/);
  assert.match(buttonSource, /ariaDescribedBy\?: string/);
  assert.match(buttonSource, /aria-describedby=\{ariaDescribedBy\}/);
  assert.match(buttonSource, /app-button app-button-secondary/);
  assert.match(buttonSource, /disabled=\{disabled\}/);
  assert.match(source, /import \{ CopyButton \} from '@\/app\/components\/copy-button';/);
  assert.match(source, /<CopyButton/);
});

test('공용 포맷 결과 블록의 복사 버튼은 결과 영역 제목을 반영한 접근성 라벨을 제공한다', () => {
  const resultsPanelSource = readFileSync(
    resolve(import.meta.dirname, '../components/results-panel.tsx'),
    'utf8',
  );

  assert.match(
    resultsPanelSource,
    /ariaLabel=\{`\$\{title\} 복사`\}/,
    'Header, Payload 같은 세부 결과 복사 버튼은 표시 텍스트 "복사"만 접근성 이름으로 쓰지 않아야 합니다.',
  );
});
