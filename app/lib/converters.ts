export interface Converter {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  path: string;
  group: '텍스트' | '코드' | '데이터' | '이미지' | '네트워크' | '보안' | 'API' | '유틸리티';
}

type ToolFieldType = 'string' | 'number' | 'boolean' | 'array' | 'object';

interface ToolSchemaFieldValidation {
  allowedValues?: readonly string[];
  integer?: boolean;
  max?: number;
  maxLength?: number;
  min?: number;
  minItems?: number;
  requireAtLeastOneTruthyKey?: boolean;
  pattern?: string;
  requiredKeys?: readonly string[];
}

interface ToolSchemaField {
  type: ToolFieldType;
  label: string;
  required?: boolean;
  validation?: ToolSchemaFieldValidation;
}

export interface ToolSchema {
  fields: Record<string, ToolSchemaField>;
}

export interface ToolCopyFormat {
  id: string;
  label: string;
  mimeType: string;
  outputField: string;
  outputFields?: string[];
  fileExtension?: string;
  primary?: boolean;
}

export interface BrowserLocalToolCatalogItem extends Converter {
  priority: number;
  localOnly: true;
  inputSchema: ToolSchema;
  outputSchema: ToolSchema;
  copyFormats: ToolCopyFormat[];
  hasCopyButton: true;
  errorHandling: string;
}

