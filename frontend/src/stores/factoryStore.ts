import { create } from "zustand";

interface FactoryState {
  // 작업자 관련
  workerCount: number;
  maxWorkers: number;

  // 벨트 속도 관련
  beltSpeed: number;
  maxBeltSpeed: number;

  // 물건 처리 관련
  processingRate: number;
  maxProcessingRate: number;

  // 트럭 관련
  truckCount: number;
  maxTruckCount: number;

  // 시스템 상태
  isRunning: boolean;
  isPaused: boolean;

  // Warehouse2D 관련 상태들
  unloadInterval: number;
  workerCooldown: number;
  failCount: number;

  // 액션들
  setWorkerCount: (count: number) => void;
  setBeltSpeed: (speed: number) => void;
  setProcessingRate: (rate: number) => void;
  setTruckCount: (count: number) => void;
  setUnloadInterval: (interval: number) => void;
  setWorkerCooldown: (cooldown: number) => void;
  setFailCount: (count: number) => void;
  toggleRunning: () => void;
  togglePaused: () => void;
  reset: () => void;
}

export const useFactoryStore = create<FactoryState>((set) => ({
  // 초기 상태
  workerCount: 5,
  maxWorkers: 20,

  beltSpeed: 5,
  maxBeltSpeed: 5,

  processingRate: 75,
  maxProcessingRate: 100,

  truckCount: 3,
  maxTruckCount: 10,

  isRunning: true,
  isPaused: false,

  // Warehouse2D 관련 초기 상태
  unloadInterval: 1000,
  workerCooldown: 5000,
  failCount: 0,

  // 액션들
  setWorkerCount: (count) => set({ workerCount: Math.min(count, 20) }),
  setBeltSpeed: (speed) => set({ beltSpeed: Math.min(speed, 5) }),
  setProcessingRate: (rate) => set({ processingRate: Math.min(rate, 100) }),
  setTruckCount: (count) => set({ truckCount: Math.min(count, 10) }),
  setUnloadInterval: (interval) => set({ unloadInterval: interval }),
  setWorkerCooldown: (cooldown) => set({ workerCooldown: cooldown }),
  setFailCount: (count) => set({ failCount: count }),
  toggleRunning: () => set((state) => ({ isRunning: !state.isRunning })),
  togglePaused: () => set((state) => ({ isPaused: !state.isPaused })),
  reset: () =>
    set({
      workerCount: 5,
      beltSpeed: 5,
      processingRate: 75,
      truckCount: 3,
      isRunning: true,
      isPaused: false,
      unloadInterval: 1000,
      workerCooldown: 5000,
      failCount: 0,
    }),
}));
