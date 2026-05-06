import { browserLocalToolCatalog } from './converters.ts';

const accents = [
  'bg-slate-950',
  'bg-blue-700',
  'bg-emerald-700',
  'bg-violet-700',
  'bg-amber-700',
  'bg-rose-700',
];

export const tools = browserLocalToolCatalog.map((converter, index) => ({
  ...converter,
  href: converter.path,
  label: converter.shortTitle,
  status: 'active' as const,
  statusLabel: '사용 가능',
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
}));

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
