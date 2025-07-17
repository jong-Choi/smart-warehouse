import { useEffect, useMemo, useCallback } from "react";
import { createChannelInterface } from "../../../../utils/broadcastChannel";
import type { BroadcastMessage } from "../../../../types/broadcast";
import type { ParcelStatus } from "../../../../types/waybill";
import type { UnloadingParcel } from "../types";
import { useUnloadingParcelsStore } from "../../../../stores/unloadingParcelsStore";

export const useUnloadingBroadcast = (initialParcels: UnloadingParcel[]) => {
  const { parcels, setParcels, updateParcel } = useUnloadingParcelsStore();

  // 브로드캐스트 채널 연결
  const channel = useMemo(() => createChannelInterface("factory-events"), []);

  // 메시지 수신 처리 함수 (useCallback으로 메모이제이션)
  const handleMessage = useCallback(
    (data: BroadcastMessage) => {
      const { msg, waybillId, category, severity } = data;

      if (category === "PROCESS" && msg === "하차된 물건") {
        // 하차 완료된 운송장 상태 업데이트
        updateParcel(waybillId as number, {
          status: "UNLOADED" as ParcelStatus,
          updatedAt: new Date().toISOString(),
        });
      } else if (category === "ALARM" && severity === "ERROR") {
        // 작업자 고장으로 인한 파손 처리
        if (msg.includes("작업자 고장")) {
          // 가장 오래된 운송장을 파손 처리 (실제로는 더 정교한 로직 필요)
          const oldestParcel = parcels.find(
            (p) => p.status === "PENDING_UNLOAD"
          );
          if (oldestParcel) {
            updateParcel(oldestParcel.waybillId, {
              status: "ACCIDENT" as ParcelStatus,
              updatedAt: new Date().toISOString(),
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
