// Utility functions
export * from "./broadcastChannel";
export * from "./chatbot";

// 공통 상태 라벨 변환 함수
export const getStatusLabel = (status: string) => {
  switch (status) {
    case "PENDING_UNLOAD":
      return "하차 예정";
    case "UNLOADED":
      return "하차 완료";
    case "NORMAL":
      return "정상 처리";
    case "ACCIDENT":
      return "사고";
    default:
      return status;
  }
};
