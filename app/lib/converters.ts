export interface Converter {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  category: string;
  path: string;
}

export const converters: Converter[] = [
  {
    id: "html-to-markdown",
    title: "HTML → Markdown 변환기",
    shortTitle: "HTML → MD",
    description: "HTML 문서를 Markdown 형식으로 변환합니다.",
    category: "문서",
    path: "/converters/html-to-markdown",
  },
  {
    id: "js-beautifier",
    title: "JavaScript 코드 정리",
    shortTitle: "JS 정리",
    description: "압축되거나 흐트러진 JavaScript 코드를 읽기 좋게 정리합니다.",
    category: "코드",
    path: "/converters/js-beautifier",
  },
  {
    id: "json-formatter",
    title: "JSON 포맷터",
    shortTitle: "JSON",
    description: "JSON 데이터 정리, 압축, 유효성 확인을 빠르게 처리합니다.",
    category: "데이터",
    path: "/converters/json-formatter",
  },
  {
    id: "sql-formatter",
    title: "SQL 쿼리 포맷터",
    shortTitle: "SQL",
    description: "SQL 쿼리의 줄바꿈과 들여쓰기를 일관되게 정리합니다.",
    category: "코드",
    path: "/converters/sql-formatter",
  },
  {
    id: "svg-to-react",
    title: "SVG → React 변환기",
    shortTitle: "SVG → React",
    description: "SVG 마크업을 React 컴포넌트 코드로 변환합니다.",
    category: "코드",
    path: "/converters/svg-to-react",
  },
  {
    id: "timestamp-converter",
    title: "Unix Timestamp ↔ 날짜",
    shortTitle: "Timestamp",
    description: "Unix timestamp와 일반 날짜 형식을 상호 변환합니다.",
    category: "시간",
    path: "/converters/timestamp-converter",
  },
  {
    id: "image-to-base64",
    title: "이미지 → Base64 변환기",
    shortTitle: "이미지 → B64",
    description: "이미지 파일을 Base64 문자열로 변환합니다.",
    category: "이미지",
    path: "/converters/image-to-base64",
  },
  {
    id: "base64-to-image",
    title: "Base64 → 이미지 변환기",
    shortTitle: "B64 → 이미지",
    description: "Base64 문자열을 이미지로 복원하고 미리봅니다.",
    category: "이미지",
    path: "/converters/base64-to-image",
  },
  {
    id: "base64-converter",
    title: "Base64 인코더/디코더",
    shortTitle: "Base64",
    description: "텍스트와 Base64 문자열을 양방향으로 변환합니다.",
    category: "데이터",
    path: "/converters/base64-converter",
  },
  {
    id: "hash-generator",
    title: "Hash 생성기",
    shortTitle: "Hash",
    description: "MD5, SHA-1, SHA-256 등 해시 값을 생성합니다.",
    category: "보안",
    path: "/converters/hash-generator",
  },
  {
    id: "ip-geolocation",
    title: "IP → 위치정보 변환기",
    shortTitle: "IP 위치",
    description: "IP 주소의 국가, 도시, 좌표 정보를 조회합니다.",
    category: "네트워크",
    path: "/converters/ip-geolocation",
  },
  {
    id: "markdown-viewer",
    title: "Markdown 뷰어",
    shortTitle: "Markdown",
    description: "Markdown 문서를 작성하면서 실시간으로 미리봅니다.",
    category: "문서",
    path: "/converters/markdown-viewer",
  },
];

export const converterCategories = Array.from(
  new Set(converters.map((converter) => converter.category)),
);
