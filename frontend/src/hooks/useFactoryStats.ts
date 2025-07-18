import { useState, useEffect, useMemo } from "react";
import { createChannelInterface } from "@/utils";
import { type BroadcastMessage } from "@/types/broadcast";
import { useUnloadingParcels } from "@/hooks/useWaybills";

export interface FactoryStats {
  unloadExpected: number;
  unloadCompleted: number;
  processedCount: number;
  accidentRate: string;
  isLoading?: boolean;
  error?: string;
}

export function useFactoryStats(): FactoryStats {
  // TanStack Query로 하차 예정 목록 가져오기 [[memory:2711770]]
  const { data: unloadingData, isLoading, error } = useUnloadingParcels();

  // 실시간 통계 상태
  const [stats, setStats] = useState({
    unloadCompleted: 0, // 하차 완료 수량
    workerProcessed: 0, // 작업자 처리 수량
    totalProcessed: 0, // 총 처리 수량 (하차 + 작업자)
    accidentCount: 0, // 사고 수량
    processingTimes: [] as number[], // 처리 시간 배열
  });

  // 브로드캐스트 채널 연결
  const channel = useMemo(() => createChannelInterface("factory-events"), []);

  // 메시지 수신 처리
  useEffect(() => {
    const unsubscribe = channel.subscribe((message: BroadcastMessage) => {
      const now = Date.now();

      switch (message.msg) {
        case "하차된 물건":
          setStats((prev) => ({
            ...prev,
            unloadCompleted: prev.unloadCompleted + 1,
            totalProcessed: prev.totalProcessed + 1,
          }));
          break;

        case "작업자 처리":
          setStats((prev) => ({
            ...prev,
            workerProcessed: prev.workerProcessed + 1,
            totalProcessed: prev.totalProcessed + 1,
            // 처리 시간 계산 (현재 시간 - 메시지 타임스탬프)
            processingTimes: [...prev.processingTimes, now - message.ts].slice(
              -100
            ), // 최근 100개만 유지
          }));
          break;

        case "작업자 고장":
          setStats((prev) => ({
            ...prev,
            accidentCount: prev.accidentCount + 1,
          }));
          break;
      }
    });

    return unsubscribe;
  }, [channel]);

  // 실시간 통계 계산
  return useMemo(() => {
    // TanStack Query에서 가져온 하차 예정 수량 (기본값 2000)
    const unloadExpected = unloadingData?.total || 2000;

    // 사고율 계산 (사고 수 / 총 처리 수량 * 100)
    const accidentRate =
      stats.totalProcessed > 0
        ? ((stats.accidentCount / stats.totalProcessed) * 100).toFixed(2)
        : "0.00";

    return {
      unloadExpected, // 서버에서 가져온 하차 예정수량
      unloadCompleted: stats.unloadCompleted, // 하차 완료 수량
      processedCount: stats.workerProcessed, // 작업자가 처리한 갯수
      accidentRate: `${accidentRate}%`, // 사고율
      isLoading, // 로딩 상태
      error: error?.message, // 에러 메시지
    };
  }, [stats, unloadingData, isLoading, error]);
}
