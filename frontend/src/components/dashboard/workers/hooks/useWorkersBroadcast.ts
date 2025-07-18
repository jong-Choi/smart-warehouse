import { useEffect, useMemo } from "react";
import { createChannelInterface } from "@/utils";
import type { BroadcastMessage } from "@/types/broadcast";
import { useWorkersStore } from "@/stores/workersStore";

export const useWorkersBroadcast = () => {
  const { updateWorker } = useWorkersStore();

  // 브로드캐스트 채널 연결
  const channel = useMemo(() => createChannelInterface("factory-events"), []);

  // 메시지 수신 처리
  useEffect(() => {
    const unsubscribe = channel.subscribe((message: BroadcastMessage) => {
      const now = new Date().toISOString();

      if (message.msg === "작업자 처리") {
        // 작업자가 물건을 처리했을 때
        const workerId = message.workerId as string;

        updateWorker(workerId, {
          status: "WORKING",
          processedCount: (message.count as number) || 0,
          lastProcessedAt: now,
        });
      } else if (message.msg === "작업 종료") {
        // 작업자의 쿨다운이 끝났을 때
        const workerId = message.workerId as string;

        updateWorker(workerId, {
          status: "IDLE",
        });
      } else if (message.msg === "작업자 고장") {
        // 작업자가 고장났을 때
        const workerId = message.workerId as string;
        const brokenUntil = message.brokenUntil as number;

        updateWorker(workerId, {
          status: "BROKEN",
          brokenUntil: new Date(brokenUntil).toISOString(),
        });
      }
    });

    return unsubscribe;
  }, [channel, updateWorker]);

  // 고장 복구 체크 (고장 복구 시간이 지났는지 확인)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const { workers, updateWorker } = useWorkersStore.getState();

      workers.forEach((worker) => {
        if (worker.status === "BROKEN" && worker.brokenUntil) {
          const brokenUntil = new Date(worker.brokenUntil);
          if (now >= brokenUntil) {
            updateWorker(worker.id, {
              status: "IDLE",
              brokenUntil: undefined,
            });
          }
        }
      });
    }, 1000); // 1초마다 체크

    return () => clearInterval(interval);
  }, []);
};
