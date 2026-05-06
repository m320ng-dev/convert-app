export type HtmlEntityCodecMode = 'escape' | 'unescape';

const escapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const namedEntityMap: Record<string, string> = {
  amp: '&',
  apos: "'",
  copy: '©',
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
};

export function encodeHtmlEntities(value: string) {
  return value.replace(/[&<>"']/g, (character) => escapeMap[character]);
}

export function decodeHtmlEntities(value: string) {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z][a-z\d]+);/gi, (entity, body: string) => {
    if (body.toLowerCase().startsWith('#x')) {
      const codePoint = Number.parseInt(body.slice(2), 16);

      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : entity;
    }

    if (body.startsWith('#')) {
      const codePoint = Number.parseInt(body.slice(1), 10);

      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : entity;
    }

    return namedEntityMap[body.toLowerCase()] ?? entity;
  });
}

export function convertHtmlEntityText(value: string, mode: HtmlEntityCodecMode) {
  switch (mode) {
    case 'escape':
      return encodeHtmlEntities(value);
    case 'unescape':
      return decodeHtmlEntities(value);
  }
}
