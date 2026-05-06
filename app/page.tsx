'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Braces,
  Code,
  Database,
  Clock,
  Eye,
  File,
  FileText,
  Hash,
  Image,
  KeyRound,
  Link as LinkIcon,
  LocateFixed,
  QrCode,
  ShieldCheck,
  Text,
  Type,
  type LucideIcon,
} from 'lucide-react';

import { browserLocalToolCatalog } from './lib/converters';
import { tools } from './lib/tool-registry';

const browserLocalToolIds = browserLocalToolCatalog.map((converter) => converter.id);

const toolCategories = Array.from(
  new Set(tools.map((converter) => converter.group)),
);

type ToolCategoryFilter = 'all' | (typeof toolCategories)[number];

const categoryFilterItems: {
  id: ToolCategoryFilter;
  label: string;
  href: string;
}[] = [
  { id: 'all', label: '전체', href: '#tools' },
  ...toolCategories.map((category) => ({
    id: category,
    label: category,
    href: `#category-${category}`,
  })),
];

const categoryAnchorToolIds = new Set(
  toolCategories
    .map((category) => tools.find((converter) => converter.group === category)?.id)
    .filter(Boolean),
);

const toolBadgeIcons: Record<string, LucideIcon> = {
  'html-to-markdown': FileText,
  'js-beautifier': Code,
  'json-formatter': Braces,
  'sql-formatter': Database,
  'svg-to-react': Code,
  'timestamp-converter': Clock,
  'csv-json-converter': File,
  'yaml-json-converter': FileText,
  'image-to-base64': Image,
  'base64-to-image': Image,
  'base64-converter': FileText,
  'html-entity-escaper': File,
  'url-encoder-decoder': LinkIcon,
  'regex-tester': Type,
  'env-validator': ShieldCheck,
  'random-token-generator': KeyRound,
  'uuid-ulid-generator': Hash,
  'qr-code-generator': QrCode,
  'string-case-converter': Text,
  'jwt-decoder': KeyRound,
  'hash-generator': Hash,
  'ip-geolocation': LocateFixed,
  'markdown-viewer': Eye,
};

const fallbackIcon = File;

function getToolBadgeIcon(toolId: string): LucideIcon {
  return toolBadgeIcons[toolId] ?? fallbackIcon;
}

function getFilteredTools(activeCategory: ToolCategoryFilter) {
  if (activeCategory === 'all') {
    return tools;
  }

  return tools.filter((converter) => converter.group === activeCategory);
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<ToolCategoryFilter>('all');
  const visibleTools = getFilteredTools(activeCategory);

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium text-slate-500">등록된 도구</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            {browserLocalToolIds.length}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium text-slate-500">카테고리</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            {toolCategories.length}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium text-slate-500">작업 방식</p>
          <p className="mt-1 text-base font-semibold text-slate-950">브라우저 중심</p>
          <p className="text-xs text-slate-500">대부분의 변환은 로컬에서 처리됩니다.</p>
        </div>
      </section>

      <section id="tools" className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">전체 도구</h2>
          <p className="mt-1 text-sm text-slate-500">
            브라우저에서 로컬로 실행되는 도구이며, 필요한 변환 작업으로 바로 이동합니다.
          </p>

          <div aria-label="도구 카테고리 필터" className="mt-4 flex flex-wrap gap-2" role="group">
            <a
              href="#tools"
              role="button"
              aria-pressed={activeCategory === 'all'}
              onClick={() => setActiveCategory('all')}
              className="app-button app-button-primary w-full sm:w-auto"
            >
              전체
            </a>
            {categoryFilterItems.slice(1).map((item) => (
              <a
                key={item.id}
                href={item.href}
                role="button"
                aria-pressed={activeCategory === item.id}
                onClick={() => setActiveCategory(item.id)}
                className="app-button app-button-secondary w-full sm:w-auto"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div className="app-tool-list grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {visibleTools.map((converter) => {
            const BadgeIcon = getToolBadgeIcon(converter.id);

            return (
              <Link
                key={converter.id}
                href={converter.href}
                id={categoryAnchorToolIds.has(converter.id) ? `category-${converter.group}` : undefined}
                aria-label={`${converter.title}: ${converter.description}`}
                data-tool-id={converter.id}
                data-local-only={converter.localOnly}
                data-tool-status={converter.status}
                data-interaction-state={converter.interactionState}
                data-usage-rank={converter.usageRank}
                className="app-tool-row group"
              >
                <div className="flex min-w-0 items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`app-tool-row-icon ${converter.accent}`} aria-hidden="true">
                      <BadgeIcon size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="app-tool-row-eyebrow">{converter.group}</p>
                      <h3 className="app-tool-row-title">
                        {converter.title}
                      </h3>
                    </div>
                  </div>
                  <span className="app-tool-row-action">
                    열기
                  </span>
                </div>
                <p className="app-tool-row-description">{converter.description}</p>
                <div className="app-tool-row-status">
                  <span>{converter.statusLabel}</span>
                  <span>브라우저 로컬</span>
                  <span>복사 지원</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
