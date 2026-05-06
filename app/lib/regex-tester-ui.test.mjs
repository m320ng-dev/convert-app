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
  assert.match(regexPageSource, /htmlFor="regex-test-text"/);
  assert.match(regexPageSource, /id="regex-test-text"/);
  assert.match(regexPageSource, /<fieldset/);
  assert.match(regexPageSource, /<legend[^>]*>Regex flags<\/legend>/);

  for (const flagKey of ['global', 'ignoreCase', 'multiline', 'dotAll', 'unicode', 'sticky']) {
    assert.match(regexPageSource, new RegExp(`checked=\\{flags\\[flag\\.key\\]\\}`));
    assert.match(regexPageSource, new RegExp(`handleFlagChange\\(flag\\.key\\)`));
    assert.match(regexPageSource, new RegExp(`key: '${flagKey}'`));
  }
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
    /match\.groups\.length > 0[\s\S]*<p className="text-xs font-semibold uppercase tracking-\[0\.12em\] text-slate-500">\s*캡처 그룹\s*<\/p>/,
  );
  assert.match(regexPageSource, /\$\{groupIndex \+ 1\}: \{group \|\| '\(empty\)'\}/);
});
