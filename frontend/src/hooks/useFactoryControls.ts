import { useFactoryStore } from "@/stores/factoryStore";

export interface FactoryControls {
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
  toggleRunning: () => void;
  togglePaused: () => void;
  reset: () => void;
}

export function useFactoryControls(): FactoryControls {
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
    toggleRunning,
    togglePaused,
    reset,
  } = useFactoryStore();

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
    toggleRunning,
    togglePaused,
    reset,
  };
}
