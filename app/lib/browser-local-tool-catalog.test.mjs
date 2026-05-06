import test from 'node:test';
import assert from 'node:assert/strict';

import * as catalogModule from './converters.ts';

const { browserLocalToolCatalog } = catalogModule;

const requiredToolIds = [
  'random-token-generator',
  'uuid-ulid-generator',
  'url-encoder-decoder',
  'jwt-decoder',
  'regex-tester',
  'string-case-converter',
  'qr-code-generator',
];

test('브라우저 로컬 도구 카탈로그가 13개 이상 우선 도구와 필수 후보를 포함한다', () => {
  assert.ok(browserLocalToolCatalog.length >= 13);

  const catalogIds = browserLocalToolCatalog.map((tool) => tool.id);

  for (const requiredToolId of requiredToolIds) {
    assert.ok(catalogIds.includes(requiredToolId), `${requiredToolId} 도구가 포함되어야 한다`);
  }
});

test('브라우저 로컬 도구 카탈로그 항목은 Seed 메타데이터 계약을 만족한다', () => {
  const seenPriorities = new Set();

  for (const tool of browserLocalToolCatalog) {
    assert.match(tool.id, /^[a-z0-9-]+$/);
    assert.equal(typeof tool.title, 'string');
    assert.equal(typeof tool.group, 'string');
    assert.match(tool.path, /^\/converters\/[a-z0-9-]+$/);
    assert.equal(tool.localOnly, true);
    assert.equal(tool.hasCopyButton, true);
    assert.equal(typeof tool.errorHandling, 'string');
    assert.ok(tool.errorHandling.length > 0);
    assert.ok(Object.keys(tool.inputSchema.fields).length > 0);
    assert.ok(Object.keys(tool.outputSchema.fields).length > 0);
    assert.ok(tool.copyFormats.length > 0, `${tool.id} 복사 형식이 정의되어야 한다`);
    assert.equal(
      tool.copyFormats.filter((format) => format.primary).length,
      1,
      `${tool.id} 기본 복사 형식은 하나여야 한다`,
    );

    assert.equal(seenPriorities.has(tool.priority), false, `${tool.id} 우선순위가 중복되면 안 된다`);
    seenPriorities.add(tool.priority);
  }
});

test('브라우저 로컬 도구 카탈로그 입력 필드는 도구별 형식 검증 규칙을 제공한다', () => {
  for (const tool of browserLocalToolCatalog) {
    for (const [fieldName, field] of Object.entries(tool.inputSchema.fields)) {
      if (!field.required) {
        continue;
      }

      assert.ok(
        field.validation,
        `${tool.id}.${fieldName} 필수 입력은 형식 검증 규칙을 가져야 한다`,
      );
    }
  }
});

test('브라우저 로컬 도구 카탈로그 입력 검증은 필수값, 선택지, 숫자 범위를 차단한다', () => {
  assert.equal(typeof catalogModule.validateBrowserLocalToolInput, 'function');

  assert.deepEqual(
    catalogModule.validateBrowserLocalToolInput('url-encoder-decoder', {
      mode: 'escape',
      value: 'https://example.com',
    }),
    ['인코딩, 디코딩 또는 파싱 모드는 허용된 값 중 하나로 선택해주세요.'],
  );

  assert.deepEqual(
    catalogModule.validateBrowserLocalToolInput('uuid-ulid-generator', {
      kind: 'uuid',
      quantity: 101,
    }),
    ['생성 개수는 100 이하로 입력해주세요.'],
  );

  assert.deepEqual(
    catalogModule.validateBrowserLocalToolInput('jwt-decoder', {
      token: 'not-a-jwt',
    }),
    ['JWT 문자열 형식을 확인해주세요.'],
  );

  assert.deepEqual(
    catalogModule.validateBrowserLocalToolInput('qr-code-generator', {
      text: 'x'.repeat(4097),
    }),
    ['QR 코드 입력값은 4096자 이하로 입력해주세요.'],
  );
});

test('브라우저 로컬 도구 카탈로그는 파싱된 문자열 값을 도구 내부 처리 형식으로 정규화한다', () => {
  assert.equal(typeof catalogModule.normalizeBrowserLocalToolInput, 'function');

  assert.deepEqual(
    catalogModule.normalizeBrowserLocalToolInput('random-token-generator', {
      length: '64',
      quantity: '3',
      characterSets: 'lowercase,uppercase,numbers',
      excludeAmbiguous: 'false',
      prefix: 'raw-secret-should-be-ignored',
    }),
    {
      length: 64,
      quantity: 3,
      characterSets: {
        lowercase: true,
        uppercase: true,
        numbers: true,
        symbols: false,
      },
    },
  );

  assert.deepEqual(
    catalogModule.normalizeBrowserLocalToolInput('qr-code-generator', {
      text: 'https://example.com',
      size: '512',
      margin: '4',
    }),
    {
      text: 'https://example.com',
      size: 512,
      margin: 4,
    },
  );

  assert.deepEqual(
    catalogModule.normalizeBrowserLocalToolInput('uuid-ulid-generator', {
      kind: ' ulid ',
      quantity: '10',
    }),
    {
      kind: 'ulid',
      quantity: 10,
    },
  );
});

test('브라우저 로컬 도구 카탈로그는 우선순위 오름차순으로 정렬된다', () => {
  const priorities = browserLocalToolCatalog.map((tool) => tool.priority);
  const sortedPriorities = [...priorities].sort((a, b) => a - b);

  assert.deepEqual(priorities, sortedPriorities);
});

test('파일 또는 구조화된 결과 도구는 복사 형식과 출력 필드를 명시한다', () => {
  const expectedFormatsByTool = {
    'random-token-generator': ['newline', 'json', 'env', 'csv'],
    'uuid-ulid-generator': ['newline', 'json'],
    'jwt-decoder': ['decoded-json', 'header-json', 'payload-json', 'signature-text'],
    'regex-tester': ['json'],
    'string-case-converter': ['labeled-text', 'json'],
    'qr-code-generator': ['png-data-url'],
    'json-formatter': ['formatted-json'],
    'sql-formatter': ['sql'],
    'svg-to-react': ['tsx'],
    'html-entity-escaper': ['plain-text'],
  };

  for (const [toolId, expectedFormatIds] of Object.entries(expectedFormatsByTool)) {
    const tool = browserLocalToolCatalog.find((item) => item.id === toolId);
    assert.ok(tool, `${toolId} 도구가 카탈로그에 있어야 한다`);

    const actualFormatIds = tool.copyFormats.map((format) => format.id);
    assert.deepEqual(actualFormatIds, expectedFormatIds);

    for (const format of tool.copyFormats) {
      assert.equal(typeof format.label, 'string');
      assert.equal(typeof format.mimeType, 'string');
      assert.equal(typeof format.outputField, 'string');
      assert.ok(format.outputField.length > 0);
      assert.ok(
        format.outputField in tool.outputSchema.fields,
        `${tool.id} ${format.id} 기본 출력 필드는 outputSchema에 있어야 한다`,
      );

      for (const outputField of format.outputFields ?? [format.outputField]) {
        assert.ok(
          outputField in tool.outputSchema.fields,
          `${tool.id} ${format.id} 출력 필드는 outputSchema에 있어야 한다`,
        );
      }
    }
  }
});
