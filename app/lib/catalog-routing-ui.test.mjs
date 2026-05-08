import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { browserLocalToolCatalog } from './converters.ts';
import { tools } from './tool-registry.ts';

const appDir = resolve(import.meta.dirname, '..');
const homeSource = readFileSync(resolve(appDir, 'page.tsx'), 'utf8');

test('브라우저 로컬 카탈로그의 모든 도구는 실행 화면 라우트 파일을 가진다', () => {
  for (const tool of browserLocalToolCatalog) {
    const routeFile = resolve(appDir, tool.path.replace(/^\//, ''), 'page.tsx');

    assert.equal(existsSync(routeFile), true, `${tool.id} 실행 화면이 ${tool.path}에 있어야 한다`);
  }
});

test('실행 화면이 있는 모든 변환 도구는 첫 페이지 도구 목록에 노출된다', () => {
  const routeToolIds = readdirSync(resolve(appDir, 'converters'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((toolId) => existsSync(resolve(appDir, 'converters', toolId, 'page.tsx')))
    .sort();
  const listedToolIds = tools.map((tool) => tool.id).sort();

  assert.deepEqual(listedToolIds, routeToolIds);
});

test('홈 선택 UI는 전체 도구 레지스트리를 사용해 실행 화면으로 연결한다', () => {
  assert.match(homeSource, /tools/);
  assert.match(homeSource, /visibleTools\.map\(\(converter\) =>/);
  assert.match(homeSource, /href=\{converter\.href\}/);
  assert.match(homeSource, /data-tool-id=\{converter\.id\}/);
  assert.match(homeSource, /data-local-only=\{converter\.localOnly\}/);
});

test('홈 도구 카드는 클릭 시 신규 도구의 실행 화면 href로 이동한다', () => {
  assert.match(homeSource, /<Link[\s\S]*href=\{converter\.href\}/);

  for (const catalogTool of browserLocalToolCatalog) {
    const cardTool = tools.find((tool) => tool.id === catalogTool.id);

    assert.ok(cardTool, `${catalogTool.id} 카드 항목이 있어야 한다`);
    assert.equal(cardTool.href, catalogTool.path);
    assert.equal(cardTool.href, `/converters/${catalogTool.id}`);
  }
});
