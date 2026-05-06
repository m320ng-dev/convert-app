import test from 'node:test';
import assert from 'node:assert/strict';

import { convertCodeToCurl } from './code-to-curl.ts';
import { generateCodeFromCurl } from './curl-to-code.ts';

test('focused developer conversion success cases produce copyable output strings', () => {
  const curlResult = convertCodeToCurl(
    `await fetch("https://api.example.com/releases?channel=stable", {
      method: "PATCH",
      headers: {
        "Authorization": "Bearer secret-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ version: "2026.05", active: true })
    });`,
    {
      language: 'javascript-fetch',
      multiline: false,
      redactSensitiveValues: true,
      followRedirects: true,
    },
  );

  assert.equal(
    curlResult.command,
    `curl -X PATCH 'https://api.example.com/releases?channel=stable' -H 'Authorization: <AUTHORIZATION_VALUE>' -H 'Content-Type: application/json' --data-raw '{"version":"2026.05","active":true}' --location`,
  );
  assert.equal(curlResult.summary, 'PATCH https://api.example.com/releases?channel=stable');
  assert.equal(curlResult.warnings.some((warning) => warning.includes('Authorization')), true);

  const codeResult = generateCodeFromCurl(
    `curl --request POST "https://api.example.com/releases" \
      -H "Content-Type: application/json" \
      --data-raw '{"version":"2026.05","active":true}'`,
    {
      language: 'python-requests',
      includeTimeout: false,
      includeComments: false,
    },
  );

  assert.match(codeResult.code, /import requests/);
  assert.match(codeResult.code, /method="POST"/);
  assert.match(codeResult.code, /json=payload/);
  assert.doesNotMatch(codeResult.code, /timeout=/);
  assert.equal(codeResult.summary, 'POST https://api.example.com/releases');
});

test('focused developer conversion validation failures show clear Korean errors', () => {
  assert.throws(
    () =>
      convertCodeToCurl(
        `requests.get("https://api.example.com/releases", timeout=0)`,
        { language: 'python-requests' },
      ),
    /timeout 값은 1초 이상의 숫자여야 합니다/,
  );

  assert.throws(
    () =>
      convertCodeToCurl(
        `GET /releases HTTP/1.1
Host: api.example.com
Bad Header
`,
        { language: 'http' },
      ),
    /HTTP 헤더는 "이름: 값" 형식이어야 합니다/,
  );

  assert.throws(
    () =>
      generateCodeFromCurl(
        `curl -X P0ST https://api.example.com/releases`,
        { language: 'javascript-fetch' },
      ),
    /HTTP 메서드는 영문자로 입력해주세요/,
  );
});

test('focused developer conversion unsupported patterns return actionable Korean errors', () => {
  assert.throws(
    () =>
      convertCodeToCurl(
        `axios.post("https://api.example.com/releases", { version: "2026.05" })`,
        { language: 'auto' },
      ),
    /axios 요청 패턴은 아직 지원하지 않습니다/,
  );

  assert.throws(
    () =>
      convertCodeToCurl(
        `httpx.post("https://api.example.com/releases", json={"active": True})`,
        { language: 'auto' },
      ),
    /Python httpx 요청 패턴은 아직 지원하지 않습니다/,
  );

  assert.throws(
    () =>
      convertCodeToCurl(
        `const request = new XMLHttpRequest(); request.open("GET", "https://api.example.com/releases");`,
        { language: 'auto' },
      ),
    /XMLHttpRequest 패턴은 아직 지원하지 않습니다/,
  );

  assert.throws(
    () =>
      convertCodeToCurl(
        `fetch(apiUrl, { method: "GET" })`,
        { language: 'javascript-fetch' },
      ),
    /변수 URL 패턴은 아직 지원하지 않습니다/,
  );
});
