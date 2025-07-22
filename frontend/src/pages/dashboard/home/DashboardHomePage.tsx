import { useEffect } from "react";
import {
  WaybillStats,
  WorkerStats,
  DashboardStats,
} from "@/components/dashboard/home/stats";
import { useUnloadingParcelsStore } from "@/stores/unloadingParcelsStore";
import { useWorkersStore } from "@/stores/workersStore";
import { useChatbotStore } from "@/stores/chatbotStore";

function DashboardHomePage() {
  // 챗봇 관련 훅
  const { setSystemContext, isCollecting, setIsMessagePending } =
    useChatbotStore([
      "setSystemContext",
      "isCollecting",
      "setIsMessagePending",
    ]);

  // 데이터 가져오기
  const { parcels } = useUnloadingParcelsStore();
  const { workers } = useWorkersStore();

  // chatbot에 사용할 컨텍스트
  useEffect(() => {
    // isCollecting이 true일 때만 systemContext 업데이트
    if (parcels && workers && isCollecting) {
      // 운송장 통계 계산
      const totalParcels = parcels.length;
      const pendingUnloadParcels = parcels.filter(
        (p) => p.status === "PENDING_UNLOAD"
      ).length;
      const unloadedParcels = parcels.filter(
        (p) => p.status === "UNLOADED"
      ).length;
      const normalParcels = parcels.filter((p) => p.status === "NORMAL").length;
      const accidentParcels = parcels.filter(
        (p) => p.status === "ACCIDENT"
      ).length;

      // 작업 진척도: (전체수량 - 미하차) / 전체수량
      const progressRate =
        totalParcels > 0
          ? Math.round(
              ((totalParcels - pendingUnloadParcels) / totalParcels) * 100
            )
          : 0;

      // 처리율: (정상처리 + 사고처리) / (전체수량 - 미하차)
      const processedParcels = normalParcels + accidentParcels;
      const unloadedTotal = totalParcels - pendingUnloadParcels;
      const processingRate =
        unloadedTotal > 0
          ? Math.round((processedParcels / unloadedTotal) * 100)
          : 0;

      // 누적 매출: (정상처리 + 사고처리) * 각 운송가액
      const totalRevenue = parcels
        .filter((p) => p.status === "NORMAL" || p.status === "ACCIDENT")
        .reduce((sum, parcel) => sum + parcel.declaredValue, 0);

      // 사고 금액: 사고처리 * 각 운송가액
      const accidentAmount = parcels
        .filter((p) => p.status === "ACCIDENT")
        .reduce((sum, parcel) => sum + parcel.declaredValue, 0);

      // 사고 손실률: 사고 금액 / 총 매출 비율
      const accidentLossRate =
        totalRevenue > 0
          ? Math.round((accidentAmount / totalRevenue) * 100 * 100) / 100
          : 0;

      // 평균 처리시간 계산
      const activeWorkersWithProcessing = workers.filter(
        (worker) => worker.workStartedAt && worker.processedCount > 0
      );

      const avgProcessingTime =
        activeWorkersWithProcessing.length > 0
          ? Math.round(
              (activeWorkersWithProcessing.reduce((sum, worker) => {
                const workerAvgTime =
                  worker.totalWorkTime / worker.processedCount;
                return sum + workerAvgTime;
              }, 0) /
                activeWorkersWithProcessing.length /
                1000) *
                100
            ) / 100
          : 0;

      // 시간당 처리량 계산
      const activeWorkers = workers.filter((worker) => worker.workStartedAt);
      const totalWorkTime = activeWorkers.reduce((sum, worker) => {
        if (!worker.workStartedAt) return sum;
        const now = Date.now();
        const workStartTime = new Date(worker.workStartedAt).getTime();
        return sum + (now - workStartTime);
      }, 0);

      const minuteProcessingRate =
        totalWorkTime > 0
          ? Math.round(
              (processedParcels / (totalWorkTime / (1000 * 60))) * 10
            ) / 10
          : 0;

      // 작업자 통계 계산
      const workerStats = activeWorkers.map((worker) => {
        const totalProcessed = worker.processedCount + worker.accidentCount;
        const accidentRate =
          totalProcessed > 0
            ? (worker.accidentCount / totalProcessed) * 100
            : 0;
        const now = Date.now();
        const workStartTime = worker.workStartedAt
          ? new Date(worker.workStartedAt).getTime()
          : now;
        const totalTime = now - workStartTime;
        const utilizationRate =
          totalTime > 0 ? (worker.totalWorkTime / totalTime) * 100 : 0;

        return {
          ...worker,
          totalProcessed,
          accidentRate: Math.round(accidentRate * 100) / 100,
          utilizationRate: Math.round(utilizationRate * 100) / 100,
        };
      });

      const totalActiveWorkers = activeWorkers.length;
      const totalWorkerProcessed = workerStats.reduce(
        (sum, w) => sum + w.totalProcessed,
        0
      );
      const avgAccidentRate =
        workerStats.length > 0
          ? Math.round(
              (workerStats.reduce((sum, w) => sum + w.accidentRate, 0) /
                workerStats.length) *
                100
            ) / 100
          : 0;
      const avgUtilizationRate =
        workerStats.length > 0
          ? Math.round(
              (workerStats.reduce((sum, w) => sum + w.utilizationRate, 0) /
                workerStats.length) *
                100
            ) / 100
          : 0;

      const context = `현재 페이지: 실시간 개요 (/dashboard/realtime/overview)
⦁ 시간: ${new Date().toLocaleString()}

⦁ 전체 현황:
- 총 운송장 수: ${totalParcels}개
- 작업 진척도: ${progressRate}%
- 처리율: ${processingRate}%
- 누적 매출: ${totalRevenue.toLocaleString()}원
- 사고 금액: ${accidentAmount.toLocaleString()}원
- 사고 손실률: ${accidentLossRate}%
- 평균 처리시간: ${avgProcessingTime}초
- 시간당 처리량: ${minuteProcessingRate}건/분

⦁ 운송장 상태별 분포:
- 미하차: ${pendingUnloadParcels}개
- 하차됨: ${unloadedParcels}개
- 정상처리: ${normalParcels}개
- 사고처리: ${accidentParcels}개

⦁ 작업자 현황:
- 활성 작업자: ${totalActiveWorkers}명
- 총 처리건수: ${totalWorkerProcessed}건
- 평균 사고율: ${avgAccidentRate}%
- 평균 가동률: ${avgUtilizationRate}%

⦁ 작업자 상세 현황 테이블:

| 작업자ID | 처리건수 | 사고 건수 | 사고율(%) | 가동률(%) |
|----------|----------|-----------|-----------|-----------|
${workerStats
  .map(
    (worker) =>
      `| ${worker.id} | ${worker.totalProcessed} | ${worker.accidentCount} | ${worker.accidentRate}% | ${worker.utilizationRate}% |`
  )
  .join("\n")}

⦁ 사용자가 현재 보고 있는 정보:
- 물류센터의 실시간 현황과 핵심 지표를 한눈에 확인할 수 있는 대시보드
- 작업 진척도, 처리율, 누적 매출, 사고 금액 등 주요 지표 확인 가능
- 운송장 상태별 분포와 작업자별 성과 지표 확인 가능
- 실시간으로 업데이트되는 통계 정보와 차트`;

      setSystemContext(context);
      setIsMessagePending(false);
    }
  }, [parcels, workers, setSystemContext, isCollecting, setIsMessagePending]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">실시간 개요</h1>
          <p className="text-muted-foreground">
            물류센터의 실시간 현황과 핵심 지표를 한눈에 확인하세요.
          </p>
        </div>
      </div>

      {/* 대시보드 통계 카드들 */}
      <DashboardStats />

      {/* 통계 섹션 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 운송장 현황 통계 */}
        <WaybillStats />
        {/* 작업자 현황 통계 */}
        <WorkerStats />
      </div>
    </div>
  );
}

export default DashboardHomePage;
