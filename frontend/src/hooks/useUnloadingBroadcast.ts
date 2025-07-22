import { useEffect, useMemo, useCallback } from "react";
import { createChannelInterface } from "@utils/broadcastChannel";
import type { BroadcastMessage } from "@/types/broadcast";
import type { WaybillStatus } from "@/types/waybill";
import type { UnloadingParcel } from "@components/dashboard/home/waybills/types";
import { useUnloadingParcelsStore } from "@stores/unloadingParcelsStore";

export const useUnloadingBroadcast = (initialParcels: UnloadingParcel[]) => {
  const { parcels, setParcels, updateParcel } = useUnloadingParcelsStore();

  // 브로드캐스트 채널 연결
  const channel = useMemo(() => createChannelInterface("warehouse-events"), []);

  // 메시지 수신 처리 함수 (useCallback으로 메모이제이션)
  const handleMessage = useCallback(
    (data: BroadcastMessage) => {
      const { msg, category, severity } = data;
      console.log(data);
      const waybillId = data.waybillId as string;
      const operatorId = data.operatorId as number;
      const operatorName = data.operatorName as string;
      const now = new Date().toISOString();

      if (category === "PROCESS" && msg === "하차된 물건") {
        // 하차 완료된 운송장 상태 업데이트
        updateParcel(waybillId, {
          status: "UNLOADED" as WaybillStatus,
          unloadedAt: now, // 하차일시 업데이트
        });
      } else if (category === "PROCESS" && msg === "작업자 처리") {
        // 작업자 처리 완료된 운송장 상태 업데이트
        updateParcel(waybillId, {
          status: "NORMAL" as WaybillStatus,
          workerProcessedAt: now, // 처리일시 업데이트
          processedBy: operatorName || `작업자${operatorId}`, // 처리 작업자 업데이트
        });
      } else if (category === "ALARM" && severity === "ERROR") {
        // 작업자 고장으로 인한 파손 처리
        if (msg.includes("작업자 고장")) {
          // 가장 오래된 운송장을 파손 처리 (실제로는 더 정교한 로직 필요)
          const oldestParcel = parcels.find((p) => p.status === "UNLOADED");
          if (oldestParcel) {
            updateParcel(oldestParcel.waybillId, {
              status: "ACCIDENT" as WaybillStatus,
              workerProcessedAt: now, // 사고 처리일시
              processedBy: "시스템", // 사고 처리자
            });
          }
        }
      }
    },
    [updateParcel, parcels]
  );

  // 메시지 수신 처리
  useEffect(() => {
    const unsubscribe = channel.subscribe(handleMessage);
    return unsubscribe;
  }, [channel, handleMessage]);

  // 초기 데이터가 변경되면 parcels 상태 업데이트
  useEffect(() => {
    setParcels(initialParcels);
  }, [initialParcels, setParcels]);

  return parcels;
};
