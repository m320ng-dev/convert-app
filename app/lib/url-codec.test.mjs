import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  decodeUrlComponent,
  decodeUrlFull,
  encodeUrlComponent,
  encodeUrlFull,
  parseUrlText,
} from './url-codec.ts';

test('URL 컴포넌트와 전체 URL을 브라우저 기본 인코딩 규칙으로 변환한다', () => {
  assert.equal(encodeUrlComponent('검색어=한글 값&tag=dev tools'), '%EA%B2%80%EC%83%89%EC%96%B4%3D%ED%95%9C%EA%B8%80%20%EA%B0%92%26tag%3Ddev%20tools');
  assert.equal(decodeUrlComponent('%EA%B2%80%EC%83%89%EC%96%B4%3D%ED%95%9C%EA%B8%80%20%EA%B0%92%26tag%3Ddev%20tools'), '검색어=한글 값&tag=dev tools');
  assert.equal(encodeUrlFull('https://example.com/search?q=한글 값&tag=dev tools'), 'https://example.com/search?q=%ED%95%9C%EA%B8%80%20%EA%B0%92&tag=dev%20tools');
  assert.equal(decodeUrlFull('https://example.com/search?q=%ED%95%9C%EA%B8%80%20%EA%B0%92&tag=dev%20tools'), 'https://example.com/search?q=한글 값&tag=dev tools');
});

test('잘못된 퍼센트 인코딩은 한국어 기본 오류로 거부한다', () => {
  assert.throws(
    () => decodeUrlComponent('%E0%A4%A'),
    /URL 디코딩에 실패했습니다/,
  );
});

test('URL 파싱 모드는 URL 구성요소와 쿼리 파라미터를 JSON으로 반환한다', () => {
  const parsed = JSON.parse(parseUrlText('https://user:pass@example.com:8443/search/items?q=한글 값&tag=dev&tag=api#section'));

  assert.deepEqual(parsed, {
    href: 'https://user:pass@example.com:8443/search/items?q=%ED%95%9C%EA%B8%80%20%EA%B0%92&tag=dev&tag=api#section',
    protocol: 'https:',
    username: 'user',
    password: 'pass',
    origin: 'https://example.com:8443',
    host: 'example.com:8443',
    hostname: 'example.com',
    port: '8443',
    pathname: '/search/items',
    search: '?q=%ED%95%9C%EA%B8%80%20%EA%B0%92&tag=dev&tag=api',
    hash: '#section',
    query: {
      q: '한글 값',
      tag: ['dev', 'api'],
    },
  });
});

test('잘못된 URL 파싱 입력은 한국어 기본 오류로 거부한다', () => {
  assert.throws(
    () => parseUrlText('example .com/path'),
    /URL 파싱에 실패했습니다/,
  );
});

test('URL 인코딩 디코딩 도구가 라우트와 카탈로그에 등록된다', () => {
  const convertersSource = readFileSync(resolve(import.meta.dirname, './converters.ts'), 'utf8');
  const pageSource = readFileSync(resolve(import.meta.dirname, '../converters/url-encoder-decoder/page.tsx'), 'utf8');

  assert.match(convertersSource, /id: 'url-encoder-decoder'/);
  assert.match(convertersSource, /path: '\/converters\/url-encoder-decoder'/);
  assert.match(convertersSource, /group: 'API'/);

  assert.match(pageSource, /ResultsPanel/);
  assert.match(pageSource, /copyValue=\{output\}/);
  assert.match(pageSource, /copyEmptyMessage="복사할 URL 변환 결과가 없습니다\."/);
  assert.match(pageSource, /외부 API 없이 브라우저에서만 처리됩니다\./);
  assert.match(pageSource, /URL 파싱/);
  assert.match(convertersSource, /'parse'/);
});
