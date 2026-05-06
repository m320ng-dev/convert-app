import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  convertCsvJson,
  csvToJson,
  jsonToCsv,
} from './csv-json-converter.ts';
import { browserLocalToolCatalog } from './converters.ts';
import { getToolByPath, tools } from './tool-registry.ts';

const pagePath = resolve(import.meta.dirname, '../converters/csv-json-converter/page.tsx');
const convertersPath = resolve(import.meta.dirname, './converters.ts');

test('CSV를 헤더 기반 JSON 배열로 변환하고 따옴표와 쉼표를 보존한다', () => {
  const csv = [
    'name,role,note',
    'Lee,developer,"API, local only"',
    '"Kim ""K""",tester,"line one"',
  ].join('\n');

  assert.equal(csvToJson(csv), JSON.stringify([
    { name: 'Lee', role: 'developer', note: 'API, local only' },
    { name: 'Kim "K"', role: 'tester', note: 'line one' },
  ], null, 2));
});

test('JSON 객체 배열을 CSV로 변환하고 CSV 특수 문자를 이스케이프한다', () => {
  const json = JSON.stringify([
    { name: 'Lee', note: 'API, local only' },
    { name: 'Kim "K"', note: 'line\nbreak' },
  ]);

  assert.equal(jsonToCsv(json), [
    'name,note',
    'Lee,"API, local only"',
    '"Kim ""K""","line\nbreak"',
  ].join('\n'));
});

test('CSV/JSON 변환은 빈 입력과 잘못된 입력을 한국어 오류로 처리한다', () => {
  assert.throws(() => csvToJson(''), /CSV를 입력해주세요/);
  assert.throws(() => csvToJson('name,note\nLee'), /CSV 행의 열 개수가 헤더와 다릅니다/);
  assert.throws(() => jsonToCsv('{"name":"Lee"}'), /JSON 객체 배열을 입력해주세요/);
  assert.throws(() => jsonToCsv('[{"name": {"nested": true}}]'), /문자열, 숫자, 불리언, null 값만 CSV로 변환할 수 있습니다/);
  assert.equal(convertCsvJson('name\nLee', 'csv-to-json'), '[\n  {\n    "name": "Lee"\n  }\n]');
  assert.equal(convertCsvJson('[{"name":"Lee"}]', 'json-to-csv'), 'name\nLee');
});

test('CSV/JSON 변환 도구는 카탈로그, 라우트, 복사 메타데이터에 연결된다', () => {
  const catalogTool = browserLocalToolCatalog.find((tool) => tool.id === 'csv-json-converter');
  const listedTool = tools.find((tool) => tool.id === 'csv-json-converter');

  assert.ok(catalogTool, 'CSV/JSON 변환 카탈로그 항목이 있어야 합니다.');
  assert.ok(listedTool, 'CSV/JSON 변환 도구 목록 항목이 있어야 합니다.');
  assert.equal(catalogTool?.path, '/converters/csv-json-converter');
  assert.equal(catalogTool?.group, '데이터');
  assert.equal(catalogTool?.localOnly, true);
  assert.equal(catalogTool?.hasCopyButton, true);
  assert.equal(catalogTool?.inputSchema.fields.mode.required, true);
  assert.equal(catalogTool?.inputSchema.fields.value.required, true);
  assert.equal(catalogTool?.outputSchema.fields.result.required, true);
  assert.equal(catalogTool?.copyFormats.some((format) => format.primary), true);
  assert.match(catalogTool?.errorHandling ?? '', /CSV|JSON/);
  assert.equal(listedTool?.href, '/converters/csv-json-converter');
  assert.equal(getToolByPath('/converters/csv-json-converter')?.id, 'csv-json-converter');

  const source = readFileSync(convertersPath, 'utf8');
  assert.match(source, /id: 'csv-json-converter'/);
  assert.match(source, /path: '\/converters\/csv-json-converter'/);
});

test('CSV/JSON 변환 도구는 로컬 처리 실행 화면과 결과 복사 UI를 제공한다', () => {
  assert.equal(existsSync(pagePath), true, 'CSV/JSON 변환 페이지가 있어야 합니다.');

  const source = readFileSync(pagePath, 'utf8');

  assert.match(source, /<TextToolInput/);
  assert.match(source, /id="csv-json-converter-input"/);
  assert.match(source, /CSV 입력|JSON 입력/);
  assert.match(source, /외부 API 없이 브라우저에서만 처리됩니다\./);
  assert.match(source, /로컬 처리/);
  assert.match(source, /<ResultsPanel/);
  assert.match(source, /copyValue=\{copyValue\}/);
  assert.match(source, /copyEmptyMessage="복사할 CSV\/JSON 변환 결과가 없습니다\."/);
});
