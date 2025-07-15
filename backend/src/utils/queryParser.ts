/**
 * 쿼리 파라미터 안전 파싱 유틸리티
 *
 * req.query에서 값을 안전하게 추출하고 타입 변환을 처리합니다.
 */

/**
 * 문자열 쿼리 파라미터를 안전하게 추출
 */
export function parseStringQuery(query: any, key: string): string | undefined {
  const value = query[key];
  return typeof value === "string" ? value : undefined;
}

/**
 * 숫자 쿼리 파라미터를 안전하게 추출
 */
export function parseNumberQuery(query: any, key: string): number | undefined {
  const value = query[key];
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

/**
 * 날짜 쿼리 파라미터를 안전하게 추출
 */
export function parseDateQuery(query: any, key: string): Date | undefined {
  const value = query[key];
  if (typeof value === "string") {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
}

/**
 * 불린 쿼리 파라미터를 안전하게 추출
 */
export function parseBooleanQuery(
  query: any,
  key: string
): boolean | undefined {
  const value = query[key];
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return undefined;
}

/**
 * Enum 쿼리 파라미터를 안전하게 추출
 */
export function parseEnumQuery<T extends string>(
  query: any,
  key: string,
  validValues: readonly T[]
): T | undefined {
  const value = query[key];
  if (typeof value === "string" && validValues.includes(value as T)) {
    return value as T;
  }
  return undefined;
}

/**
 * 페이지네이션 파라미터를 안전하게 추출
 */
export function parsePaginationQuery(query: any): {
  page: number;
  limit: number;
} {
  const page = parseNumberQuery(query, "page") || 1;
  const limit = parseNumberQuery(query, "limit") || 20;

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
  };
}
