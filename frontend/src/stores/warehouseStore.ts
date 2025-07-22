import { create } from "zustand";

// 초기값을 별도 객체로 분리하여 유지보수성 향상
const INITIAL_STATE = {
  workerCount: 5,
  maxWorkers: 20,
  beltSpeed: 1,
  maxBeltSpeed: 5,
  processingRate: 75,
  maxProcessingRate: 100,
  truckCount: 3,
  maxTruckCount: 10,
  isRunning: false,
  isPaused: true,
  unloadInterval: 1000,
  workerCooldown: 5000,
  failCount: 0,
  workerSpeeds: Array(20)
    .fill(0)
    .map(() => Math.round(5000 * (Math.random() * 0.8 + 0.6))),
};

interface WarehouseState {
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

  // 작업자별 작업속도 (20명)
  workerSpeeds: number[];

  // 액션들
  setWorkerCount: (count: number) => void;
  setBeltSpeed: (speed: number) => void;
  setProcessingRate: (rate: number) => void;
  setTruckCount: (count: number) => void;
  setUnloadInterval: (interval: number) => void;
  setWorkerCooldown: (cooldown: number) => void;
  setFailCount: (count: number) => void;
  setWorkerSpeeds: (speeds: number[]) => void;
  toggleRunning: () => void;
  startUnload: () => void;
  stopUnload: () => void;
  reset: () => void;
}

export const useWarehouseStore = create<WarehouseState>((set) => ({
  // 초기 상태 - INITIAL_STATE 객체 사용
  ...INITIAL_STATE,

  // 액션들
  setWorkerCount: (count) => set({ workerCount: Math.min(count, 20) }),
  setBeltSpeed: (speed) => set({ beltSpeed: Math.min(speed, 5) }),
  setProcessingRate: (rate) => set({ processingRate: Math.min(rate, 100) }),
  setTruckCount: (count) => set({ truckCount: Math.min(count, 10) }),
  setUnloadInterval: (interval) => set({ unloadInterval: interval }),
  setWorkerCooldown: (cooldown) => set({ workerCooldown: cooldown }),
  setFailCount: (count) => set({ failCount: count }),
  setWorkerSpeeds: (speeds) => set({ workerSpeeds: speeds }),
  toggleRunning: () => set((state) => ({ isRunning: !state.isRunning })),
  startUnload: () => set({ isRunning: true, isPaused: false }),
  stopUnload: () => set({ isRunning: true, isPaused: true }),
  reset: () =>
    set((state) => ({
      ...INITIAL_STATE,
      // isRunning과 isPaused는 현재 상태 유지
      isRunning: state.isRunning,
      isPaused: state.isPaused,
      // workerSpeeds는 매번 새로운 랜덤값으로 초기화
      workerSpeeds: Array(20)
        .fill(0)
        .map(() => Math.round(5000 * (Math.random() * 0.8 + 0.6))),
    })),
}));
