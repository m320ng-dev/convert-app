import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  convertHtmlEntityText,
  decodeHtmlEntities,
  encodeHtmlEntities,
} from './html-entity-codec.ts';

test('HTML 특수 문자를 엔티티로 이스케이프하고 원문으로 언이스케이프한다', () => {
  const source = '<button title="Tom & Jerry">\'클릭\'</button>';
  const escaped = '&lt;button title=&quot;Tom &amp; Jerry&quot;&gt;&#39;클릭&#39;&lt;/button&gt;';

  assert.equal(encodeHtmlEntities(source), escaped);
  assert.equal(decodeHtmlEntities(escaped), source);
});

test('숫자형 HTML 엔티티와 자주 쓰는 이름 엔티티를 디코딩한다', () => {
  assert.equal(
    decodeHtmlEntities('&lt;div&gt;&#xD55C;&#44544; &nbsp; &amp; copy&#169;&lt;/div&gt;'),
    '<div>한글   & copy©</div>',
  );
});

test('HTML 엔티티 변환 모드를 단일 진입점에서 처리한다', () => {
  assert.equal(convertHtmlEntityText('<main>&</main>', 'escape'), '&lt;main&gt;&amp;&lt;/main&gt;');
  assert.equal(convertHtmlEntityText('&lt;main&gt;&amp;&lt;/main&gt;', 'unescape'), '<main>&</main>');
});

test('HTML 엔티티 도구가 라우트와 카탈로그에 등록된다', () => {
  const convertersSource = readFileSync(resolve(import.meta.dirname, './converters.ts'), 'utf8');
  const pageSource = readFileSync(resolve(import.meta.dirname, '../converters/html-entity-escaper/page.tsx'), 'utf8');

  assert.match(convertersSource, /id: 'html-entity-escaper'/);
  assert.match(convertersSource, /path: '\/converters\/html-entity-escaper'/);
  assert.match(convertersSource, /group: '텍스트'/);
  assert.match(convertersSource, /priority: 13/);

  assert.match(pageSource, /ResultsPanel/);
  assert.match(pageSource, /copyValue=\{output\}/);
  assert.match(pageSource, /copyEmptyMessage="복사할 HTML 엔티티 변환 결과가 없습니다\."/);
  assert.match(pageSource, /외부 API 없이 브라우저에서만 처리됩니다\./);
});
