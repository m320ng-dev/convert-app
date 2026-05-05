import Link from "next/link";
import { converterCategories, converters } from "@/app/lib/converters";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold text-blue-600">
            개발 작업용 변환 도구 모음
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            자주 쓰는 변환 작업을 한 화면에서 빠르게 찾고 실행하세요.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            코드, 문서, 이미지, 데이터 변환 도구를 공통 사이드바와 카드
            레이아웃으로 정리했습니다. 필요한 도구로 이동한 뒤 입력과 결과에
            바로 집중할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">전체 도구</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {converters.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">카테고리</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {converterCategories.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2">
          <p className="text-sm text-slate-500">탐색</p>
          <p className="mt-2 text-base font-medium text-slate-700">
            데스크톱에서는 왼쪽 사이드바, 모바일에서는 상단 가로 메뉴로 모든
            도구에 접근할 수 있습니다.
          </p>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">도구 목록</h2>
            <p className="mt-1 text-sm text-slate-500">
              작업 유형에 맞는 변환기를 선택하세요.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {converters.map((converter) => (
            <Link
              key={converter.id}
              href={converter.path}
              className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {converter.category}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950 group-hover:text-blue-700">
                    {converter.title}
                  </h3>
                </div>
                <span className="mt-1 text-xl text-slate-300 transition group-hover:text-blue-500">
                  →
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {converter.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6 text-sm text-slate-500">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            © {new Date().getFullYear()}{" "}
            <a href="https://heyo.me" className="hover:text-blue-600">
              heyo.me
            </a>
          </div>
          <div className="flex gap-3">
            <a href="https://heyo.me/contact" className="hover:text-blue-600">
              Contact
            </a>
            <a
              href="https://github.com/m320ng"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
