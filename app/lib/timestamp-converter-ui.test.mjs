import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pagePath = resolve(import.meta.dirname, '../converters/timestamp-converter/page.tsx');

test('시간 타임스탬프 변환 도구는 로컬 처리 UI, 입력, 복사 가능한 결과를 제공한다', () => {
  assert.equal(existsSync(pagePath), true, 'Timestamp 변환 페이지가 있어야 합니다.');

  const source = readFileSync(pagePath, 'utf8');

  assert.match(source, /Timestamp → ISO 날짜/);
  assert.match(source, /날짜 → Timestamp/);
  assert.match(source, /<TextToolInput/);
  assert.match(source, /id="timestamp-converter-input"/);
  assert.match(source, /<ToolValidationMessage message=\{error\} \/>/);
  assert.match(source, /<ResultsPanel/);
  assert.match(source, /copyValue=\{copyValue\}/);
  assert.match(source, /copyEmptyMessage="복사할 Timestamp 변환 결과가 없습니다\."/);
  assert.match(source, /<span className="app-chip rounded-lg">로컬 처리<\/span>/);
  assert.match(source, /외부 API 없이 브라우저에서 변환합니다\./);
});

test('시간 타임스탬프 변환 도구가 카탈로그와 라우트에 등록된다', () => {
  const convertersSource = readFileSync(resolve(import.meta.dirname, './converters.ts'), 'utf8');

  assert.match(convertersSource, /id: 'timestamp-converter'/);
  assert.match(convertersSource, /path: '\/converters\/timestamp-converter'/);
  assert.match(convertersSource, /title: 'Unix Timestamp ↔ 날짜'/);
  assert.match(convertersSource, /priority: 10/);
  assert.match(convertersSource, /allowedValues: \['timestamp-to-date', 'date-to-timestamp'\]/);
  assert.match(convertersSource, /hasCopyButton: true as const/);
});
