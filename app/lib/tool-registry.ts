import { browserLocalToolCatalog, converters } from './converters.ts';

const accents = [
  'bg-slate-950',
  'bg-blue-700',
  'bg-emerald-700',
  'bg-violet-700',
  'bg-amber-700',
  'bg-rose-700',
];

const browserLocalToolById = new Map(
  browserLocalToolCatalog.map((tool) => [tool.id, tool]),
);

const toolCapabilitiesById: Record<string, { localOnly: boolean; hasCopyButton: boolean }> = {
  'html-to-markdown': { localOnly: false, hasCopyButton: true },
  'js-beautifier': { localOnly: false, hasCopyButton: true },
  'image-to-base64': { localOnly: true, hasCopyButton: true },
  'base64-to-image': { localOnly: true, hasCopyButton: false },
  'env-validator': { localOnly: true, hasCopyButton: true },
  'ip-geolocation': { localOnly: false, hasCopyButton: true },
  'markdown-viewer': { localOnly: true, hasCopyButton: true },
};

export const tools = converters.map((converter, index) => {
  const browserLocalTool = browserLocalToolById.get(converter.id);
  const capabilities = toolCapabilitiesById[converter.id] ?? {
    localOnly: browserLocalTool?.localOnly ?? false,
    hasCopyButton: browserLocalTool?.hasCopyButton ?? false,
  };

  return {
  ...converter,
  href: converter.path,
  label: converter.shortTitle,
  priority: index + 1,
  status: 'active' as const,
  statusLabel: '사용 가능',
  localOnly: capabilities.localOnly,
  hasCopyButton: capabilities.hasCopyButton,
  interactionState: 'enabled' as const,
  usageRank: index + 1,
  shortcut: converter.shortTitle
    .split(/[\s/→-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase(),
  accent: accents[index % accents.length],
  };
});

export function getToolByPath(pathname: string) {
  return tools.find((tool) => tool.path === pathname) ?? null;
}

export function getToolNavigationItems() {
  return tools.map((tool) => ({
    id: tool.id,
    href: tool.path,
    label: tool.shortTitle,
    accent: tool.accent,
    shortcut: tool.shortcut,
  }));
}
