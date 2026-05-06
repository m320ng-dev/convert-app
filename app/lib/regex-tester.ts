export interface RegexMatchResult {
  value: string;
  index: number;
  endIndex: number;
  groups: string[];
}

export interface RegexTestResult {
  pattern: string;
  flags: string;
  matchCount: number;
  matches: RegexMatchResult[];
}

export interface RegexHighlightedSegment {
  type: 'text' | 'match';
  value: string;
  index: number;
  endIndex: number;
}

export type RegexValidationErrorField = 'pattern' | 'flags' | 'testText';

export function testRegexPattern(
  pattern: string,
  testText: string,
  flags: string,
): {
  result: RegexTestResult | null;
  error: string | null;
  errorField: RegexValidationErrorField | null;
} {
  if (!pattern.trim()) {
    return { result: null, error: 'Regex 패턴을 입력해주세요.', errorField: 'pattern' };
  }

  if (!testText.trim()) {
    return { result: null, error: '테스트 텍스트를 입력해주세요.', errorField: 'testText' };
  }

  try {
    new RegExp('', flags);
  } catch (error) {
    return {
      result: null,
      error: error instanceof Error
        ? `유효하지 않은 Regex 플래그입니다: ${error.message}`
        : '유효하지 않은 Regex 플래그입니다.',
      errorField: 'flags',
    };
  }

  try {
    const regex = new RegExp(pattern, flags);
    const matches: RegexMatchResult[] = [];
    const shouldCollectAll = flags.includes('g');

    while (true) {
      const match = regex.exec(testText);

      if (!match) {
        break;
      }

      const value = match[0];
      const index = match.index;

      matches.push({
        value,
        index,
        endIndex: index + value.length,
        groups: match.slice(1),
      });

      if (!shouldCollectAll) {
        break;
      }

      if (value.length === 0) {
        regex.lastIndex += 1;
      }
    }

    return {
      result: {
        pattern,
        flags,
        matchCount: matches.length,
        matches,
      },
      error: null,
      errorField: null,
    };
  } catch (error) {
    return {
      result: null,
      error: error instanceof Error
        ? `유효하지 않은 Regex 패턴입니다: ${error.message}`
        : '유효하지 않은 Regex 패턴입니다.',
      errorField: 'pattern',
    };
  }
}

export function buildRegexHighlightedSegments(
  text: string,
  matches: RegexMatchResult[],
): RegexHighlightedSegment[] {
  if (matches.length === 0) {
    return [{ type: 'text', value: text, index: 0, endIndex: text.length }];
  }

  const segments: RegexHighlightedSegment[] = [];
  let cursor = 0;

  for (const match of matches) {
    if (match.index > cursor) {
      segments.push({
        type: 'text',
        value: text.slice(cursor, match.index),
        index: cursor,
        endIndex: match.index,
      });
    }

    segments.push({
      type: 'match',
      value: match.value || '(empty)',
      index: match.index,
      endIndex: match.endIndex,
    });

    cursor = Math.max(cursor, match.endIndex);
  }

  if (cursor < text.length) {
    segments.push({
      type: 'text',
      value: text.slice(cursor),
      index: cursor,
      endIndex: text.length,
    });
  }

  return segments;
}

export function formatRegexResult(result: RegexTestResult | null): string {
  if (!result) {
    return '';
  }

  return JSON.stringify(result, null, 2);
}
