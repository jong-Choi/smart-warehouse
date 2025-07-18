/**
 * 작업자 관련 계산 유틸리티 함수들
 */

export const formatTime = (timeString?: string): string => {
  if (!timeString) return "-";
  return new Date(timeString).toLocaleTimeString();
};

export const formatWorkTime = (milliseconds: number): string => {
  if (milliseconds === 0) return "-";

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}시간 ${minutes % 60}분`;
  } else if (minutes > 0) {
    return `${minutes}분 ${seconds % 60}초`;
  } else {
    return `${seconds}초`;
  }
};

export const calculateUtilization = (
  totalWorkTime: number,
  workStartedAt?: string
): string => {
  if (!workStartedAt || totalWorkTime === 0) return "-";

  const now = new Date().getTime();
  const startTime = new Date(workStartedAt).getTime();
  const totalTime = now - startTime;

  if (totalTime <= 0) return "-";

  const utilization = (totalWorkTime / totalTime) * 100;
  return `${utilization.toFixed(1)}%`;
};

export const calculateAccidentRate = (
  processedCount: number,
  accidentCount: number
): string => {
  const totalCount = processedCount + accidentCount;
  if (totalCount === 0) return "-";

  const accidentRate = (accidentCount / totalCount) * 100;
  return `${accidentRate.toFixed(1)}%`;
};
