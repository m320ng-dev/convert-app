export interface Converter {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  path: string;
  group: '텍스트' | '코드' | '데이터' | '이미지' | '네트워크';
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
    id: 'hash-generator',
    title: 'Hash 생성기',
    shortTitle: 'Hash',
    description: 'MD5, SHA-1, SHA-256 등 해시값을 생성합니다.',
    path: '/converters/hash-generator',
    group: '데이터',
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
