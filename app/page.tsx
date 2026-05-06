import Link from 'next/link';
import { converterGroups, converters } from './lib/converters';

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium text-slate-500">등록된 도구</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            {converters.length}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium text-slate-500">카테고리</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            {converterGroups.length}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium text-slate-500">작업 방식</p>
          <p className="mt-1 text-base font-semibold text-slate-950">브라우저 중심</p>
          <p className="text-xs text-slate-500">대부분의 변환은 로컬에서 처리됩니다.</p>
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">전체 도구</h2>
          <p className="mt-1 text-sm text-slate-500">
            사이드바와 동일한 목록이며, 필요한 변환 작업으로 바로 이동합니다.
          </p>
        </div>

        <div className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-3">
          {converters.map((converter) => (
            <Link
              key={converter.id}
              href={converter.path}
              className="group bg-white p-5 transition hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500">{converter.group}</p>
                  <h3 className="mt-2 text-base font-semibold text-slate-950 group-hover:text-slate-700">
                    {converter.title}
                  </h3>
                </div>
                <span className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-500">
                  열기
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{converter.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
