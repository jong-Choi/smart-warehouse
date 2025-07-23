// 통화 포맷팅 함수
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// 퍼센트 포맷팅 함수
export const formatPercent = (value: number) => `${value.toFixed(2)}%`;

// 숫자만 포맷팅 함수
export const formatNumber = (value: number) => value.toLocaleString("ko-KR");
