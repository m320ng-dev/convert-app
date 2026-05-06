import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { browserLocalToolCatalog } from './converters.ts';

const appDir = resolve(import.meta.dirname, '..');

const expectedInputMarkersByTool = {
  'random-token-generator': [
    'id="token-length"',
    'id="token-quantity"',
    '문자 종류',
    'id="token-exclude"',
  ],
  'uuid-ulid-generator': [
    'name="kind"',
    'type="number"',
    '생성 개수',
  ],
  'url-encoder-decoder': [
    'id="url-codec-mode"',
    'id="url-codec-input"',
    'TextToolInput',
  ],
  'jwt-decoder': [
    'id="jwt-token"',
    'id="jwt-validation-algorithm"',
    'id="jwt-validation-secret"',
  ],
  'regex-tester': [
    'id="regex-pattern"',
    'id="regex-flags-input"',
    'id="regex-test-text"',
  ],
  'string-case-converter': [
    'id="string-case-input"',
    'TextToolInput',
  ],
  'qr-code-generator': [
    'id="qr-code-input"',
    'id="qr-code-size"',
    'id="qr-code-margin"',
  ],
  'json-formatter': [
    'id="json-formatter-mode"',
    'id="json-formatter-input"',
    'TextToolInput',
  ],
  'base64-converter': [
    'id="base64-converter-mode"',
    'id="base64-converter-input"',
    'TextToolInput',
  ],
  'timestamp-converter': [
    'id="timestamp-converter-mode"',
    'id="timestamp-converter-input"',
    'TextToolInput',
  ],
  'csv-json-converter': [
    'id="csv-json-converter-mode"',
    'id="csv-json-converter-input"',
    'TextToolInput',
  ],
  'yaml-json-converter': [
    'id="yaml-json-converter-mode"',
    'id="yaml-json-converter-input"',
    'TextToolInput',
  ],
  'sql-formatter': [
    'id="sql-formatter-input"',
    'TextToolInput',
  ],
  'svg-to-react': [
    'id="svg-component-name"',
    'id="svg-to-react-input"',
    'TextToolInput',
  ],
  'html-entity-escaper': [
    'id="html-entity-mode"',
    'id="html-entity-input"',
    'TextToolInput',
  ],
  'hash-generator': [
    'id="hash-generator-input"',
    'id="hash-file-input"',
    'id="hash-verification-algorithm"',
    'id="hash-expected-value"',
  ],
};

