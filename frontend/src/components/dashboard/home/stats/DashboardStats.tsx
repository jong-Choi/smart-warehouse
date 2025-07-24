import { useUnloadingParcelsStore } from "@/stores/unloadingParcelsStore";
import { useWorkersStore } from "@/stores/workersStore";
import {
  TrendingUp,
  Percent,
  DollarSign,
  AlertTriangle,
  Clock,
  Package,
} from "lucide-react";
import { Stat, AnimatedNumber } from "@components/ui";
import { formatCurrency, formatPercent } from "@/utils/formatters";
import { useEffect } from "react";

function DashboardStats({
  isCollecting,
  setDashaboardStatsMessage,
}: {
  isCollecting: boolean;
  setDashaboardStatsMessage: (message: string) => void;
}) {
  const { parcels } = useUnloadingParcelsStore();
  const { workers } = useWorkersStore();

  // 통계 계산
  const totalParcels = parcels.length;
  const pendingUnloadParcels = parcels.filter(
    (p) => p.status === "PENDING_UNLOAD"
  ).length;
  const normalParcels = parcels.filter((p) => p.status === "NORMAL").length;
  const accidentParcels = parcels.filter((p) => p.status === "ACCIDENT").length;

  // 작업 진척도: (전체수량 - 미하차) / 전체수량
  const progressRate =
    totalParcels > 0
      ? Math.round(
          ((totalParcels - pendingUnloadParcels) / totalParcels) * 100 * 100
        ) / 100
      : 0;

  // 처리율: (정상처리 + 사고처리) / (전체수량 - 미하차)
  const processedParcels = normalParcels + accidentParcels;
  const unloadedParcels = totalParcels - pendingUnloadParcels;
  const processingRate =
    unloadedParcels > 0
      ? Math.round((processedParcels / unloadedParcels) * 100 * 100) / 100
      : 0;

  // 누적 매출: (정상처리 + 사고처리) * 각 운송가액
  const totalRevenue = parcels
    .filter((p) => p.status === "NORMAL" || p.status === "ACCIDENT")
    .reduce((sum, parcel) => sum + parcel.declaredValue, 0);

  // 사고 금액: 사고처리 * 각 운송가액
  const accidentAmount = parcels
    .filter((p) => p.status === "ACCIDENT")
    .reduce((sum, parcel) => sum + parcel.declaredValue, 0);

  // 미처리 운송장: 하차됨 상태이고 아직 정상처리나 사고처리가 안된 운송장
  const unprocessedParcels = parcels.filter(
    (p) => p.status === "UNLOADED"
  ).length;

  // 평균 처리시간 계산 (실시간 시뮬레이션 기준)
  const activeWorkersWithProcessing = workers.filter(
    (worker) => worker.workStartedAt && worker.processedCount > 0
  );

  const avgProcessingTime =
    activeWorkersWithProcessing.length > 0
      ? Math.round(
          (activeWorkersWithProcessing.reduce((sum, worker) => {
            // 작업자별 평균 처리시간 = 총 작업시간 / 처리건수
            const workerAvgTime = worker.totalWorkTime / worker.processedCount;
            return sum + workerAvgTime;
          }, 0) /
            activeWorkersWithProcessing.length /
            1000) *
            100 // 밀리초를 초로 변환하고 100을 곱해서 소수점 2자리까지
        ) / 100
      : 0;

  // 시간당 처리량 계산 (실시간 시뮬레이션 기준)
  const activeWorkers = workers.filter((worker) => worker.workStartedAt);
  const totalWorkTime = activeWorkers.reduce((sum, worker) => {
    if (!worker.workStartedAt) return sum;
    const now = Date.now();
    const workStartTime = new Date(worker.workStartedAt).getTime();
    return sum + (now - workStartTime);
  }, 0);

  const minuteProcessingRate =
    totalWorkTime > 0
      ? Math.round((processedParcels / (totalWorkTime / (1000 * 60))) * 100) /
        100
      : 0;

  // 사고 손실률: 사고 금액 / 총 매출 비율
  const accidentLossRate =
    totalRevenue > 0
      ? Math.round((accidentAmount / totalRevenue) * 100 * 100) / 100 // 소수점 2자리
      : 0;

  useEffect(() => {
    if (!isCollecting) return;
    setDashaboardStatsMessage(
      `작업 진척도: ${progressRate}%, 
처리율: ${processingRate}%, 
누적 매출: ${formatCurrency(totalRevenue)}원, 
사고 금액: ${formatCurrency(accidentAmount)}원, 
평균 처리시간: ${avgProcessingTime}초, 
미처리 운송장: ${unprocessedParcels}건, 
분당 처리량: ${minuteProcessingRate}건/분, 
사고 손실률: ${accidentLossRate}%`
    );
  }, [
    progressRate,
    processingRate,
    totalRevenue,
    accidentAmount,
    avgProcessingTime,
    unprocessedParcels,
    minuteProcessingRate,
    accidentLossRate,
    setDashaboardStatsMessage,
    isCollecting,
  ]);

  return (
    <Stat.Container>
      <Stat.Head>실시간 통계</Stat.Head>
      <Stat.Grid
        cols={4}
        className="grid-cols-1 @[500px]:grid-cols-2 @[1000px]:grid-cols-4"
      >
        {/* 작업 진척도 */}
        <Stat.Card
          icon={TrendingUp}
          title="작업 진척도"
          value={<AnimatedNumber value={progressRate} format={formatPercent} />}
          variant="default"
          helpMessage="전체 운송장 중 하차가 완료된 비율입니다. (전체수량 - 미하차) / 전체수량"
        />
        {/* 처리율 */}
        <Stat.Card
          icon={Percent}
          title="처리율"
          value={
            <AnimatedNumber value={processingRate} format={formatPercent} />
          }
          variant="green"
          helpMessage="하차된 운송장 중 실제로 처리된 비율입니다. (정상처리 + 사고처리) / (전체수량 - 미하차)"
        />
        {/* 누적 매출 */}
        <Stat.Card
          icon={DollarSign}
          title="매출"
          value={
            <AnimatedNumber value={totalRevenue} format={formatCurrency} />
          }
          variant="purple"
          helpMessage="처리된 모든 운송장의 총 운송가액입니다. (정상처리 + 사고처리) × 각 운송가액"
        />
        {/* 사고 금액 */}
        <Stat.Card
          icon={AlertTriangle}
          title="사고액"
          value={
            <AnimatedNumber value={accidentAmount} format={formatCurrency} />
          }
          variant="red"
          helpMessage="사고로 처리된 운송장들의 총 운송가액입니다. 사고처리 × 각 운송가액"
        />
        {/* 평균 처리시간 */}
        <Stat.Card
          icon={Clock}
          title="평균 처리시간"
          value={
            <AnimatedNumber
              value={avgProcessingTime}
              format={(value) => `${value.toFixed(2)}초`}
            />
          }
          variant="orange"
          helpMessage="활성 작업자들이 한 건을 처리하는데 걸리는 평균 시간입니다. 총 작업시간 / 처리건수"
        />
        {/* 미처리 운송장 */}
        <Stat.Card
          icon={Package}
          title="미처리 운송장"
          value={unprocessedParcels}
          variant="yellow"
          helpMessage="하차는 완료되었지만 아직 정상처리나 사고처리가 되지 않은 운송장 수입니다."
        />
        {/* 분당 처리량 */}
        <Stat.Card
          icon={TrendingUp}
          title="분당 처리량"
          value={
            <AnimatedNumber
              value={minuteProcessingRate}
              format={(value) => `${value.toFixed(2)}건`}
            />
          }
          variant="indigo"
          helpMessage="실제 처리된 운송장을 총 작업시간으로 나눈 분당 평균 처리량입니다."
        />
        {/* 사고 손실률 */}
        <Stat.Card
          icon={AlertTriangle}
          title="사고 손실률"
          value={
            <AnimatedNumber value={accidentLossRate} format={formatPercent} />
          }
          variant="pink"
          helpMessage="사고 금액이 총 매출에서 차지하는 비율입니다. 사고 금액 / 총 매출"
        />
      </Stat.Grid>
    </Stat.Container>
  );
}

export default DashboardStats;
