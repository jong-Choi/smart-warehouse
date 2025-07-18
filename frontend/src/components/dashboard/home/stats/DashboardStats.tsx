import { useUnloadingParcelsStore } from "@/stores/unloadingParcelsStore";
import { useWorkersStore } from "@/stores/workersStore";
import {
  TrendingUp,
  Percent,
  DollarSign,
  AlertTriangle,
  Clock,
  Package,
  HelpCircle,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

function DashboardStats() {
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
      ? Math.round(((totalParcels - pendingUnloadParcels) / totalParcels) * 100)
      : 0;

  // 처리율: (정상처리 + 사고처리) / (전체수량 - 미하차)
  const processedParcels = normalParcels + accidentParcels;
  const unloadedParcels = totalParcels - pendingUnloadParcels;
  const processingRate =
    unloadedParcels > 0
      ? Math.round((processedParcels / unloadedParcels) * 100)
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
      ? Math.round((processedParcels / (totalWorkTime / (1000 * 60))) * 10) / 10
      : 0;

  // 사고 손실률: 사고 금액 / 총 매출 비율
  const accidentLossRate =
    totalRevenue > 0
      ? Math.round((accidentAmount / totalRevenue) * 100 * 100) / 100 // 소수점 2자리
      : 0;

  // 금액 포맷팅 함수
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-6">실시간 통계</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 작업 진척도 */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="font-medium">작업 진척도</span>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">작업 진척도</h4>
                    <p className="text-sm text-gray-600">
                      전체 운송장 중 하차가 완료된 비율입니다. (전체수량 -
                      미하차) / 전체수량
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <span className="text-xl font-bold text-blue-700">
              {progressRate}%
            </span>
          </div>

          {/* 처리율 */}
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Percent className="h-5 w-5 text-green-600" />
              <span className="font-medium">처리율</span>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">처리율</h4>
                    <p className="text-sm text-gray-600">
                      하차된 운송장 중 실제로 처리된 비율입니다. (정상처리 +
                      사고처리) / (전체수량 - 미하차)
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <span className="text-xl font-bold text-green-700">
              {processingRate}%
            </span>
          </div>

          {/* 누적 매출 */}
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <span className="font-medium">누적 매출</span>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">누적 매출</h4>
                    <p className="text-sm text-gray-600">
                      처리된 모든 운송장의 총 운송가액입니다. (정상처리 +
                      사고처리) × 각 운송가액
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <span className="text-xl font-bold text-purple-700">
              {formatCurrency(totalRevenue)}
            </span>
          </div>

          {/* 사고 금액 */}
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium">사고 금액</span>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">사고 금액</h4>
                    <p className="text-sm text-gray-600">
                      사고로 처리된 운송장들의 총 운송가액입니다. 사고처리 × 각
                      운송가액
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <span className="text-xl font-bold text-red-700">
              {formatCurrency(accidentAmount)}
            </span>
          </div>

          {/* 평균 처리시간 */}
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="font-medium">평균 처리시간</span>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">평균 처리시간</h4>
                    <p className="text-sm text-gray-600">
                      활성 작업자들이 한 건을 처리하는데 걸리는 평균 시간입니다.
                      총 작업시간 / 처리건수
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <span className="text-xl font-bold text-orange-700">
              {avgProcessingTime}초
            </span>
          </div>

          {/* 미처리 운송장 */}
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-yellow-600" />
              <span className="font-medium">미처리 운송장</span>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">미처리 운송장</h4>
                    <p className="text-sm text-gray-600">
                      하차는 완료되었지만 아직 정상처리나 사고처리가 되지 않은
                      운송장 수입니다.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <span className="text-xl font-bold text-yellow-700">
              {unprocessedParcels}
            </span>
          </div>

          {/* 분당 처리량 */}
          <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <span className="font-medium">분당 처리량</span>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">분당 처리량</h4>
                    <p className="text-sm text-gray-600">
                      실제 처리된 운송장을 총 작업시간으로 나눈 분당 평균
                      처리량입니다.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <span className="text-xl font-bold text-indigo-700">
              {minuteProcessingRate}건
            </span>
          </div>

          {/* 사고 손실률 */}
          <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-pink-600" />
              <span className="font-medium">사고 손실률</span>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">사고 손실률</h4>
                    <p className="text-sm text-gray-600">
                      사고 금액이 총 매출에서 차지하는 비율입니다. 사고 금액 /
                      총 매출
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <span className="text-xl font-bold text-pink-700">
              {accidentLossRate}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardStats;