export const converters: Converter[] = [
  {
    id: 'html-to-markdown',
    title: 'HTML → Markdown 변환기',
    shortTitle: 'HTML → Markdown',
    description: 'HTML 문서를 Markdown 문법으로 변환합니다.',
    path: '/converters/html-to-markdown',
    group: '텍스트',
  },
  {
    id: 'js-beautifier',
    title: 'JavaScript 코드 정리',
    shortTitle: 'JS 정리',
    description: 'JavaScript 코드를 읽기 쉬운 형태로 포맷팅합니다.',
    path: '/converters/js-beautifier',
    group: '코드',
  },
  {
    id: 'json-formatter',
    title: 'JSON 포맷터',
    shortTitle: 'JSON',
    description: 'JSON 데이터 정리와 유효성 검사를 수행합니다.',
    path: '/converters/json-formatter',
    group: '데이터',
  },
  {
    id: 'sql-formatter',
    title: 'SQL 쿼리 포맷터',
    shortTitle: 'SQL',
    description: 'SQL 쿼리 구문을 일관된 형식으로 정리합니다.',
    path: '/converters/sql-formatter',
    group: '코드',
  },
  {
    id: 'svg-to-react',
    title: 'SVG → React 변환기',
    shortTitle: 'SVG → React',
    description: 'SVG 마크업을 React 컴포넌트 코드로 변환합니다.',
    path: '/converters/svg-to-react',
    group: '코드',
  },
  {
    id: 'timestamp-converter',
    title: 'Unix Timestamp ↔ 날짜',
    shortTitle: 'Timestamp',
    description: 'Unix timestamp와 일반 날짜를 서로 변환합니다.',
    path: '/converters/timestamp-converter',
    group: '데이터',
  },
  {
    id: 'csv-json-converter',
    title: 'CSV ↔ JSON 변환기',
    shortTitle: 'CSV/JSON',
    description: 'CSV 텍스트와 JSON 객체 배열을 양방향 변환합니다.',
    path: '/converters/csv-json-converter',
    group: '데이터',
  },
  {
    id: 'yaml-json-converter',
    title: 'YAML ↔ JSON 변환기',
    shortTitle: 'YAML/JSON',
    description: 'YAML 설정값과 JSON 데이터를 양방향 변환합니다.',
    path: '/converters/yaml-json-converter',
    group: '데이터',
  },
  {
    id: 'image-to-base64',
    title: '이미지 → Base64 변환기',
    shortTitle: '이미지 → Base64',
    description: '이미지 파일을 Base64 문자열로 변환합니다.',
    path: '/converters/image-to-base64',
    group: '이미지',
  },
  {
    id: 'base64-to-image',
    title: 'Base64 → 이미지 변환기',
    shortTitle: 'Base64 → 이미지',
    description: 'Base64 문자열을 이미지 미리보기로 복원합니다.',
    path: '/converters/base64-to-image',
    group: '이미지',
  },
  {
    id: 'base64-converter',
    title: 'Base64 인코더/디코더',
    shortTitle: 'Base64 텍스트',
    description: '텍스트와 Base64 문자열을 양방향 변환합니다.',
    path: '/converters/base64-converter',
    group: '텍스트',
  },
  {
    id: 'html-entity-escaper',
    title: 'HTML 엔티티 이스케이프/언이스케이프',
    shortTitle: 'HTML 엔티티',
    description: 'HTML 특수 문자를 엔티티로 이스케이프하거나 원문으로 되돌립니다.',
    path: '/converters/html-entity-escaper',
    group: '텍스트',
  },
  {
    id: 'url-encoder-decoder',
    title: 'URL 인코더/디코더 및 파서',
    shortTitle: 'URL 변환',
    description: 'URL 전체 또는 쿼리 값 같은 URL 컴포넌트를 인코딩, 디코딩하고 구성요소를 파싱합니다.',
    path: '/converters/url-encoder-decoder',
    group: 'API',
  },
  {
    id: 'regex-tester',
    title: 'Regex 테스트 도구',
    shortTitle: 'Regex 테스트',
    description: '정규식 패턴, 플래그, 테스트 텍스트의 매칭 결과를 검증합니다.',
    path: '/converters/regex-tester',
    group: 'API',
  },
  {
    id: 'env-validator',
    title: '.env 검증기',
    shortTitle: '.env 검증',
    description: '환경변수 파일의 형식, 중복 키, 빈 값을 검증합니다.',
    path: '/converters/env-validator',
    group: '보안',
  },
  {
    id: 'random-token-generator',
    title: '토큰 생성기',
    shortTitle: '토큰 생성',
    description: 'API 키, 임시 비밀값, 테스트 값으로 쓸 랜덤 토큰을 생성합니다.',
    path: '/converters/random-token-generator',
    group: '보안',
  },
  {
    id: 'uuid-ulid-generator',
    title: 'UUID/ULID 생성/검증기',
    shortTitle: 'UUID/ULID',
    description: 'UUID v4와 시간 정렬 가능한 ULID를 생성하고 UUID 형식을 검증합니다.',
    path: '/converters/uuid-ulid-generator',
    group: '유틸리티',
  },
  {
    id: 'qr-code-generator',
    title: 'QR 코드 생성기',
    shortTitle: 'QR 생성',
    description: '텍스트나 URL을 QR 코드 이미지로 생성합니다.',
    path: '/converters/qr-code-generator',
    group: '유틸리티',
  },
  {
    id: 'string-case-converter',
    title: '문자열 케이스 변환기',
    shortTitle: 'Case 변환',
    description: '문자열을 camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE로 변환합니다.',
    path: '/converters/string-case-converter',
    group: '유틸리티',
  },
  {
    id: 'jwt-decoder',
    title: 'JWT 디코더',
    shortTitle: 'JWT',
    description: 'JWT 헤더와 페이로드를 디코딩하고 선택적으로 서명 검증을 보조합니다.',
    path: '/converters/jwt-decoder',
    group: 'API',
  },
  {
    id: 'hash-generator',
    title: '해시 생성/검증',
    shortTitle: '해시',
    description: 'MD5, SHA-1, SHA-256 등 해시값을 생성하고 예상 해시와 비교합니다.',
    path: '/converters/hash-generator',
    group: '보안',
  },
  {
    id: 'ip-geolocation',
    title: 'IP → 위치정보 변환기',
    shortTitle: 'IP 위치',
    description: 'IP 주소의 국가, 도시, 좌표 정보를 조회합니다.',
    path: '/converters/ip-geolocation',
    group: '네트워크',
  },
  {
    id: 'markdown-viewer',
    title: 'Markdown 뷰어',
    shortTitle: 'Markdown',
    description: '마크다운 문서를 실시간으로 미리봅니다.',
    path: '/converters/markdown-viewer',
    group: '텍스트',
  },
];

