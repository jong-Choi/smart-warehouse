import { navigationData, type NavigationItem } from "./navigationData";

// navigationData에서 화면 이름을 찾는 함수
export const getScreenName = (pathname: string): string => {
  // navigationData를 순회하면서 URL 매칭
  const findScreenName = (items: NavigationItem[]): string | null => {
    for (const item of items) {
      if (item.url === pathname) {
        return item.title;
      }
      if (item.children) {
        const childResult = findScreenName(item.children);
        if (childResult) return childResult;
      }
    }
    return null;
  };

  const screenName = findScreenName(navigationData);
  if (screenName) {
    return screenName;
  }

  // 동적 라우트 처리
  if (
    pathname.startsWith("/dashboard/workers/") &&
    pathname !== "/dashboard/workers/home"
  ) {
    return "작업자 상세";
  }
  if (pathname.startsWith("/dashboard/waybills/")) {
    return "운송장 상세";
  }
  if (pathname.startsWith("/dashboard/location/waybills/")) {
    return "지역별 운송장 상세";
  }

  return "대시보드";
};

// 고유한 사용자 ID 생성
export const generateUserId = (): string => {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
