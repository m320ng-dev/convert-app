'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { converterGroups, converters } from '../lib/converters';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentTool = converters.find((converter) => converter.path === pathname);
  const pageTitle = currentTool?.title ?? '개발자 변환 도구';
  const pageDescription =
    currentTool?.description ?? '자주 쓰는 변환 작업을 한 화면에서 빠르게 실행합니다.';
  const closeDrawer = () => setIsOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="lg:hidden">
        <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur">
          <Link href="/" className="text-sm font-bold tracking-tight text-slate-950">
            DevTools
          </Link>
          <button
            type="button"
            aria-label="사이드바 열기"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm"
          >
            <span className="sr-only">메뉴</span>
            <span className="block h-0.5 w-5 bg-current before:relative before:-top-1.5 before:block before:h-0.5 before:w-5 before:bg-current after:relative after:top-1 after:block after:h-0.5 after:w-5 after:bg-current" />
          </button>
        </div>
      </div>

      {isOpen && (
        <button
          type="button"
          aria-label="사이드바 닫기"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <Link href="/" onClick={closeDrawer} className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white">
              DT
            </span>
            <span>
              <span className="block text-sm font-bold tracking-tight text-slate-950">
                DevTools
              </span>
              <span className="block text-xs text-slate-500">Developer utilities</span>
            </span>
          </Link>
          <button
            type="button"
            aria-label="사이드바 닫기"
            onClick={() => setIsOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            X
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <Link
            href="/"
            onClick={closeDrawer}
            className={`mb-3 flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition ${
              pathname === '/'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <span>홈</span>
            <span className="text-xs opacity-70">Overview</span>
          </Link>

          {converterGroups.map((group) => (
            <div key={group} className="mt-5 first:mt-0">
              <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {group}
              </div>
              <div className="space-y-1">
                {converters
                  .filter((converter) => converter.group === group)
                  .map((converter) => {
                    const isActive = pathname === converter.path;

                    return (
                      <Link
                        key={converter.id}
                        href={converter.path}
                        onClick={closeDrawer}
                        className={`flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition ${
                          isActive
                            ? 'bg-slate-950 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                        }`}
                      >
                        <span className="truncate">{converter.shortTitle}</span>
                        {isActive && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 text-xs text-slate-500">
          <div className="flex items-center justify-between">
            <a href="https://heyo.me/contact" className="hover:text-slate-950">
              Contact
            </a>
            <a
              href="https://github.com/m320ng"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-950"
            >
              GitHub
            </a>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <main className="dashboard-content px-4 pb-10 pt-24 sm:px-6 lg:px-8 lg:pt-8">
          <div className="mx-auto max-w-7xl">
            <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  DevTools
                </p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  {pageTitle}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  {pageDescription}
                </p>
              </div>
              <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
                {converters.length}개 도구
              </div>
            </header>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
