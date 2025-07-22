import { DonutChart } from "@/components/ui/donut-chart";
import { Package, Truck, CheckCircle, AlertTriangle } from "lucide-react";
import { useUnloadingParcelsStore } from "@/stores/unloadingParcelsStore";
import { StatCard } from "@/components/ui/stat-card";

function WaybillStats() {
  const { parcels } = useUnloadingParcelsStore();

  // 각 상태별 카운트 계산
  const pendingUnloadCount = parcels.filter(
    (p) => p.status === "PENDING_UNLOAD"
  ).length;
  const unloadedCount = parcels.filter((p) => p.status === "UNLOADED").length;
  const normalCount = parcels.filter((p) => p.status === "NORMAL").length;
  const accidentCount = parcels.filter((p) => p.status === "ACCIDENT").length;

  // 도넛 차트 데이터 - 실제 데이터 기반
  const chartData = [
    { name: "미하차", value: pendingUnloadCount, color: "#6B7280" }, // gray-500
    { name: "하처리", value: unloadedCount, color: "#3B82F6" }, // blue-500
    { name: "정상처리", value: normalCount, color: "#10B981" }, // green-500
    { name: "사고처리", value: accidentCount, color: "#EF4444" }, // red-500
  ];

  const totalCount = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full lg:w-1/2">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6">운송장 현황</h3>
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* 도넛 차트 */}
            <div className="flex-shrink-0">
              <DonutChart data={chartData} width={200} height={200} />
            </div>

            {/* 상세 통계 */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard
                  icon={Package}
                  title="미하차"
                  value={pendingUnloadCount}
                  variant="default"
                />

                <StatCard
                  icon={Truck}
                  title="미처리"
                  value={unloadedCount}
                  variant="yellow"
                />

                <StatCard
                  icon={CheckCircle}
                  title="정상처리"
                  value={normalCount}
                  variant="green"
                />

                <StatCard
                  icon={AlertTriangle}
                  title="사고처리"
                  value={accidentCount}
                  variant="red"
                />
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">총 수량</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {totalCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WaybillStats;
