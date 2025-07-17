import { useEffect, useState, useMemo, useCallback } from "react";
import { createChannelInterface } from "../../../../utils/broadcastChannel";
import type { BroadcastMessage } from "../../../../types/broadcast";
import type { ParcelStatus } from "../../../../types/waybill";
import type { UnloadingParcel } from "../types";

export const useUnloadingBroadcast = (initialParcels: UnloadingParcel[]) => {
  const [parcels, setParcels] = useState<UnloadingParcel[]>(initialParcels);

  // 브로드캐스트 채널 연결
  const channel = useMemo(() => createChannelInterface("factory-events"), []);

  // 메시지 수신 처리 함수 (useCallback으로 메모이제이션)
  const handleMessage = useCallback((data: BroadcastMessage) => {
    const { msg, waybillId, category, severity } = data;

    if (category === "PROCESS" && msg === "하차된 물건") {
      // 하차 완료된 운송장 상태 업데이트
      setParcels((prev) => {
        const parcelIndex = prev.findIndex((p) => p.waybillId === waybillId);
        if (parcelIndex === -1) return prev;

        // 불변성을 유지하면서 해당 항목만 업데이트
        const newParcels = [...prev];
        newParcels[parcelIndex] = {
          ...newParcels[parcelIndex],
          status: "UNLOADED" as ParcelStatus,
          updatedAt: new Date().toISOString(),
        };
        return newParcels;
      });
    } else if (category === "ALARM" && severity === "ERROR") {
      // 작업자 고장으로 인한 파손 처리
      if (msg.includes("작업자 고장")) {
        // 가장 오래된 운송장을 파손 처리 (실제로는 더 정교한 로직 필요)
        setParcels((prev) => {
          const oldestParcelIndex = prev.findIndex(
            (p) => p.status === "PENDING_UNLOAD"
          );
          if (oldestParcelIndex === -1) return prev;

          // 불변성을 유지하면서 해당 항목만 업데이트
          const newParcels = [...prev];
          newParcels[oldestParcelIndex] = {
            ...newParcels[oldestParcelIndex],
            status: "ACCIDENT" as ParcelStatus,
            updatedAt: new Date().toISOString(),
          };
          return newParcels;
        });
      }
    }
  }, []);

  // 메시지 수신 처리
  useEffect(() => {
    const unsubscribe = channel.subscribe(handleMessage);

    return unsubscribe;
  }, [channel, handleMessage]);

  // 초기 데이터가 변경되면 parcels 상태 업데이트
  useEffect(() => {
    setParcels(initialParcels);
  }, [initialParcels]);

  return parcels;
};