export const converterGroups = Array.from(
  new Set(converters.map((converter) => converter.group)),
);

const catalogMetadataById = {
  'random-token-generator': {
    priority: 1,
    inputSchema: {
      fields: {
        length: { type: 'number', label: '토큰 길이', required: true, validation: { integer: true, min: 4, max: 256 } },
        quantity: { type: 'number', label: '생성 개수', required: true, validation: { integer: true, min: 1, max: 100 } },
        characterSets: {
          type: 'object',
          label: '문자 집합',
          required: true,
          validation: {
            requiredKeys: ['lowercase', 'uppercase', 'numbers', 'symbols'],
            requireAtLeastOneTruthyKey: true,
          },
        },
      },
    },
    outputSchema: {
      fields: {
        tokens: { type: 'array', label: '생성된 토큰', required: true },
      },
    },
    copyFormats: [
      { id: 'newline', label: '줄바꿈 텍스트', mimeType: 'text/plain', outputField: 'tokens', primary: true },
      { id: 'json', label: 'JSON 배열', mimeType: 'application/json', outputField: 'tokens', fileExtension: 'json' },
      { id: 'env', label: '.env 변수', mimeType: 'text/plain', outputField: 'tokens', fileExtension: 'env' },
      { id: 'csv', label: 'CSV 행', mimeType: 'text/csv', outputField: 'tokens', fileExtension: 'csv' },
    ],
    errorHandling: '길이, 개수, 문자 집합이 유효하지 않으면 한국어 오류 메시지를 표시한다.',
  },
  'uuid-ulid-generator': {
    priority: 2,
    inputSchema: {
      fields: {
        kind: {
          type: 'string',
          label: 'UUID/ULID 종류',
          required: true,
          validation: { allowedValues: ['uuid', 'ulid', 'both'] },
        },
        quantity: { type: 'number', label: '생성 개수', required: true, validation: { integer: true, min: 1, max: 100 } },
        uuidToValidate: { type: 'string', label: '검증할 UUID', required: false, validation: { maxLength: 64 } },
      },
    },
    outputSchema: {
      fields: {
        identifiers: { type: 'array', label: '생성된 식별자', required: true },
        uuidValidation: { type: 'object', label: 'UUID 검증 결과', required: false },
      },
    },
    copyFormats: [
      { id: 'newline', label: '줄바꿈 텍스트', mimeType: 'text/plain', outputField: 'identifiers', primary: true },
      { id: 'json', label: '라벨 포함 JSON', mimeType: 'application/json', outputField: 'identifiers', fileExtension: 'json' },
    ],
    errorHandling: '생성 개수 범위, 빈 UUID 검증 입력, 잘못된 UUID 형식은 한국어 오류 메시지로 표시한다.',
  },
  'url-encoder-decoder': {
    priority: 3,
    inputSchema: {
      fields: {
        mode: {
          type: 'string',
          label: '인코딩, 디코딩 또는 파싱 모드',
          required: true,
          validation: { allowedValues: ['encode-component', 'decode-component', 'encode-full', 'decode-full', 'parse'] },
        },
        value: { type: 'string', label: 'URL 입력값', required: true, validation: { maxLength: 100000 } },
      },
    },
    outputSchema: {
      fields: {
        result: { type: 'string', label: 'URL 변환 또는 파싱 결과', required: true },
      },
    },
    copyFormats: [
      { id: 'plain-text', label: 'URL 결과 텍스트', mimeType: 'text/plain', outputField: 'result', primary: true },
    ],
    errorHandling: '빈 입력, 잘못된 퍼센트 인코딩, 파싱할 수 없는 URL은 변환하지 않고 한국어 오류를 표시한다.',
  },
  'jwt-decoder': {
    priority: 4,
    inputSchema: {
      fields: {
        token: {
          type: 'string',
          label: 'JWT 문자열',
          required: true,
          validation: {
            maxLength: 100000,
            pattern: '^[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]*$',
          },
        },
        secret: { type: 'string', label: '선택적 검증 키' },
      },
    },
    outputSchema: {
      fields: {
        header: { type: 'object', label: 'Header JSON', required: true },
        payload: { type: 'object', label: 'Payload JSON', required: true },
        signature: { type: 'string', label: 'Signature segment', required: true },
        verification: { type: 'object', label: '서명 검증 결과' },
      },
    },
    copyFormats: [
      {
        id: 'decoded-json',
        label: '디코딩 전체 JSON',
        mimeType: 'application/json',
        outputField: 'header',
        outputFields: ['header', 'payload', 'signature'],
        fileExtension: 'json',
        primary: true,
      },
      { id: 'header-json', label: 'Header JSON', mimeType: 'application/json', outputField: 'header', fileExtension: 'json' },
      { id: 'payload-json', label: 'Payload JSON', mimeType: 'application/json', outputField: 'payload', fileExtension: 'json' },
      { id: 'signature-text', label: 'Signature 텍스트', mimeType: 'text/plain', outputField: 'signature' },
    ],
    errorHandling: 'JWT 형식, JSON 디코딩, 검증 실패 사유를 결과 영역에 표시한다.',
  },
  'regex-tester': {
    priority: 5,
    inputSchema: {
      fields: {
        pattern: { type: 'string', label: '정규식 패턴', required: true, validation: { maxLength: 100000 } },
        flags: { type: 'string', label: '정규식 플래그' },
        text: { type: 'string', label: '테스트 텍스트', required: true, validation: { maxLength: 100000 } },
      },
    },
    outputSchema: {
      fields: {
        matches: { type: 'array', label: '매칭 결과', required: true },
        summary: { type: 'string', label: '결과 요약', required: true },
      },
    },
    copyFormats: [
      { id: 'json', label: '매칭 결과 JSON', mimeType: 'application/json', outputField: 'matches', fileExtension: 'json', primary: true },
    ],
    errorHandling: '정규식 컴파일 실패와 입력 누락을 한국어 메시지로 표시한다.',
  },
  'string-case-converter': {
    priority: 6,
    inputSchema: {
      fields: {
        text: { type: 'string', label: '원본 문자열', required: true, validation: { maxLength: 100000 } },
      },
    },
    outputSchema: {
      fields: {
        camelCase: { type: 'string', label: 'camelCase', required: true },
        pascalCase: { type: 'string', label: 'PascalCase', required: true },
        snakeCase: { type: 'string', label: 'snake_case', required: true },
        kebabCase: { type: 'string', label: 'kebab-case', required: true },
        constantCase: { type: 'string', label: 'CONSTANT_CASE', required: true },
      },
    },
    copyFormats: [
      {
        id: 'labeled-text',
        label: '라벨 포함 텍스트',
        mimeType: 'text/plain',
        outputField: 'camelCase',
        outputFields: ['camelCase', 'pascalCase', 'snakeCase', 'kebabCase', 'constantCase'],
        primary: true,
      },
      {
        id: 'json',
        label: '케이스 변환 JSON',
        mimeType: 'application/json',
        outputField: 'camelCase',
        outputFields: ['camelCase', 'pascalCase', 'snakeCase', 'kebabCase', 'constantCase'],
        fileExtension: 'json',
      },
    ],
    errorHandling: '빈 문자열은 변환 결과 대신 복사 가능한 결과가 없다는 메시지를 표시한다.',
  },
  'qr-code-generator': {
    priority: 7,
    inputSchema: {
      fields: {
        text: { type: 'string', label: 'QR 코드 입력값', required: true, validation: { maxLength: 4096 } },
        size: { type: 'number', label: '이미지 크기' },
        margin: { type: 'number', label: '여백' },
      },
    },
    outputSchema: {
      fields: {
        dataUrl: { type: 'string', label: 'QR 코드 데이터 URL', required: true },
      },
    },
    copyFormats: [
      { id: 'png-data-url', label: 'PNG 데이터 URL', mimeType: 'image/png', outputField: 'dataUrl', fileExtension: 'png', primary: true },
    ],
    errorHandling: '입력값이 비어 있거나 QR 생성에 실패하면 결과 영역에 오류를 표시한다.',
  },
  'json-formatter': {
    priority: 8,
    inputSchema: {
      fields: {
        mode: { type: 'string', label: '처리 모드', required: true },
        json: { type: 'string', label: 'JSON 입력값', required: true, validation: { maxLength: 100000 } },
      },
    },
    outputSchema: {
      fields: {
        formattedJson: { type: 'string', label: 'JSON 처리 결과', required: true },
      },
    },
    copyFormats: [
      { id: 'formatted-json', label: '정렬된 JSON', mimeType: 'application/json', outputField: 'formattedJson', fileExtension: 'json', primary: true },
    ],
    errorHandling: 'JSON 파싱 실패 위치를 확인할 수 있는 기본 오류 메시지를 표시한다.',
  },
  'base64-converter': {
    priority: 9,
    inputSchema: {
      fields: {
        mode: {
          type: 'string',
          label: '인코딩 또는 디코딩 모드',
          required: true,
          validation: { allowedValues: ['encode', 'decode'] },
        },
        value: { type: 'string', label: '텍스트 입력값', required: true, validation: { maxLength: 100000 } },
      },
    },
    outputSchema: {
      fields: {
        result: { type: 'string', label: 'Base64 변환 결과', required: true },
      },
    },
    copyFormats: [
      { id: 'plain-text', label: 'Base64 텍스트', mimeType: 'text/plain', outputField: 'result', primary: true },
    ],
    errorHandling: '잘못된 Base64 입력은 변환하지 않고 기본 오류 메시지를 표시한다.',
  },
  'timestamp-converter': {
    priority: 10,
    inputSchema: {
      fields: {
        value: { type: 'string', label: 'Timestamp 또는 날짜 입력값', required: true, validation: { maxLength: 100000 } },
        mode: {
          type: 'string',
          label: '변환 방향',
          required: true,
          validation: { allowedValues: ['timestamp-to-date', 'date-to-timestamp'] },
        },
      },
    },
    outputSchema: {
      fields: {
        result: { type: 'string', label: '날짜 또는 Timestamp 결과', required: true },
      },
    },
    copyFormats: [
      { id: 'plain-text', label: '날짜 또는 Timestamp 텍스트', mimeType: 'text/plain', outputField: 'result', primary: true },
    ],
    errorHandling: '날짜 파싱 실패와 숫자 범위 오류를 한국어로 표시한다.',
  },
  'sql-formatter': {
    priority: 11,
    inputSchema: {
      fields: {
        sql: { type: 'string', label: 'SQL 입력값', required: true, validation: { maxLength: 100000 } },
      },
    },
    outputSchema: {
      fields: {
        formattedSql: { type: 'string', label: '정렬된 SQL', required: true },
      },
    },
    copyFormats: [
      { id: 'sql', label: '정렬된 SQL 텍스트', mimeType: 'application/sql', outputField: 'formattedSql', fileExtension: 'sql', primary: true },
    ],
    errorHandling: '빈 SQL 입력이나 포맷팅 실패 시 기본 오류 메시지를 표시한다.',
  },
  'svg-to-react': {
    priority: 12,
    inputSchema: {
      fields: {
        svg: {
          type: 'string',
          label: 'SVG 마크업',
          required: true,
          validation: { maxLength: 100000, pattern: '^\\s*<svg[\\s>]' },
        },
        componentName: { type: 'string', label: 'React 컴포넌트명' },
      },
    },
    outputSchema: {
      fields: {
        componentCode: { type: 'string', label: 'React 컴포넌트 코드', required: true },
      },
    },
    copyFormats: [
      { id: 'tsx', label: 'React 컴포넌트 TSX', mimeType: 'text/tsx', outputField: 'componentCode', fileExtension: 'tsx', primary: true },
    ],
    errorHandling: 'SVG 입력 누락이나 변환 실패를 결과 영역의 오류 메시지로 표시한다.',
  },
  'html-entity-escaper': {
    priority: 13,
    inputSchema: {
      fields: {
        mode: {
          type: 'string',
          label: '이스케이프 또는 언이스케이프 모드',
          required: true,
          validation: { allowedValues: ['escape', 'unescape'] },
        },
        value: { type: 'string', label: 'HTML 또는 엔티티 입력값', required: true, validation: { maxLength: 100000 } },
      },
    },
    outputSchema: {
      fields: {
        result: { type: 'string', label: 'HTML 엔티티 변환 결과', required: true },
      },
    },
    copyFormats: [
      { id: 'plain-text', label: 'HTML 엔티티 변환 텍스트', mimeType: 'text/plain', outputField: 'result', primary: true },
    ],
    errorHandling: '빈 입력은 변환하지 않고 한국어 기본 오류 메시지를 표시한다.',
  },
  'csv-json-converter': {
    priority: 14,
    inputSchema: {
      fields: {
        mode: {
          type: 'string',
          label: 'CSV 또는 JSON 변환 모드',
          required: true,
          validation: { allowedValues: ['csv-to-json', 'json-to-csv'] },
        },
        value: { type: 'string', label: 'CSV 또는 JSON 입력값', required: true, validation: { maxLength: 100000 } },
      },
    },
    outputSchema: {
      fields: {
        result: { type: 'string', label: 'CSV 또는 JSON 변환 결과', required: true },
      },
    },
    copyFormats: [
      { id: 'plain-text', label: 'CSV/JSON 변환 텍스트', mimeType: 'text/plain', outputField: 'result', primary: true },
      { id: 'json', label: 'JSON 결과', mimeType: 'application/json', outputField: 'result', fileExtension: 'json' },
      { id: 'csv', label: 'CSV 결과', mimeType: 'text/csv', outputField: 'result', fileExtension: 'csv' },
    ],
    errorHandling: '빈 CSV/JSON 입력, CSV 열 개수 불일치, JSON 파싱 실패를 한국어 오류 메시지로 표시한다.',
  },
  'yaml-json-converter': {
    priority: 15,
    inputSchema: {
      fields: {
        mode: {
          type: 'string',
          label: 'YAML 또는 JSON 변환 모드',
          required: true,
          validation: { allowedValues: ['yaml-to-json', 'json-to-yaml'] },
        },
        value: { type: 'string', label: 'YAML 또는 JSON 입력값', required: true, validation: { maxLength: 100000 } },
      },
    },
    outputSchema: {
      fields: {
        result: { type: 'string', label: 'YAML 또는 JSON 변환 결과', required: true },
      },
    },
    copyFormats: [
      { id: 'plain-text', label: 'YAML/JSON 변환 텍스트', mimeType: 'text/plain', outputField: 'result', primary: true },
      { id: 'json', label: 'JSON 결과', mimeType: 'application/json', outputField: 'result', fileExtension: 'json' },
      { id: 'yaml', label: 'YAML 결과', mimeType: 'application/yaml', outputField: 'result', fileExtension: 'yaml' },
    ],
    errorHandling: '빈 YAML/JSON 입력, YAML 들여쓰기 오류, JSON 파싱 실패를 한국어 오류 메시지로 표시한다.',
  },
  'hash-generator': {
    priority: 16,
    inputSchema: {
      fields: {
        text: { type: 'string', label: '해시 원문', required: true, validation: { maxLength: 100000 } },
        algorithms: {
          type: 'array',
          label: '해시 알고리즘',
          required: true,
          validation: {
            allowedValues: ['md5', 'sha1', 'sha256', 'sha512', 'sha3', 'ripemd160'],
            minItems: 1,
          },
        },
        expectedHash: { type: 'string', label: '검증할 해시값' },
      },
    },
    outputSchema: {
      fields: {
        hashes: { type: 'array', label: '생성된 해시값', required: true },
        verification: { type: 'object', label: '해시 검증 결과' },
      },
    },
    copyFormats: [
      {
        id: 'labeled-text',
        label: '알고리즘 라벨 포함 텍스트',
        mimeType: 'text/plain',
        outputField: 'hashes',
        outputFields: ['hashes', 'verification'],
        primary: true,
      },
    ],
    errorHandling: '빈 원문, 알고리즘 미선택, 지원하지 않는 알고리즘, 검증 해시 누락을 결과 영역에 표시한다.',
  },
} satisfies Record<
  string,
  Omit<BrowserLocalToolCatalogItem, keyof Converter | 'localOnly' | 'hasCopyButton'>
