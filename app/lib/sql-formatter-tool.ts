import { format } from 'sql-formatter';

export function formatSqlText(value: string): string {
  if (!value.trim()) {
    return '';
  }

  try {
    return format(value, {
      language: 'sql',
      tabWidth: 2,
      keywordCase: 'upper',
      linesBetweenQueries: 2,
    });
  } catch {
    throw new Error('SQL 쿼리 포맷팅에 실패했습니다. 쿼리문을 확인해주세요.');
  }
}
