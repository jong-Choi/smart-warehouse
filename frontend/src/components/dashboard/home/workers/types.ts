export interface Worker {
  id: string; // A1, A2, ..., B10
  code: string; // A1, A2, ..., B10 (코드)
  name: string; // 작업자A1, 작업자A2, ...
  status: WorkerStatus; // 현재 상태
  processedCount: number; // 처리한 물건 수
  accidentCount: number; // 사고 발생 횟수
  lastProcessedAt?: string; // 마지막 처리 시간
  brokenUntil?: string; // 고장 복구 시간 (내부 로직용, UI 미표시)
  workStartedAt?: string; // 최초 작업 시작 시간
  totalWorkTime: number; // 누적 작업시간 (밀리초)
}

export type WorkerStatus =
  | "IDLE" // 대기중
  | "WORKING" // 작업중
  | "BROKEN"; // 고장

export interface WorkerStats {
  totalWorkers: number;
  workingWorkers: number;
  idleWorkers: number;
  brokenWorkers: number;
}
