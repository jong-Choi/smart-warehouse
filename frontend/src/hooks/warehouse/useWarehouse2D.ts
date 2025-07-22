import { useEffect, useRef, useState, useMemo } from "react";
import { createChannelInterface } from "@/utils";
import { useWarehouseStore } from "@/stores/warehouseStore";
import {
  MAX_WORKERS,
  WORKER_COOLDOWN_SCALES,
  WORKER_CATCH_RANGE_SQUARED,
  WORKER_BROKEN_DURATION,
  WORKER_BROKEN_THRESHOLD,
} from "@/utils/warehouse/constants";
import {
  calculatePositionOnBelt,
  SPEED_DENOMINATOR,
  BELT_END_THRESHOLD,
  RECEIVE_WORKERS,
} from "@/utils/warehouse/calculations";
import { useUnloadingParcels } from "@hooks/useWaybills";

export interface LoadedParcel {
  progress: number;
  id: number;
}

export function useWarehouse2D() {
  // warehouseStore에서 상태 가져오기
  const {
    isRunning: running,
    isPaused: paused,
    unloadInterval,
    workerCooldown,
    workerCount,
    beltSpeed,
    failCount,
    setFailCount,
    setWorkerSpeeds,
    stopUnload,
  } = useWarehouseStore();

  // 속도 계산을 useMemo로 최적화 (상수 부분 분리)
  const speed = useMemo(() => beltSpeed / 2 / SPEED_DENOMINATOR, [beltSpeed]);
  const requestRef = useRef<number | null>(null);

  // 여러 개의 하차된 물건 상태
  const [loadedParcels, setLoadedParcels] = useState<LoadedParcel[]>([]);

  // 벨트 작업자별로 잡은 시간 배열
  const [workerCatchTimes, setWorkerCatchTimes] = useState<number[][]>(() =>
    Array(MAX_WORKERS)
      .fill(0)
      .map(() => [])
  );

  // 작업자별 일시적 고장 해제 시각 (0이면 정상)
  const [workerBrokenUntil, setWorkerBrokenUntil] = useState<number[]>(() =>
    Array(MAX_WORKERS).fill(0)
  );

  // 브로드캐스트 채널 인터페이스 생성
  const channel = useMemo(() => createChannelInterface("warehouse-events"), []);

  // 운송장 번호 ref (타이머에서 사용)

  // 브로드캐스트 채널 ref (타이머에서 사용)
  const channelRef = useRef(channel);
  channelRef.current = channel;

  // 이전 상태를 저장하는 ref
  const prevRunningRef = useRef(running);
  const prevPausedRef = useRef(paused);

  // running과 paused 상태 변경 감지하여 브로드캐스트 메시지 전송
  useEffect(() => {
    const now = Date.now();

    // running이 false에서 true로 변경되면 "작업 시작" 메시지
    if (!prevRunningRef.current && running) {
      channelRef.current?.send({
        ts: now,
        msg: "작업 시작",
        category: "SYSTEM",
        severity: "INFO",
        asset: "CONVEYOR",
      });
    }

    // running이 true일 때 paused 상태 변경 감지
    if (running) {
      // paused가 true에서 false로 변경되면 "하차 시작" 메시지
      if (prevPausedRef.current && !paused) {
        channelRef.current?.send({
          ts: now,
          msg: "하차 시작",
          category: "STATUS",
          severity: "INFO",
          asset: "UNLOADER",
        });
      }
      // paused가 false에서 true로 변경되면 "하차 중단" 메시지
      else if (!prevPausedRef.current && paused) {
        channelRef.current?.send({
          ts: now,
          msg: "하차 중단",
          category: "STATUS",
          severity: "WARNING",
          asset: "UNLOADER",
        });
      }
    }

    // 현재 상태를 이전 상태로 저장
    prevRunningRef.current = running;
    prevPausedRef.current = paused;
  }, [running, paused]);

  // 작업자별 작업속도를 store에 업데이트
  useEffect(() => {
    const workerSpeeds = WORKER_COOLDOWN_SCALES.map((scale) =>
      Math.round(workerCooldown * scale)
    );
    setWorkerSpeeds(workerSpeeds);
  }, [workerCooldown, setWorkerSpeeds]);

  const { data: unloadingData } = useUnloadingParcels();
  const percels = useMemo(
    () =>
      unloadingData
        ? Array.from(unloadingData.parcels.sort(() => Math.random() - 0.5))
        : [],
    [unloadingData]
  );

  // 2초마다 새로운 동그라미 추가 → unloadInterval로 변경 (running이고 paused가 아닐 때만 동작)
  useEffect(() => {
    if (!running || paused || !unloadingData) return;
    const timer = setInterval(() => {
      if (percels.length === 0) return stopUnload();
      // 하차 작업자 랜덤 선택 (U1 또는 U2)
      const unloadWorkerId = Math.random() < 0.5 ? "U1" : "U2";

      const parcel = percels.pop();
      setLoadedParcels((prev) => [
        ...prev,
        { progress: 0, id: parcel!.waybillId },
      ]);

      // --- 하차 작업자 하차 완료 메시지 송출 ---
      channelRef.current?.send({
        ts: Date.now(),
        msg: "하차된 물건",
        category: "PROCESS",
        severity: "INFO",
        asset: "UNLOADER",
        unloadWorkerId: unloadWorkerId,
        waybillId: parcel!.waybillId,
      });
    }, unloadInterval);
    return () => clearInterval(timer);
  }, [unloadInterval, running, paused, stopUnload, percels, unloadingData]); // paused 추가

  // 각 동그라미의 progress를 부드럽게 업데이트 (running일 때만 동작)
  useEffect(() => {
    if (!running) return;
    const animate = () => {
      setLoadedParcels((prev) =>
        prev.map((c) => {
          let next = c.progress + speed;
          if (next >= 1) next = 0;
          return { progress: next, id: c.id };
        })
      );
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [speed, running]); // running 추가

  // 동그라미가 작업자 위치에 오면 즉시 사라지게 (running일 때만 동작)
  useEffect(() => {
    if (!running) return;
    const now = Date.now();
    const removeIdxs: number[] = [];
    const newCatchTimes = workerCatchTimes.map((times) => [...times]);
    const caughtCircleSet = new Set<number>();
    const newBrokenUntil = [...workerBrokenUntil];
    for (let workerIdx = 0; workerIdx < workerCount; workerIdx++) {
      const w = RECEIVE_WORKERS[workerIdx];
      const last =
        workerCatchTimes[workerIdx].length > 0
          ? workerCatchTimes[workerIdx][workerCatchTimes[workerIdx].length - 1]
          : 0;
      // --- 쿨다운 배율 적용 ---
      const workerCooldownWithScale =
        workerCooldown * WORKER_COOLDOWN_SCALES[workerIdx];
      // --- 고장 상태면 skip ---
      if (workerBrokenUntil[workerIdx] > now) continue;
      if (now - last < workerCooldownWithScale) continue;
      let caught = false;
      loadedParcels.forEach((circle, cIdx) => {
        if (caughtCircleSet.has(cIdx) || caught) return;

        // 최적화된 위치 계산 사용
        const movingCircle = calculatePositionOnBelt(circle.progress);

        const dx = w.x - movingCircle.x;
        const dy = w.y - movingCircle.y;
        const distSquared = dx * dx + dy * dy;
        if (distSquared < WORKER_CATCH_RANGE_SQUARED) {
          // --- 고장 조건 체크 ---
          // 5% 확율로 고장: 끝 두자리의 차이가 2 이하일 때
          const cooldownLast2 = Math.round(workerCooldownWithScale) % 100;
          const waybillIdLast2 = circle.id % 100;
          if (
            Math.abs(cooldownLast2 - waybillIdLast2) <= WORKER_BROKEN_THRESHOLD
          ) {
            // 고장 발생!
            newBrokenUntil[workerIdx] = now + WORKER_BROKEN_DURATION;
            // 고장 발생 메시지 송출
            channel?.send({
              ts: now,
              msg: "작업자 고장",
              category: "ALARM",
              severity: "ERROR",
              asset: "WORKER",
              workerId:
                workerIdx < 10 ? `A${workerIdx + 1}` : `B${workerIdx - 9}`,
              waybillId: circle.id,
              cooldown: Math.round(workerCooldownWithScale),
              brokenUntil: newBrokenUntil[workerIdx],
            });
          } else {
            removeIdxs.push(cIdx);
            caughtCircleSet.add(cIdx);
            newCatchTimes[workerIdx].push(now);
            caught = true;

            // --- 여기서 브로드캐스트 채널로 송출 ---
            channel?.send({
              ts: now,
              msg: "작업자 처리",
              category: "PROCESS",
              severity: "INFO",
              asset: "WORKER",
              workerId:
                workerIdx < 10 ? `A${workerIdx + 1}` : `B${workerIdx - 9}`,
              waybillId: circle.id,
              count: newCatchTimes[workerIdx].length + 1,
              operatorId: workerIdx + 1, // 작업자 ID 추가
              operatorName:
                workerIdx < 10
                  ? `작업자A${workerIdx + 1}`
                  : `작업자B${workerIdx - 9}`, // 작업자 이름 추가
            });
          }
        }
      });
    }
    if (
      removeIdxs.length > 0 ||
      newBrokenUntil.some((v, i) => v !== workerBrokenUntil[i])
    ) {
      if (removeIdxs.length > 0) {
        const removeSet = new Set(removeIdxs);
        setLoadedParcels((prev) => prev.filter((_, i) => !removeSet.has(i)));
        setWorkerCatchTimes(newCatchTimes);
      }
      if (newBrokenUntil.some((v, i) => v !== workerBrokenUntil[i])) {
        setWorkerBrokenUntil(newBrokenUntil);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loadedParcels,
    workerCatchTimes,
    workerCooldown,
    workerCount,
    running, // running 추가
    workerBrokenUntil,
  ]);

  // 벨트 끝까지 도달한 동그라미를 실패로 처리 (running일 때만 동작)
  useEffect(() => {
    if (!running) return;
    // 마지막 포인트에 도달한 물건 인덱스
    const failedIdxs = loadedParcels
      .map((circle, i) => {
        // 거리 기반으로 끝에 도달했는지 확인
        const targetDistance = circle.progress * (BELT_END_THRESHOLD + 10); // TOTAL_DISTANCE 대신 BELT_END_THRESHOLD + 10 사용
        return targetDistance >= BELT_END_THRESHOLD ? i : -1;
      })
      .filter((i) => i !== -1);
    if (failedIdxs.length > 0) {
      setFailCount(failCount + failedIdxs.length);
      setLoadedParcels((prev) =>
        prev.filter((_, i) => !failedIdxs.includes(i))
      );
    }
  }, [loadedParcels, running, failCount, setFailCount]);

  return {
    loadedParcels,
    workerCatchTimes,
    workerBrokenUntil,
    speed,
  };
}
