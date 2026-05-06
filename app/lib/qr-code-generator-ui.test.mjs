import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pagePath = resolve(import.meta.dirname, '../converters/qr-code-generator/page.tsx');

test('QR 생성 도구가 유틸리티 분류와 /converters 라우트로 등록된다', () => {
  const convertersSource = readFileSync(resolve(import.meta.dirname, './converters.ts'), 'utf8');

  assert.match(convertersSource, /id: 'qr-code-generator'/);
  assert.match(convertersSource, /title: 'QR 코드 생성기'/);
  assert.match(convertersSource, /path: '\/converters\/qr-code-generator'/);
  assert.match(convertersSource, /group: '유틸리티'/);
});

test('QR 생성 도구 카탈로그는 화면 입력과 복사 가능한 데이터 URL 출력을 설명한다', () => {
  const convertersSource = readFileSync(resolve(import.meta.dirname, './converters.ts'), 'utf8');

  assert.match(
    convertersSource,
    /text: \{ type: 'string', label: 'QR 코드 입력값', required: true(?:, validation: \{ maxLength: 4096 \})? \}/,
  );
  assert.match(convertersSource, /size: \{ type: 'number', label: '이미지 크기' \}/);
  assert.match(convertersSource, /margin: \{ type: 'number', label: '여백' \}/);
  assert.match(convertersSource, /dataUrl: \{ type: 'string', label: 'QR 코드 데이터 URL', required: true \}/);
  assert.match(convertersSource, /hasCopyButton: true as const/);
  assert.match(convertersSource, /localOnly: true as const/);
});

test('QR 생성 도구 화면은 입력, 결과 복사, 기본 오류 처리를 제공한다', () => {
  assert.equal(existsSync(pagePath), true, 'QR 생성 도구 페이지가 있어야 합니다.');

  const source = readFileSync(pagePath, 'utf8');

  assert.match(source, /id="qr-code-input"/, 'QR 코드 원문 입력을 제공해야 합니다.');
  assert.match(source, /id="qr-code-size"/, 'QR 코드 크기 입력을 제공해야 합니다.');
  assert.match(source, /QRCode\.toDataURL/, '브라우저에서 QR 이미지를 생성해야 합니다.');
  assert.match(source, /ResultsPanel/, '결과 패널을 사용해야 합니다.');
  assert.match(source, /copyValue=\{qrDataUrl\}/, '생성된 QR 데이터 URL을 복사할 수 있어야 합니다.');
  assert.match(source, /복사할 QR 코드 결과가 없습니다\./, '빈 결과 복사 오류 문구를 제공해야 합니다.');
  assert.match(source, /QR 코드 생성 중 오류가 발생했습니다\./, '기본 오류 메시지를 제공해야 합니다.');
  assert.match(
    source,
    /입력값이 QR 코드에 담기에는 너무 깁니다\. 텍스트를 줄이거나 핵심 값만 입력해주세요\./,
    '형식은 유효하지만 QR 용량을 초과한 입력의 실패 원인을 안내해야 합니다.',
  );
  assert.match(source, /외부 API 없이 브라우저에서만 처리됩니다\./, '로컬 처리 원칙을 표시해야 합니다.');
});
