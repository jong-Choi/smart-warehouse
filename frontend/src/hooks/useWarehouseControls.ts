import { useWarehouseStore } from "@/stores/warehouseStore";

export interface WarehouseControls {
  // 상태
  workerCount: number;
  maxWorkers: number;
  beltSpeed: number;
  maxBeltSpeed: number;
  isRunning: boolean;
  isPaused: boolean;
  unloadInterval: number;
  workerCooldown: number;
  failCount: number;

  // 액션
  setWorkerCount: (count: number) => void;
  setBeltSpeed: (speed: number) => void;
  setUnloadInterval: (interval: number) => void;
  setWorkerCooldown: (cooldown: number) => void;
  startUnload: () => void;
  stopUnload: () => void;
  reset: () => void;
}

export function useWarehouseControls(): WarehouseControls {
  const {
    workerCount,
    maxWorkers,
    beltSpeed,
    maxBeltSpeed,
    isRunning,
    isPaused,
    unloadInterval,
    workerCooldown,
    failCount,
    setWorkerCount,
    setBeltSpeed,
    setUnloadInterval,
    setWorkerCooldown,
    startUnload,
    stopUnload,
    reset,
  } = useWarehouseStore();

  return {
    // 상태
    workerCount,
    maxWorkers,
    beltSpeed,
    maxBeltSpeed,
    isRunning,
    isPaused,
    unloadInterval,
    workerCooldown,
    failCount,

    // 액션
    setWorkerCount,
    setBeltSpeed,
    setUnloadInterval,
    setWorkerCooldown,
    startUnload,
    stopUnload,
    reset,
  };
}
