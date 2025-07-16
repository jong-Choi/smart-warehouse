export type EventCategory =
  | "SYSTEM" // 시스템 제어 이벤트 (작업 시작/중단 등)
  | "PROCESS" // 프로세스 이벤트 (하차, 처리 등)
  | "ALARM" // 알람/에러 이벤트
  | "STATUS" // 상태 변경 이벤트
  | "DIAGNOSTIC" // 진단 정보
  | "MAINTENANCE"; // 유지보수 관련

export type EventSeverity =
  | "INFO" // 정보성 메시지
  | "WARNING" // 경고
  | "ERROR" // 에러
  | "CRITICAL"; // 긴급

export type AssetType =
  | "SYSTEM" // 전체 시스템
  | "CONVEYOR" // 컨베이어 벨트
  | "UNLOADER" // 하차 작업자 (U1, U2)
  | "WORKER" // 벨트 작업자 (A1-A10, B1-B10)
  | "SENSOR" // 센서
  | "CONTROLLER"; // 컨트롤러

export interface BroadcastMessage {
  ts: number;
  msg: string;
  category: EventCategory;
  severity: EventSeverity;
  asset: AssetType;
  [key: string]: unknown;
}

export interface BroadcastChannelInterface {
  send: (data: BroadcastMessage) => void;
  subscribe: (handler: (data: BroadcastMessage) => void) => () => void;
  disconnect: () => void;
}
