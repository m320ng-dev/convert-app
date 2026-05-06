# 브라우저 로컬 도구 카탈로그 확장 계획

## 목표

브라우저 안에서 처리 가능한 개발자 유틸리티를 빠르게 늘린다. 우선 포함 도구는 토큰 생성, UUID/ULID, URL 인코딩/디코딩, JWT 디코딩, Regex 테스트, 문자열 케이스 변환, QR 생성이다.

## 범위

- 기존 `/converters/...` 라우팅 구조를 유지한다.
- 도구 그룹은 `보안`, `API`, `유틸리티` 등 새 분류를 허용한다.
- 각 도구는 최소 기본형으로 구현한다: 입력 처리, 결과 출력, 복사 버튼, 기본 오류 메시지.
- 외부 API 호출이나 서버 프록시가 필요한 도구는 이번 범위에서 제외한다.

## 우선 카탈로그

| 우선순위 | id | 이름 | 분류 | 라우트 |
| --- | --- | --- | --- | --- |
| 1 | `random-token-generator` | 토큰 생성기 | 보안 | `/converters/random-token-generator` |
| 2 | `uuid-ulid-generator` | UUID/ULID 생성기 | 유틸리티 | `/converters/uuid-ulid-generator` |
| 3 | `url-encoder-decoder` | URL 인코더/디코더 | API | `/converters/url-encoder-decoder` |
| 4 | `jwt-decoder` | JWT 디코더 | API | `/converters/jwt-decoder` |
| 5 | `regex-tester` | Regex 테스트 도구 | API | `/converters/regex-tester` |
| 6 | `string-case-converter` | 문자열 케이스 변환기 | 유틸리티 | `/converters/string-case-converter` |
| 7 | `qr-code-generator` | QR 코드 생성기 | 유틸리티 | `/converters/qr-code-generator` |
| 8 | `json-formatter` | JSON 포맷터 | 데이터 | `/converters/json-formatter` |
| 9 | `base64-converter` | Base64 인코더/디코더 | 텍스트 | `/converters/base64-converter` |
| 10 | `timestamp-converter` | Unix Timestamp ↔ 날짜 | 데이터 | `/converters/timestamp-converter` |
| 11 | `sql-formatter` | SQL 쿼리 포맷터 | 코드 | `/converters/sql-formatter` |
| 12 | `svg-to-react` | SVG → React 변환기 | 코드 | `/converters/svg-to-react` |

## 확정 카탈로그 스키마

기존 도구 목록은 `app/lib/converters.ts`의 `converters` 배열이며, 화면 제목, 홈 목록, 사이드바 그룹은 이 배열을 기준으로 동작한다. 브라우저 로컬 도구의 실행 메타데이터는 같은 파일의 `browserLocalToolCatalog`에 둔다.

신규 개발자용 도구는 다음 필드를 만족해야 한다.

- `id`: 소문자 영문, 숫자, 하이픈만 사용한다.
- `title`, `shortTitle`, `description`: 목록과 실행 화면에 표시할 한글 문구를 둔다.
- `path`: 기존 구조를 유지해 `/converters/{id}` 형식으로 둔다.
- `group`: 기존 분류와 새 분류인 `보안`, `API`, `유틸리티` 중 프로젝트 성격에 맞는 값을 둔다.
- `priority`: 사용 빈도 기준 우선순위이며 중복 없이 오름차순으로 정렬한다.
- `localOnly`: 브라우저 로컬 처리 도구만 `true`로 등록한다.
- `inputSchema.fields`: 입력 필드의 `type`, `label`, 선택적 `required`를 명시한다.
- `outputSchema.fields`: 결과 필드의 `type`, `label`, 선택적 `required`를 명시한다.
- `copyFormats`: 결과 복사 형식을 하나 이상 두고, 기본 복사 형식은 `primary: true` 하나만 둔다.
- `hasCopyButton`: 결과 복사 버튼을 제공하는 도구만 `true`로 등록한다.
- `errorHandling`: 빈 입력, 파싱 실패, 생성 실패 등 기본 오류 처리 방식을 한글 문장으로 둔다.

`app/lib/tool-registry.ts`는 `browserLocalToolCatalog`를 사용해 홈 카드의 `href`, `label`, 사용 순서, 단축 표시를 생성한다. 따라서 새 도구를 추가할 때는 `converters` 등록, `catalogMetadataById` 메타데이터, `/converters/.../page.tsx` 실행 화면이 함께 있어야 한다.

## 구현 순서

1. 공용 복사 액션과 도구 레지스트리 누락을 보완한다.
2. 브라우저 로컬 처리용 순수 유틸 함수를 추가한다.
3. 신규 도구 페이지를 추가하고 기존 목록에 등록한다.
4. 테스트, 린트, 빌드로 확인한다.

## 검증

- 신규/기존 도구 목록 테스트
- JWT, Regex, 랜덤 토큰 등 순수 함수 테스트
- `npm run lint`
- `npm run build`
