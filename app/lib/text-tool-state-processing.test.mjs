import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readPage(relativePath) {
  return readFileSync(resolve(import.meta.dirname, relativePath), 'utf8');
}

const textToolPages = [
  {
    name: 'JSON 포맷터',
    path: '../converters/json-formatter/page.tsx',
    inputId: 'json-formatter-input',
    setter: 'setInput',
    processor: 'formatJsonText(input, mode)',
  },
  {
    name: 'Base64 인코더/디코더',
    path: '../converters/base64-converter/page.tsx',
    inputId: 'base64-converter-input',
    setter: 'setInput',
    processor: 'convertBase64Text(input, mode)',
  },
  {
    name: 'SQL 쿼리 포맷터',
    path: '../converters/sql-formatter/page.tsx',
    inputId: 'sql-formatter-input',
    setter: 'setInput',
    processor: 'formatSqlText(input)',
  },
  {
    name: 'SVG → React 변환기',
    path: '../converters/svg-to-react/page.tsx',
    inputId: 'svg-to-react-input',
    setter: 'setInput',
    processor: 'convertSvgToReactComponent(input, componentName)',
  },
  {
    name: 'Unix Timestamp ↔ 날짜',
    path: '../converters/timestamp-converter/page.tsx',
    inputId: 'timestamp-converter-input',
    setter: 'setInput',
    processor: 'convertTimestampText(input, mode)',
  },
];

for (const page of textToolPages) {
  test(`${page.name}는 입력 상태를 읽어 변환 로직을 실행하고 결과 패널에 연결한다`, () => {
    const source = readPage(page.path);

    assert.match(source, /import \{ useMemo, useState \} from 'react';/);
    assert.match(source, /<TextToolInput/);
    assert.match(source, new RegExp(`id="${page.inputId}"`));
    assert.match(source, new RegExp(`onValueChange=\\{${page.setter}\\}`));
    assert.match(source, new RegExp(page.processor.replace(/[()]/g, '\\$&')));
    assert.match(source, /useMemo\(\(\) => \{/);
    assert.match(source, /<ResultsPanel/);
    assert.match(source, page.copyValue ?? /copyValue=\{copyValue\}/);
    assert.match(source, page.emptyMessage ?? /emptyMessage=\{emptyMessage\}/);
    assert.match(source, page.isEmpty ?? /isEmpty=\{!output\}/);
    assert.match(source, page.errorCondition ?? /<ToolValidationMessage message=\{error\}/);
    assert.match(source, page.errorValue ?? /\{error\}/);
    assert.match(source, page.resultOutput ?? /<code className="break-words font-mono">\{output\}<\/code>/);
    assert.doesNotMatch(source, /document\.addEventListener\('paste'/);
    assert.doesNotMatch(source, /alert\(/);
  });
}
