'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { CopyResultAction } from '@/app/components/copy-result-action';
import {
  appShellStatusItems,
  selectedToolWorkspaceRegions,
  toolSelectionEntryPoints,
} from '@/app/lib/app-shell';
import { buildShareableToolLink } from '@/app/lib/shareable-tool-link';
import { getToolByPath, getToolNavigationItems } from '@/app/lib/tool-registry';

export function ToolWorkspaceShell({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const activeTool = getToolByPath(pathname);
  const toolNavigationItems = getToolNavigationItems();
  const workspaceRegion = selectedToolWorkspaceRegions.find(
    (region) => region.id === 'tool-workspace',
  );
  const switcherEntry = toolSelectionEntryPoints.find(
    (entry) => entry.id === 'switch-workspace-tool',
  );
  const buildCurrentShareLink = () => {
    if (!activeTool || typeof window === 'undefined') {
      return null;
    }

    return buildShareableToolLink({
      origin: window.location.origin,
      path: activeTool.path,
      toolId: activeTool.id,
      config: {},
    });
  };

  return (
    <div className="app-shell-main app-shell-container app-workspace-grid">
      <div className="app-stack min-w-0">
        <section
          id="tool-context"
          aria-labelledby="tool-context-heading"
          className="app-panel app-panel-hero app-panel-body"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
                Selected tool
              </p>
              <h1
                id="tool-context-heading"
                className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl"
              >
                {activeTool?.title ?? '도구 작업 영역'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                {activeTool?.description ??
                  '선택한 도구의 입력, 옵션, 결과를 한 화면에서 처리합니다.'}
              </p>
            </div>

            {activeTool && (
              <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                <span
                  className={`grid h-10 min-w-10 place-items-center rounded-lg px-2 ${activeTool.accent} text-xs font-bold text-white shadow-sm ring-1 ring-black/5`}
                >
                  {activeTool.shortcut}
                </span>
                <span className="app-chip rounded-lg">
                  {activeTool.group}
                </span>
              </div>
            )}
          </div>
        </section>

        <section
          id="tool-workspace"
          aria-label={workspaceRegion?.label ?? '작업 영역'}
          className="min-w-0 scroll-mt-28"
        >
          {children}
        </section>
      </div>

      <aside
        id="tool-assurance"
        aria-labelledby="tool-assurance-heading"
        className="app-stack min-w-0 lg:sticky lg:top-32 lg:self-start"
      >
        <section className="app-panel app-panel-flat app-panel-body">
          <p className="app-kicker text-slate-500">
            Workspace
          </p>
          <h2
            id="tool-assurance-heading"
            className="mt-2 text-lg font-semibold tracking-tight text-slate-950"
          >
            로컬 작업 기준
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            민감한 입력값은 저장하지 않고, 결과가 준비된 도구는 바로 복사할 수 있도록 구성합니다.
          </p>

          {activeTool && (
            <div className="mt-4">
              <CopyResultAction
                value={buildCurrentShareLink}
                label="설정 링크 복사"
                ariaLabel={`${activeTool.title} 설정 링크 복사`}
                copiedMessage="민감한 입력값 없이 설정 링크를 복사했습니다."
                emptyMessage="복사할 설정 링크가 없습니다."
                className="w-full justify-center"
              />
            </div>
          )}

          <div className="mt-5 grid gap-2">
            {appShellStatusItems.map((item) => (
              <div
                key={item.label}
                className="app-stat-row"
              >
                <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-blue-700">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section
          id="workspace-tool-switcher"
          aria-labelledby="workspace-tool-switcher-heading"
          className="app-panel app-panel-flat app-panel-body scroll-mt-28"
        >
          <p className="app-kicker text-slate-500">
            Tool switcher
          </p>
          <h2
            id="workspace-tool-switcher-heading"
            className="mt-2 text-lg font-semibold tracking-tight text-slate-950"
          >
            {switcherEntry?.label ?? '다른 도구 선택'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {switcherEntry?.description ??
              '현재 작업 흐름을 유지하면서 필요한 도구 작업 영역으로 이동합니다.'}
          </p>

          <div className="mt-4 grid gap-2">
            {toolNavigationItems.slice(0, 8).map((tool) => {
              const isActive = tool.id === activeTool?.id;

              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`app-button min-w-0 justify-start ${
                    isActive ? 'app-button-primary' : 'app-button-secondary'
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-md text-[0.68rem] font-bold ${
                      isActive ? 'bg-white/15 text-white' : `${tool.accent} text-white`
                    }`}
                  >
                    {tool.shortcut}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{tool.label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      </aside>
    </div>
  );
}
