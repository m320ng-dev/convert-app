import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_CLIPBOARD_COPY_ERROR_MESSAGE,
  copyTextToClipboard,
} from './clipboard-copy.ts';

test('클립보드 복사 유틸리티는 빈 값을 쓰지 않고 지정된 빈 값 메시지를 반환한다', async () => {
  let writeCount = 0;

  const result = await copyTextToClipboard('', {
    emptyMessage: '복사할 결과가 없습니다.',
    clipboard: {
      async writeText() {
        writeCount += 1;
      },
    },
  });

  assert.deepEqual(result, {
    ok: false,
    message: '복사할 결과가 없습니다.',
  });
  assert.equal(writeCount, 0);
});

test('클립보드 복사 유틸리티는 클립보드 API가 없으면 기본 오류 메시지를 반환한다', async () => {
  const result = await copyTextToClipboard('result', {
    emptyMessage: '복사할 결과가 없습니다.',
    clipboard: null,
  });

  assert.deepEqual(result, {
    ok: false,
    message: DEFAULT_CLIPBOARD_COPY_ERROR_MESSAGE,
  });
});

test('클립보드 복사 유틸리티는 쓰기 성공 시 성공 메시지를 반환한다', async () => {
  let copiedText = '';

  const result = await copyTextToClipboard('local result', {
    copiedMessage: '결과를 클립보드에 복사했습니다.',
    emptyMessage: '복사할 결과가 없습니다.',
    clipboard: {
      async writeText(text) {
        copiedText = text;
      },
    },
  });

  assert.deepEqual(result, {
    ok: true,
    message: '결과를 클립보드에 복사했습니다.',
  });
  assert.equal(copiedText, 'local result');
});

test('클립보드 복사 유틸리티는 쓰기 실패를 한글 오류 메시지로 정규화한다', async () => {
  const result = await copyTextToClipboard('result', {
    emptyMessage: '복사할 결과가 없습니다.',
    clipboard: {
      async writeText() {
        throw new Error('permission denied');
      },
    },
  });

  assert.deepEqual(result, {
    ok: false,
    message: DEFAULT_CLIPBOARD_COPY_ERROR_MESSAGE,
  });
});