>;

export const browserLocalToolCatalog: BrowserLocalToolCatalogItem[] = converters
  .filter((converter) => converter.id in catalogMetadataById)
  .map((converter) => ({
    ...converter,
    ...withRequiredFieldValidation(catalogMetadataById[converter.id as keyof typeof catalogMetadataById]),
    localOnly: true as const,
    hasCopyButton: true as const,
  }))
  .sort((a, b) => a.priority - b.priority);

function withRequiredFieldValidation<T extends Omit<BrowserLocalToolCatalogItem, keyof Converter | 'localOnly' | 'hasCopyButton'>>(
  metadata: T,
): T {
  return {
    ...metadata,
    inputSchema: {
      fields: Object.fromEntries(
        Object.entries(metadata.inputSchema.fields).map(([fieldName, field]) => [
          fieldName,
          field.required && !field.validation
            ? { ...field, validation: defaultValidationForField(field) }
            : field,
        ]),
      ),
    },
  };
}

function defaultValidationForField(field: ToolSchemaField): ToolSchemaFieldValidation {
  if (field.type === 'number') {
    return { integer: true };
  }

  if (field.type === 'string') {
    return { maxLength: 100000 };
  }

  return {};
}

export function validateBrowserLocalToolInput(
  toolId: string,
  values: Record<string, unknown>,
): string[] {
  const tool = browserLocalToolCatalog.find((catalogItem) => catalogItem.id === toolId);

  if (!tool) {
    return ['도구 정보를 찾을 수 없습니다.'];
  }

  const errors: string[] = [];

  for (const [fieldName, field] of Object.entries(tool.inputSchema.fields)) {
    const value = values[fieldName];

    if (field.required && isBlankInput(value)) {
      errors.push(`${field.label}을 입력해주세요.`);
      continue;
    }

    if (isBlankInput(value)) {
      continue;
    }

    if (!matchesSchemaFieldType(value, field.type)) {
      errors.push(`${field.label} 형식을 확인해주세요.`);
      continue;
    }

    const validation = field.validation;
    if (!validation) {
      continue;
    }

    if (
      typeof value === 'string' &&
      validation.allowedValues &&
      !validation.allowedValues.includes(value)
    ) {
      errors.push(`${field.label}${topicParticle(field.label)} 허용된 값 중 하나로 선택해주세요.`);
    }

    if (
      Array.isArray(value) &&
      validation.allowedValues &&
      value.some((item) => typeof item !== 'string' || !validation.allowedValues?.includes(item))
    ) {
      errors.push(`${field.label}${topicParticle(field.label)} 허용된 값 중 하나로 선택해주세요.`);
    }

    if (
      Array.isArray(value) &&
      typeof validation.minItems === 'number' &&
      value.length < validation.minItems
    ) {
      errors.push(`${field.label}${topicParticle(field.label)} 하나 이상 선택해주세요.`);
    }

    if (typeof value === 'number') {
      if (validation.integer && !Number.isInteger(value)) {
        errors.push(`${field.label}은 정수로 입력해주세요.`);
      }

      if (typeof validation.min === 'number' && value < validation.min) {
        errors.push(`${field.label}는 ${validation.min} 이상으로 입력해주세요.`);
      }

      if (typeof validation.max === 'number' && value > validation.max) {
        errors.push(`${field.label}는 ${validation.max} 이하로 입력해주세요.`);
      }
    }

    if (
      typeof value === 'string' &&
      typeof validation.maxLength === 'number' &&
      value.length > validation.maxLength
    ) {
      errors.push(`${field.label}은 ${validation.maxLength}자 이하로 입력해주세요.`);
    }

    if (
      typeof value === 'string' &&
      validation.pattern &&
      !new RegExp(validation.pattern).test(value)
    ) {
      errors.push(`${field.label} 형식을 확인해주세요.`);
    }

    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      validation.requiredKeys?.some((key) => !(key in value))
    ) {
      errors.push(`${field.label} 형식을 확인해주세요.`);
    }

    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      validation.requireAtLeastOneTruthyKey &&
      validation.requiredKeys?.every((key) => !Boolean(value[key as keyof typeof value]))
    ) {
      errors.push(`${field.label}${topicParticle(field.label)} 하나 이상 선택해주세요.`);
    }
  }

  return errors;
}

