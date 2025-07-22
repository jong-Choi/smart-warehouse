import type { WaybillStatus } from "@/types";
import type { WorkerStatus } from "@components/dashboard/workers";
import type { BadgeColor } from "@ui/status-badge";

export const STATUS_MAP: Record<
  WaybillStatus | WorkerStatus | "HUMAN" | "MACHINE",
  { text: string; color: BadgeColor }
> = {
  // Waybill
  PENDING_UNLOAD: { text: "하차 예정", color: "yellow" },
  UNLOADED: { text: "하차 완료", color: "blue" },
  NORMAL: { text: "정상 처리", color: "green" },
  ACCIDENT: { text: "사고", color: "red" },

  // Worker
  IDLE: { text: "대기중", color: "gray" },
  WORKING: { text: "작업중", color: "green" },
  BROKEN: { text: "고장", color: "red" },

  // Operator
  HUMAN: { text: "인간", color: "green" },
  MACHINE: { text: "로봇", color: "blue" },
};
