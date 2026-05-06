export interface StringCaseResult {
  camelCase: string;
  pascalCase: string;
  snakeCase: string;
  kebabCase: string;
  constantCase: string;
}

export function splitStringCaseWords(value: string): string[] {
  return value
    .trim()
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Za-z])([0-9])/g, '$1 $2')
    .replace(/([0-9])([A-Za-z])/g, '$1 $2')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
}

export function convertStringCases(value: string): StringCaseResult {
  const words = splitStringCaseWords(value);

  if (words.length === 0) {
    return {
      camelCase: '',
      pascalCase: '',
      snakeCase: '',
      kebabCase: '',
      constantCase: '',
    };
  }

  const pascalWords = words.map(capitalizeWord);

  return {
    camelCase: [words[0], ...pascalWords.slice(1)].join(''),
    pascalCase: pascalWords.join(''),
    snakeCase: words.join('_'),
    kebabCase: words.join('-'),
    constantCase: words.join('_').toUpperCase(),
  };
}

function capitalizeWord(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