test('브라우저 로컬 카탈로그의 각 도구는 목적에 맞는 기본 입력 UI를 제공한다', () => {
  for (const tool of browserLocalToolCatalog) {
    const routeFile = resolve(appDir, tool.path.replace(/^\//, ''), 'page.tsx');

    assert.equal(existsSync(routeFile), true, `${tool.id} 실행 화면이 있어야 한다`);

    const source = readFileSync(routeFile, 'utf8');

    assert.match(
      source,
      /<TextToolInput|<FileToolInput|<textarea|<input|<select/,
      `${tool.id}는 텍스트 영역, 파일 입력, 값 입력 또는 선택 입력을 제공해야 한다`,
    );

    const expectedMarkers = expectedInputMarkersByTool[tool.id];
    assert.ok(expectedMarkers, `${tool.id} 입력 UI 검증 마커가 정의되어야 한다`);

    for (const marker of expectedMarkers) {
      assert.ok(
        source.includes(marker),
        `${tool.id} 페이지는 기본 입력 UI 마커 ${marker}를 포함해야 한다`,
      );
    }
  }
});

test('직접 입력 폼을 가진 브라우저 로컬 도구는 처리 전 입력 초기화를 제공한다', () => {
  const resetExpectationsByTool = {
    'random-token-generator': [
      /function handleResetInputs/,
      /setSelectedPreset\(tokenPresetOptions\[0\]\.id\)/,
      /setLength\(tokenPresetOptions\[0\]\.length\)/,
      /setTokens\(\[\]\)/,
      /입력 초기화/,
    ],
    'uuid-ulid-generator': [
      /function handleResetGeneratorInputs/,
      /function handleResetValidationInputs/,
      /setKind\('both'\)/,
      /setUuidInput\(''\)/,
      /입력 초기화/,
    ],
    'regex-tester': [
      /function handleResetInputs/,
      /setInputValue\('pattern'/,
      /setInputValue\('testText'/,
      /setInputValue\('enabledFlags'/,
      /입력 초기화/,
    ],
  };

  for (const [toolId, expectations] of Object.entries(resetExpectationsByTool)) {
    const tool = browserLocalToolCatalog.find((item) => item.id === toolId);

    assert.ok(tool, `${toolId} 도구가 카탈로그에 있어야 한다`);

    const routeFile = resolve(appDir, tool.path.replace(/^\//, ''), 'page.tsx');
    const source = readFileSync(routeFile, 'utf8');

    for (const expectation of expectations) {
      assert.match(source, expectation, `${toolId}는 처리 전 입력 초기화 구현을 포함해야 한다`);
    }
  }
});

test('브라우저 로컬 카탈로그의 각 도구 입력 영역은 예시 입력 적용을 제공한다', () => {
  const exampleInputMarkersByTool = {
    'random-token-generator': ['function handleApplyExampleInputs', '예시 입력 적용'],
    'uuid-ulid-generator': ['function handleApplyGeneratorExample', 'function handleApplyValidationExample', '예시 입력 적용'],
    'url-encoder-decoder': ['exampleValue='],
    'jwt-decoder': ['exampleValue='],
    'regex-tester': ['function handleApplyExampleInputs', '예시 입력 적용'],
    'string-case-converter': ['exampleValue='],
    'qr-code-generator': ['exampleValue='],
    'json-formatter': ['exampleValue='],
    'base64-converter': ['exampleValue='],
    'timestamp-converter': ['exampleValue='],
    'csv-json-converter': ['exampleValue='],
    'yaml-json-converter': ['exampleValue='],
    'sql-formatter': ['exampleValue='],
    'svg-to-react': ['exampleValue='],
    'html-entity-escaper': ['exampleValue='],
    'hash-generator': ['exampleValue='],
  };

  for (const tool of browserLocalToolCatalog) {
    const routeFile = resolve(appDir, tool.path.replace(/^\//, ''), 'page.tsx');
    const source = readFileSync(routeFile, 'utf8');
    const expectedMarkers = exampleInputMarkersByTool[tool.id];

    assert.ok(expectedMarkers, `${tool.id} 예시 입력 검증 마커가 정의되어야 한다`);

    for (const marker of expectedMarkers) {
      assert.ok(
        source.includes(marker),
        `${tool.id} 페이지는 예시 입력 적용 마커 ${marker}를 포함해야 한다`,
      );
    }
  }
});

test('브라우저 로컬 카탈로그의 각 도구 입력 영역은 클립보드 붙여넣기를 제공한다', () => {
  const clipboardInputMarkersByTool = {
    'random-token-generator': [
      'function handlePasteExcludedCharactersFromClipboard',
      'function handlePastePrefixFromClipboard',
      'function handlePasteSuffixFromClipboard',
      '클립보드 붙여넣기',
    ],
    'uuid-ulid-generator': [
      'function handlePasteUuidFromClipboard',
      '클립보드 붙여넣기',
    ],
    'url-encoder-decoder': ['TextToolInput'],
    'jwt-decoder': ['TextToolInput'],
    'regex-tester': [
      'function handlePastePatternFromClipboard',
      'function handlePasteFlagsFromClipboard',
      'TextToolInput',
      '클립보드 붙여넣기',
    ],
    'string-case-converter': ['TextToolInput'],
    'qr-code-generator': ['TextToolInput'],
    'json-formatter': ['TextToolInput'],
    'base64-converter': ['TextToolInput'],
    'timestamp-converter': ['TextToolInput'],
    'csv-json-converter': ['TextToolInput'],
    'yaml-json-converter': ['TextToolInput'],
    'sql-formatter': ['TextToolInput'],
    'svg-to-react': ['TextToolInput'],
    'html-entity-escaper': ['TextToolInput'],
    'hash-generator': [
      'TextToolInput',
      'function handlePasteExpectedHashFromClipboard',
      '클립보드 붙여넣기',
    ],
  };

  for (const tool of browserLocalToolCatalog) {
    const routeFile = resolve(appDir, tool.path.replace(/^\//, ''), 'page.tsx');
    const source = readFileSync(routeFile, 'utf8');
    const expectedMarkers = clipboardInputMarkersByTool[tool.id];

    assert.ok(expectedMarkers, `${tool.id} 클립보드 붙여넣기 검증 마커가 정의되어야 한다`);

    for (const marker of expectedMarkers) {
      assert.ok(
        source.includes(marker),
        `${tool.id} 페이지는 클립보드 붙여넣기 마커 ${marker}를 포함해야 한다`,
      );
    }
  }
});

test('브라우저 로컬 카탈로그의 각 도구 입력 영역은 현재 입력값 복사를 제공한다', () => {
  const copyInputMarkersByTool = {
    'random-token-generator': [
      'function formatRandomTokenInputForCopy',
      '<CopyResultAction',
      'ariaLabel="토큰 생성 입력값 복사"',
      'copiedMessage="토큰 생성 입력값을 클립보드에 복사했습니다."',
      '입력값 복사',
    ],
    'uuid-ulid-generator': [
      'function formatUuidUlidGeneratorInputForCopy',
      '<CopyResultAction',
      'ariaLabel="식별자 생성 입력값 복사"',
      'ariaLabel="UUID 검증 입력값 복사"',
      'copiedMessage="UUID 검증 입력값을 클립보드에 복사했습니다."',
      '입력값 복사',
    ],
    'url-encoder-decoder': ['TextToolInput'],
    'jwt-decoder': ['TextToolInput'],
    'regex-tester': [
      'function formatRegexInputForCopy',
      'function handleCopyRegexInputsToClipboard',
      '입력값 복사',
    ],
    'string-case-converter': ['TextToolInput'],
    'qr-code-generator': ['TextToolInput'],
    'json-formatter': ['TextToolInput'],
    'base64-converter': ['TextToolInput'],
    'timestamp-converter': ['TextToolInput'],
    'csv-json-converter': ['TextToolInput'],
    'yaml-json-converter': ['TextToolInput'],
    'sql-formatter': ['TextToolInput'],
    'svg-to-react': ['TextToolInput'],
    'html-entity-escaper': ['TextToolInput'],
    'hash-generator': [
      'TextToolInput',
      '<CopyResultAction',
      'ariaLabel="검증할 해시 입력값 복사"',
      'copiedMessage="검증할 해시 입력값을 클립보드에 복사했습니다."',
      '입력값 복사',
    ],
  };

  for (const tool of browserLocalToolCatalog) {
    const routeFile = resolve(appDir, tool.path.replace(/^\//, ''), 'page.tsx');
    const source = readFileSync(routeFile, 'utf8');
    const expectedMarkers = copyInputMarkersByTool[tool.id];

    assert.ok(expectedMarkers, `${tool.id} 입력값 복사 검증 마커가 정의되어야 한다`);

    for (const marker of expectedMarkers) {
      assert.ok(
        source.includes(marker),
        `${tool.id} 페이지는 입력값 복사 마커 ${marker}를 포함해야 한다`,
      );
    }
  }
});