export function normalizeBrowserLocalToolInput(
  toolId: string,
  parsedValues: Record<string, unknown>,
): Record<string, unknown> {
  const tool = browserLocalToolCatalog.find((catalogItem) => catalogItem.id === toolId);

  if (!tool) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(tool.inputSchema.fields)
      .filter(([fieldName]) => parsedValues[fieldName] !== undefined)
      .map(([fieldName, field]) => [
        fieldName,
        normalizeParsedToolValue(parsedValues[fieldName], field),
      ]),
  );
}

function normalizeParsedToolValue(value: unknown, field: ToolSchemaField): unknown {
  if (value === null) {
    return null;
  }

  if (field.type === 'number') {
    return normalizeParsedNumber(value);
  }

  if (field.type === 'boolean') {
    return normalizeParsedBoolean(value);
  }

  if (field.type === 'array') {
    return normalizeParsedArray(value);
  }

  if (field.type === 'object') {
    return normalizeParsedObject(value, field.validation?.requiredKeys);
  }

  if (typeof value === 'string') {
    const normalizedString = value.trim();

    return field.validation?.allowedValues?.includes(normalizedString)
      ? normalizedString
      : value;
  }

  return value;
}

function normalizeParsedNumber(value: unknown): unknown {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value !== 'string' || !value.trim()) {
    return value;
  }

  const parsedNumber = Number(value.trim());

  return Number.isFinite(parsedNumber) ? parsedNumber : value;
}

