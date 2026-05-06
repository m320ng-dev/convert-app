import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const regexPageSource = readFileSync(
  resolve(import.meta.dirname, '../converters/regex-tester/page.tsx'),
  'utf8',
);

test('regex tester exposes explicit pattern, test text, and selectable flag controls', () => {
  assert.match(regexPageSource, /htmlFor="regex-pattern"/);
  assert.match(regexPageSource, /id="regex-pattern"/);
  assert.match(regexPageSource, /<TextToolInput/);
  assert.match(regexPageSource, /id="regex-test-text"/);
  assert.match(regexPageSource, /label="테스트 텍스트"/);
  assert.match(regexPageSource, /onValueChange=\{setTestText\}/);
  assert.match(regexPageSource, /<fieldset/);
  assert.match(regexPageSource, /<legend[^>]*>Regex flags<\/legend>/);

  for (const flagKey of ['global', 'ignoreCase', 'multiline', 'dotAll', 'unicode', 'sticky']) {
    assert.match(regexPageSource, new RegExp(`checked=\\{flags\\[flag\\.key\\]\\}`));
    assert.match(regexPageSource, new RegExp(`handleFlagChange\\(flag\\.key\\)`));
    assert.match(regexPageSource, new RegExp(`key: '${flagKey}'`));
  }
});

test('regex tester allows direct regex flag input in addition to selectable controls', () => {
  assert.match(regexPageSource, /htmlFor="regex-flags-input"/);
  assert.match(regexPageSource, /id="regex-flags-input"/);
  assert.match(regexPageSource, /value=\{enabledFlags\}/);
  assert.match(regexPageSource, /onChange=\{\(event\) => setEnabledFlags\(event\.target\.value\)\}/);
  assert.match(regexPageSource, /placeholder="예: gim"/);
  assert.match(regexPageSource, /aria-describedby=\{isFlagsInvalid \? 'regex-validation-error regex-flags-help' : 'regex-flags-help'\}/);
  assert.match(regexPageSource, /id="regex-flags-help"/);
});

test('regex tester marks invalid pattern and flag fields with an accessible validation alert', () => {
  assert.match(regexPageSource, /const isPatternInvalid = errorField === 'pattern'/);
  assert.match(regexPageSource, /const isFlagsInvalid = errorField === 'flags'/);
  assert.match(regexPageSource, /aria-invalid=\{isPatternInvalid\}/);
  assert.match(regexPageSource, /aria-invalid=\{isFlagsInvalid\}/);
  assert.match(regexPageSource, /id="regex-validation-error"/);
  assert.match(regexPageSource, /aria-describedby=\{isPatternInvalid \? 'regex-validation-error' : undefined\}/);
  assert.match(regexPageSource, /aria-describedby=\{isFlagsInvalid \? 'regex-validation-error regex-flags-help' : 'regex-flags-help'\}/);
});

test('regex tester displays total regex match count from the result model', () => {
  assert.match(regexPageSource, /총 일치 수/);
  assert.match(regexPageSource, /result\.matchCount/);
});

test('regex tester highlights matched segments in the output preview', () => {
  assert.match(regexPageSource, /buildRegexHighlightedSegments\(testText, result\.matches\)/);
  assert.match(regexPageSource, /Matched segments/);
  assert.match(regexPageSource, /segment\.type === 'match'/);
  assert.match(regexPageSource, /<mark/);
  assert.match(regexPageSource, /title=\{`\$\{segment\.index\}-\$\{segment\.endIndex\}`\}/);
});

test('regex tester displays captured groups within each rendered match card', () => {
  assert.match(regexPageSource, /result\.matches\.map\(\(match, index\) => \(/);
  assert.match(regexPageSource, /match\.groups\.length > 0/);
  assert.match(regexPageSource, /match\.groups\.map\(\(group, groupIndex\) => \(/);
  assert.match(
    regexPageSource,
    /match\.groups\.length > 0[\s\S]*Match \{index \+ 1\} 캡처 그룹/,
  );
  assert.match(regexPageSource, /Group \{groupIndex \+ 1\}/);
  assert.match(regexPageSource, /\{group \|\| '\(empty\)'\}/);
});

test('regex tester scopes captured group details to each match result', () => {
  assert.match(regexPageSource, /id=\{`regex-match-\$\{index \+ 1\}-groups-title`\}/);
  assert.match(regexPageSource, /aria-labelledby=\{`regex-match-\$\{index \+ 1\}-groups-title`\}/);
  assert.match(regexPageSource, /Match \{index \+ 1\} 캡처 그룹/);
  assert.match(regexPageSource, /Group \{groupIndex \+ 1\}/);
  assert.match(regexPageSource, /data-regex-match-index=\{index \+ 1\}/);
  assert.match(regexPageSource, /data-regex-group-index=\{groupIndex \+ 1\}/);
});
