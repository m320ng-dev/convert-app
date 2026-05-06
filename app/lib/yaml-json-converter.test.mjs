import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  convertYamlJson,
  jsonToYaml,
  yamlToJson,
} from './yaml-json-converter.ts';
import { browserLocalToolCatalog } from './converters.ts';
import { getToolByPath, tools } from './tool-registry.ts';

const pagePath = resolve(import.meta.dirname, '../converters/yaml-json-converter/page.tsx');
const convertersPath = resolve(import.meta.dirname, './converters.ts');

test('YAML 객체와 배열을 정렬된 JSON으로 변환한다', () => {
  const yaml = [
    'name: convertapp',
    'localOnly: true',
    'ports:',
    '  - 3000',
    '  - 3001',
    'tags:',
    '  - api',
    '  - utility',
  ].join('\n');

  assert.equal(yamlToJson(yaml), JSON.stringify({
    name: 'convertapp',
    localOnly: true,
    ports: [3000, 3001],
    tags: ['api', 'utility'],
  }, null, 2));
});

test('JSON 값을 읽기 쉬운 YAML로 변환한다', () => {
  const json = JSON.stringify({
    name: 'convertapp',
    localOnly: true,
    ports: [3000, 3001],
    meta: { category: 'API' },
  });

  assert.equal(jsonToYaml(json), [
    'name: convertapp',
    'localOnly: true',
    'ports:',
    '  - 3000',
    '  - 3001',
    'meta:',
    '  category: API',
  ].join('\n'));
});

test('YAML/JSON 변환은 빈 입력과 잘못된 입력을 한국어 오류로 처리한다', () => {
  assert.throws(() => yamlToJson(''), /YAML을 입력해주세요/);
  assert.throws(() => yamlToJson('name: convertapp\n  broken: true'), /YAML 들여쓰기를 확인해주세요/);
  assert.throws(() => jsonToYaml(''), /JSON을 입력해주세요/);
  assert.throws(() => jsonToYaml('{broken'), /유효한 JSON 형식이 아닙니다/);
  assert.equal(convertYamlJson('name: convertapp', 'yaml-to-json'), '{\n  "name": "convertapp"\n}');
  assert.equal(convertYamlJson('{"name":"convertapp"}', 'json-to-yaml'), 'name: convertapp');
});

test('YAML/JSON 변환 도구는 카탈로그, 라우트, 복사 메타데이터에 연결된다', () => {
  const catalogTool = browserLocalToolCatalog.find((tool) => tool.id === 'yaml-json-converter');
  const listedTool = tools.find((tool) => tool.id === 'yaml-json-converter');

  assert.ok(catalogTool, 'YAML/JSON 변환 카탈로그 항목이 있어야 합니다.');
  assert.ok(listedTool, 'YAML/JSON 변환 도구 목록 항목이 있어야 합니다.');
  assert.equal(catalogTool?.path, '/converters/yaml-json-converter');
  assert.equal(catalogTool?.group, '데이터');
  assert.equal(catalogTool?.localOnly, true);
  assert.equal(catalogTool?.hasCopyButton, true);
  assert.equal(catalogTool?.inputSchema.fields.mode.required, true);
  assert.equal(catalogTool?.inputSchema.fields.value.required, true);
  assert.equal(catalogTool?.outputSchema.fields.result.required, true);
  assert.equal(catalogTool?.copyFormats.some((format) => format.primary), true);
  assert.match(catalogTool?.errorHandling ?? '', /YAML|JSON/);
  assert.equal(listedTool?.href, '/converters/yaml-json-converter');
  assert.equal(getToolByPath('/converters/yaml-json-converter')?.id, 'yaml-json-converter');

  const source = readFileSync(convertersPath, 'utf8');
  assert.match(source, /id: 'yaml-json-converter'/);
  assert.match(source, /path: '\/converters\/yaml-json-converter'/);
});

test('YAML/JSON 변환 도구는 로컬 처리 실행 화면과 결과 복사 UI를 제공한다', () => {
  assert.equal(existsSync(pagePath), true, 'YAML/JSON 변환 페이지가 있어야 합니다.');

  const source = readFileSync(pagePath, 'utf8');

  assert.match(source, /<TextToolInput/);
  assert.match(source, /id="yaml-json-converter-input"/);
  assert.match(source, /YAML 입력|JSON 입력/);
  assert.match(source, /외부 API 없이 브라우저에서만 처리됩니다\./);
  assert.match(source, /로컬 처리/);
  assert.match(source, /<ResultsPanel/);
  assert.match(source, /copyValue=\{copyValue\}/);
  assert.match(source, /copyEmptyMessage="복사할 YAML\/JSON 변환 결과가 없습니다\."/);
});
