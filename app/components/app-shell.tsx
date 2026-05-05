"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { converters } from "@/app/lib/converters";

function getInitials(title: string) {
  return title
    .replace("JavaScript", "JS")
    .replace("Markdown", "MD")
    .replace("Timestamp", "TS")
    .split(/[\s→↔/]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeConverter = converters.find((converter) =>
    pathname.startsWith(converter.path),
  );
  const isHome = pathname === "/";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white/92 px-4 py-5 shadow-sm backdrop-blur xl:block">
        <Link
          href="/"
          className="mb-6 flex items-center gap-3 rounded-lg px-2 py-2"
        >
          <span className="flex size-10 items-center justify-center rounded-lg bg-slate-950 text-sm font-bold text-white">
            DC
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-950">
              Dev Converter
            </span>
            <span className="block text-xs text-slate-500">
              개발자 변환 도구
            </span>
          </span>
        </Link>

        <nav aria-label="주요 메뉴" className="space-y-1">
          <Link
            href="/"
            aria-current={isHome ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isHome
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-current/10 text-xs">
              홈
            </span>
            홈
          </Link>

          <div className="px-3 pb-2 pt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            도구
          </div>

          {converters.map((converter) => {
            const isActive = activeConverter?.id === converter.id;

            return (
              <Link
                key={converter.id}
                href={converter.path}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-white"
                  }`}
                >
                  {getInitials(converter.shortTitle)}
                </span>
                <span className="min-w-0 truncate">{converter.shortTitle}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="xl:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur xl:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-slate-950 text-xs font-bold text-white">
                DC
              </span>
              <span className="text-sm font-semibold text-slate-950">
                Dev Converter
              </span>
            </Link>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {activeConverter?.shortTitle ?? "홈"}
            </span>
          </div>
          <nav
            aria-label="모바일 도구 메뉴"
            className="flex gap-2 overflow-x-auto px-4 pb-3"
          >
            <Link
              href="/"
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
                isHome
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              홈
            </Link>
            {converters.map((converter) => {
              const isActive = activeConverter?.id === converter.id;

              return (
                <Link
                  key={converter.id}
                  href={converter.path}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {converter.shortTitle}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
