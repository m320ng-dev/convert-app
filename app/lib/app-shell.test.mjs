import test from 'node:test';
import assert from 'node:assert/strict';

import {
  appShellNavItems,
  appShellStatusItems,
  selectedToolWorkspaceRegions,
  toolSelectionEntryPoints,
} from './app-shell.ts';

test('first-screen app shell exposes productivity navigation anchors', () => {
  assert.deepEqual(
    appShellNavItems.map((item) => item.label),
    ['도구 탐색', '로컬 처리', '작업 흐름'],
  );

  assert.deepEqual(
    appShellNavItems.map((item) => item.href),
    ['#tools', '#privacy', '#workflow'],
  );

  assert.ok(appShellNavItems.every((item) => item.description.length > 0));
});

test('first-screen app shell communicates local processing status', () => {
  assert.deepEqual(
    appShellStatusItems.map((item) => item.label),
    ['브라우저에서 실행', '저장 없음', '복사 지원'],
  );

  assert.ok(appShellStatusItems.every((item) => item.value.length > 0));
});

test('selected tool workspace exposes primary content regions', () => {
  assert.deepEqual(
    selectedToolWorkspaceRegions.map((region) => region.id),
    ['tool-context', 'tool-workspace', 'tool-assurance'],
  );

  assert.deepEqual(
    selectedToolWorkspaceRegions.map((region) => region.label),
    ['도구 정보', '작업 영역', '로컬 처리 안내'],
  );

  assert.ok(selectedToolWorkspaceRegions.every((region) => region.description.length > 0));
});

test('tool selection entry points route into the workspace or reveal the tool list', () => {
  assert.deepEqual(
    toolSelectionEntryPoints.map((entry) => entry.id),
    ['open-most-used-tool', 'browse-tool-list', 'switch-workspace-tool'],
  );

  assert.equal(toolSelectionEntryPoints[0].href, '/converters/json-formatter');
  assert.equal(toolSelectionEntryPoints[0].targetRegion, 'tool-workspace');
  assert.equal(toolSelectionEntryPoints[0].action, 'route');

  assert.equal(toolSelectionEntryPoints[1].href, '#tools');
  assert.equal(toolSelectionEntryPoints[1].action, 'update-workspace');

  assert.equal(toolSelectionEntryPoints[2].href, '#workspace-tool-switcher');
  assert.equal(toolSelectionEntryPoints[2].targetRegion, 'workspace-tool-switcher');
});
