export type ShareableConfigValue = string | number | boolean | null | undefined;

export interface BuildShareableToolLinkOptions {
  origin: string;
  path: string;
  toolId: string;
  config?: Record<string, unknown>;
}

const SHAREABLE_CONFIG_KEYS = {
  'random-token-generator': [
    'length',
    'quantity',
    'characterSets',
    'excludeAmbiguous',
    'requireEachSelectedSet',
    'excludeCharacterGroups',
  ],
  'jwt-decoder': [
    'mode',
    'signingAlgorithm',
    'validationAlgorithm',
    'clockToleranceSeconds',
    'verifyExpiration',
    'verifyNotBefore',
    'requireIssuer',
    'requireAudience',
    'requireSubject',
  ],
  'curl-to-code': [
    'language',
    'indentSize',
    'includeComments',
    'includeErrorHandling',
    'includeTimeout',
    'redactSensitiveValues',
  ],
  'code-to-curl': [
    'language',
    'multiline',
    'followRedirects',
    'includeCompressed',
    'redactSensitiveValues',
  ],
  'regex-tester': [
    'flags',
    'global',
    'ignoreCase',
    'multiline',
    'dotAll',
    'unicode',
    'sticky',
  ],
  'env-validator': [
    'allowExport',
    'warnDuplicateKeys',
    'warnEmptyValues',
    'showWarnings',
  ],
} as const satisfies Record<string, readonly string[]>;

const KNOWN_TOOL_IDS = new Set(Object.keys(SHAREABLE_CONFIG_KEYS));

export type ShareableToolId = keyof typeof SHAREABLE_CONFIG_KEYS;

export function getShareableConfigKeys(toolId: string): string[] {
  return [...(SHAREABLE_CONFIG_KEYS[toolId as ShareableToolId] ?? [])];
}

export function buildShareableToolLink({
  origin,
  path,
  toolId,
  config = {},
}: BuildShareableToolLinkOptions): string {
  const url = new URL(normalizeSharePath(path), normalizeOrigin(origin));
  const allowedKeys = getShareableConfigKeys(toolId);

  if (!KNOWN_TOOL_IDS.has(toolId)) {
    return url.toString();
  }

  url.searchParams.set('tool', toolId);

  for (const key of allowedKeys) {
    const value = normalizeConfigValue(config[key]);

    if (value !== null) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

function normalizeOrigin(origin: string): string {
  try {
    return new URL(origin).origin;
  } catch {
    return 'https://convertapp.local';
  }
}

function normalizeSharePath(path: string): string {
  if (!path.startsWith('/')) {
    return '/';
  }

  return path.split(/[?#]/, 1)[0] || '/';
}

function normalizeConfigValue(value: unknown): string | null {
  if (typeof value === 'string') {
    return value.trim() ? value : null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : null;
  }

  if (typeof value === 'boolean') {
    return String(value);
  }

  return null;
}
