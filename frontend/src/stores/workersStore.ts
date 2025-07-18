import { create } from "zustand";
import type { Worker, WorkerStats } from "@/components/dashboard/workers/types";

// 20명 작업자 초기 데이터 생성
const createInitialWorkers = (): Worker[] => {
  const workers: Worker[] = [];

  // A1~A10 작업자
  for (let i = 1; i <= 10; i++) {
    workers.push({
      id: `A${i}`,
      name: `작업자A${i}`,
      status: "IDLE",
      processedCount: 0,
      totalWorkTime: 0,
    });
  }

  // B1~B10 작업자
  for (let i = 1; i <= 10; i++) {
    workers.push({
      id: `B${i}`,
      name: `작업자B${i}`,
      status: "IDLE",
      processedCount: 0,
      totalWorkTime: 0,
    });
  }

  return workers;
};

interface WorkersState {
  workers: Worker[];
  stats: WorkerStats;

  // 액션들
  updateWorker: (workerId: string, updates: Partial<Worker>) => void;
  resetWorkers: () => void;
  calculateStats: () => void;
}

export const useWorkersStore = create<WorkersState>((set, get) => ({
  workers: createInitialWorkers(),
  stats: {
    totalWorkers: 20,
    workingWorkers: 0,
    idleWorkers: 20,
    brokenWorkers: 0,
  },

  updateWorker: (workerId: string, updates: Partial<Worker>) => {
    set((state) => {
      const updatedWorkers = state.workers.map((worker) =>
        worker.id === workerId ? { ...worker, ...updates } : worker
      );

      return { workers: updatedWorkers };
    });

    // 통계 재계산
    get().calculateStats();
  },

  resetWorkers: () => {
    set({
      workers: createInitialWorkers(),
      stats: {
        totalWorkers: 20,
        workingWorkers: 0,
        idleWorkers: 20,
        brokenWorkers: 0,
      },
    });
  },

  calculateStats: () => {
    const { workers } = get();
    const totalWorkers = workers.length;
    const workingWorkers = workers.filter((w) => w.status === "WORKING").length;
    const brokenWorkers = workers.filter((w) => w.status === "BROKEN").length;
    const idleWorkers = totalWorkers - workingWorkers - brokenWorkers;

    set({
      stats: {
        totalWorkers,
        workingWorkers,
        idleWorkers,
        brokenWorkers,
      },
    });
  },
}));