function normalizeParsedBoolean(value: unknown): unknown {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (['true', '1', 'yes', 'on'].includes(normalizedValue)) {
    return true;
  }

  if (['false', '0', 'no', 'off'].includes(normalizedValue)) {
    return false;
  }

  return value;
}

function normalizeParsedArray(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return [];
  }

  try {
    const parsedJson = JSON.parse(trimmedValue);

    if (Array.isArray(parsedJson)) {
      return parsedJson;
    }
  } catch {
    // 쉼표 구분 설정값은 JSON이 아니어도 공유 링크에서 흔히 쓰인다.
  }

  return trimmedValue
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeParsedObject(
  value: unknown,
  requiredKeys: readonly string[] | undefined,
): unknown {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return value;
  }

  try {
    const parsedJson = JSON.parse(trimmedValue);

    if (parsedJson && typeof parsedJson === 'object' && !Array.isArray(parsedJson)) {
      return parsedJson;
    }
  } catch {
    // JSON 객체가 아닌 경우 requiredKeys 기반 선택 목록으로 정규화한다.
  }

  if (!requiredKeys?.length) {
    return value;
  }

  const enabledKeys = new Set(
    trimmedValue
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );

  return Object.fromEntries(requiredKeys.map((key) => [key, enabledKeys.has(key)]));
}

function isBlankInput(value: unknown) {
  return value === undefined || value === null || (typeof value === 'string' && !value.trim());
}

function matchesSchemaFieldType(value: unknown, type: ToolFieldType) {
  if (type === 'array') {
    return Array.isArray(value);
  }

  if (type === 'object') {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  return typeof value === type;
}

function topicParticle(label: string) {
  const lastCharacter = label.trim().at(-1);

  if (!lastCharacter) {
    return '는';
  }

  const codePoint = lastCharacter.codePointAt(0);
  const hangulBase = 0xac00;
  const hangulEnd = 0xd7a3;

  if (codePoint === undefined || codePoint < hangulBase || codePoint > hangulEnd) {
    return '는';
  }

  return (codePoint - hangulBase) % 28 === 0 ? '는' : '은';
}
