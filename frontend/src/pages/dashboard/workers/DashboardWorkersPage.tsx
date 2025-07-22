import { useEffect } from "react";
import { WorkersTable } from "@/components/dashboard/workers/WorkersTable";
import { useWorkersStore } from "@/stores/workersStore";
import { useChatbotStore } from "@/stores/chatbotStore";

export const DashboardWorkersPage: React.FC = () => {
  // 챗봇 관련 훅
  const { setSystemContext, isCollecting, setIsMessagePending } =
    useChatbotStore([
      "setSystemContext",
      "isCollecting",
      "setIsMessagePending",
    ]);

  // 작업자 데이터 가져오기
  const { workers, stats } = useWorkersStore();

  // chatbot에 사용할 컨텍스트
  useEffect(() => {
    // isCollecting이 true일 때만 systemContext 업데이트
    if (workers && stats && isCollecting) {
      // 작업 시작 시간이 있는 작업자들만 필터링
      const activeWorkers = workers.filter((worker) => worker.workStartedAt);

      // 상태별 작업자 수 계산
      const workingWorkers = activeWorkers.filter(
        (w) => w.status === "WORKING"
      );
      const idleWorkers = activeWorkers.filter((w) => w.status === "IDLE");
      const brokenWorkers = activeWorkers.filter((w) => w.status === "BROKEN");

      // 전체 처리 건수와 사고 건수 계산
      const totalProcessedCount = activeWorkers.reduce(
        (sum, worker) => sum + worker.processedCount,
        0
      );
      const totalAccidentCount = activeWorkers.reduce(
        (sum, worker) => sum + worker.accidentCount,
        0
      );

      // 전체 작업 시간 계산 (시간 단위로 변환)
      const totalWorkTimeHours =
        activeWorkers.reduce((sum, worker) => sum + worker.totalWorkTime, 0) /
        (1000 * 60 * 60);

      // 사고율 계산
      const accidentRate =
        totalProcessedCount > 0
          ? (totalAccidentCount / totalProcessedCount) * 100
          : 0;

      const context = `현재 페이지: 실시간 작업자 현황 (/dashboard/realtime/workers)
⦁ 시간: ${new Date().toLocaleString()}

⦁ 전체 현황:
- 총 작업자 수: ${stats.totalWorkers}명
- 작업 시작한 작업자: ${activeWorkers.length}명
- 작업중인 작업자: ${workingWorkers.length}명
- 대기중인 작업자: ${idleWorkers.length}명
- 고장난 작업자: ${brokenWorkers.length}명

⦁ 성과 지표:
- 총 처리 건수: ${totalProcessedCount.toLocaleString()}건
- 총 사고 건수: ${totalAccidentCount.toLocaleString()}건
- 전체 사고율: ${accidentRate.toFixed(1)}%
- 총 작업 시간: ${totalWorkTimeHours.toFixed(1)}시간

⦁ 작업자 현황 테이블:

| 작업자 ID | 이름 | 상태 | 정상 건수 | 파손 건수 | 사고율 | 작업 시작 | 처리시간 | 가동률 |
|-----------|------|------|-----------|-----------|--------|-----------|----------|--------|
${activeWorkers
  .map((worker) => {
    const accidentRate =
      worker.processedCount > 0
        ? ((worker.accidentCount / worker.processedCount) * 100).toFixed(1)
        : "0.0";
    const statusText =
      worker.status === "WORKING"
        ? "작업중"
        : worker.status === "IDLE"
        ? "대기중"
        : "고장";
    const workStartTime = worker.workStartedAt
      ? new Date(worker.workStartedAt).toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";
    const avgProcessTime =
      worker.processedCount > 0
        ? (worker.totalWorkTime / worker.processedCount / 1000 / 60).toFixed(1)
        : "0.0";
    const efficiency =
      worker.totalWorkTime > 0
        ? Math.min(100, Math.max(0, 100 - worker.accidentCount * 10)).toFixed(0)
        : "0";

    return `| ${worker.code} | ${worker.name} | ${statusText} | ${worker.processedCount} | ${worker.accidentCount} | ${accidentRate}% | ${workStartTime} | ${avgProcessTime}분 | ${efficiency}% |`;
  })
  .join("\n")}

⦁ 사용자가 현재 보고 있는 정보:
- 작업자들의 실시간 상태와 성과를 모니터링하는 페이지
- 작업 시작 시간이 있는 작업자들의 현재 상태, 처리 건수, 사고 건수, 사고율 확인 가능
- 작업자별 처리시간과 가동률 정보 제공
- 실시간으로 업데이트되는 작업자 현황과 통계 정보`;

      setSystemContext(context);
      setIsMessagePending(false);
    }
  }, [workers, stats, setSystemContext, isCollecting, setIsMessagePending]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            실시간 작업자 현황
          </h1>
          <p className="text-muted-foreground">
            작업자들의 실시간 상태와 성과를 모니터링합니다.
          </p>
        </div>
      </div>

      <WorkersTable />
    </div>
  );
};
