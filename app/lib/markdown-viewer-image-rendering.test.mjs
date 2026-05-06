import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pageSource = readFileSync(resolve(import.meta.dirname, '../converters/markdown-viewer/page.tsx'), 'utf8');

test('markdown viewer renders arbitrary markdown image URLs without next image host allowlists', () => {
  assert.doesNotMatch(pageSource, /from ['"]next\/image['"]/, '마크다운 이미지는 next/image 호스트 허용 목록에 의존하면 안 됩니다');
  assert.match(pageSource, /<img\b/, '마크다운 이미지 렌더러는 일반 img 요소를 사용해야 합니다');
  assert.match(pageSource, /src=\{typeof src === 'string' \? src : undefined\}/, '문자열 URL만 이미지 src로 전달해야 합니다');
});
