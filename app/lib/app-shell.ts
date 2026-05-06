export interface AppShellNavItem {
  label: string;
  href: string;
  description: string;
}

export interface GlobalNavigationItem {
  id: 'home' | 'tools' | 'privacy' | 'workflow';
  label: string;
  href: string;
  description: string;
}

export interface AppShellStatusItem {
  label: string;
  value: string;
}

export interface SelectedToolWorkspaceRegion {
  id: string;
  label: string;
  description: string;
}

export interface ToolSelectionEntryPoint {
  id: string;
  label: string;
  href: string;
  description: string;
  action: 'route' | 'update-workspace';
  targetRegion: string;
}

export const appShellNavItems: AppShellNavItem[] = [
  {
    label: '도구 탐색',
    href: '#tools',
    description: '사용 빈도 순으로 정리된 전체 도구 목록',
  },
  {
    label: '로컬 처리',
    href: '#privacy',
    description: '브라우저에서 실행하고 민감한 값을 저장하지 않는 처리 방식',
  },
  {
    label: '작업 흐름',
    href: '#workflow',
    description: '입력, 변환, 복사로 이어지는 빠른 생산성 흐름',
  },
];

export const globalNavigationItems: GlobalNavigationItem[] = [
  {
    id: 'home',
    label: '홈',
    href: '/',
    description: 'ConvertApp 첫 화면으로 이동',
  },
  {
    id: 'tools',
    label: '도구 탐색',
    href: '/#tools',
    description: '사용 빈도 순으로 정리된 전체 도구 목록',
  },
  {
    id: 'privacy',
    label: '로컬 처리',
    href: '/#privacy',
    description: '브라우저에서 실행하고 민감한 값을 저장하지 않는 처리 방식',
  },
  {
    id: 'workflow',
    label: '작업 흐름',
    href: '/#workflow',
    description: '입력, 변환, 복사로 이어지는 빠른 생산성 흐름',
  },
];

export function getActiveGlobalNavigationItemId(pathname: string) {
  if (pathname === '/') {
    return 'home';
  }

  if (pathname.startsWith('/converters')) {
    return 'tools';
  }

  return null;
}

export const appShellStatusItems: AppShellStatusItem[] = [
  {
    label: '브라우저에서 실행',
    value: 'Local',
  },
  {
    label: '저장 없음',
    value: 'Private',
  },
  {
    label: '복사 지원',
    value: 'Copy',
  },
];

export const selectedToolWorkspaceRegions: SelectedToolWorkspaceRegion[] = [
  {
    id: 'tool-context',
    label: '도구 정보',
    description: '선택한 도구의 목적과 작업 유형을 먼저 확인하는 영역',
  },
  {
    id: 'tool-workspace',
    label: '작업 영역',
    description: '입력, 옵션, 결과를 한 흐름으로 처리하는 기본 작업 공간',
  },
  {
    id: 'tool-assurance',
    label: '로컬 처리 안내',
    description: '브라우저 로컬 실행, 저장 없음, 결과 복사 지원을 확인하는 보조 영역',
  },
];

export const toolSelectionEntryPoints: ToolSelectionEntryPoint[] = [
  {
    id: 'open-most-used-tool',
    label: 'JSON 포맷터 열기',
    href: '/converters/json-formatter',
    description: '가장 자주 쓰는 도구를 새 작업 영역으로 바로 엽니다.',
    action: 'route',
    targetRegion: 'tool-workspace',
  },
  {
    id: 'browse-tool-list',
    label: '도구 목록 보기',
    href: '#tools',
    description: '첫 화면의 통합 도구 목록으로 이동해 원하는 도구를 선택합니다.',
    action: 'update-workspace',
    targetRegion: 'tools',
  },
  {
    id: 'switch-workspace-tool',
    label: '다른 도구 선택',
    href: '#workspace-tool-switcher',
    description: '현재 작업 영역에서 다른 도구로 전환할 수 있는 선택 목록을 엽니다.',
    action: 'update-workspace',
    targetRegion: 'workspace-tool-switcher',
  },
];
