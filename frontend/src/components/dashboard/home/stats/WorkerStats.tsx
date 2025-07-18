import { useWorkersStore } from "@/stores/workersStore";
import { Users, Clock, TrendingUp } from "lucide-react";

function WorkerStats() {
  const { workers } = useWorkersStore();

  // 작업 시작 시간이 있는 작업자들만 필터링
  const activeWorkers = workers.filter((worker) => worker.workStartedAt);

  // 각 작업자의 통계 계산
  const workerStats = activeWorkers.map((worker) => {
    const totalProcessed = worker.processedCount + worker.accidentCount;
    const accidentRate =
      totalProcessed > 0 ? (worker.accidentCount / totalProcessed) * 100 : 0;

    // 가동률 계산 (작업시간 / 전체시간)
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
      accidentRate: Math.round(accidentRate * 100) / 100, // 소수점 2자리
      utilizationRate: Math.round(utilizationRate * 100) / 100, // 소수점 2자리
    };
  });

  // 전체 통계
  const totalActiveWorkers = activeWorkers.length;
  const totalProcessed = workerStats.reduce(
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

  return (
    <div className="w-full lg:w-1/2">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full">
        <div className="p-6 h-full flex flex-col">
          <h3 className="text-lg font-semibold mb-6">작업자 현황</h3>

          {/* 요약 통계 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium">활성 작업자</span>
              </div>
              <span className="text-xl font-bold text-blue-700">
                {totalActiveWorkers}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium">총 처리건수</span>
              </div>
              <span className="text-xl font-bold text-green-700">
                {totalProcessed}
              </span>
            </div>
          </div>

          {/* 작업자 테이블 */}
          <div className="flex-grow overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-64">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">작업자ID</th>
                    <th className="text-right p-2 font-medium">처리건수</th>
                    <th className="text-right p-2 font-medium">사고 건수</th>
                    <th className="text-right p-2 font-medium">사고율(%)</th>
                    <th className="text-right p-2 font-medium">가동률(%)</th>
                  </tr>
                </thead>
                <tbody>
                  {workerStats.map((worker) => (
                    <tr key={worker.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{worker.id}</td>
                      <td className="p-2 text-right">
                        {worker.totalProcessed}
                      </td>
                      <td className="p-2 text-right">{worker.accidentCount}</td>
                      <td className="p-2 text-right">
                        <span
                          className={`font-medium ${
                            worker.accidentRate > 5
                              ? "text-red-600"
                              : worker.accidentRate > 2
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {worker.accidentRate}%
                        </span>
                      </td>
                      <td className="p-2 text-right">
                        <span
                          className={`font-medium ${
                            worker.utilizationRate > 80
                              ? "text-green-600"
                              : worker.utilizationRate > 60
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {worker.utilizationRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="sticky bottom-0 bg-gray-50 z-10">
                  <tr className="bg-gray-50 font-semibold">
                    <td className="p-2">평균</td>
                    <td className="p-2 text-right">-</td>
                    <td className="p-2 text-right">
                      {workerStats.length > 0
                        ? Math.round(
                            workerStats.reduce(
                              (sum, w) => sum + w.accidentCount,
                              0
                            ) / workerStats.length
                          )
                        : 0}
                    </td>
                    <td className="p-2 text-right">
                      <span
                        className={`${
                          avgAccidentRate > 5
                            ? "text-red-600"
                            : avgAccidentRate > 2
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {avgAccidentRate}%
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      <span
                        className={`${
                          avgUtilizationRate > 80
                            ? "text-green-600"
                            : avgUtilizationRate > 60
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {avgUtilizationRate}%
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {activeWorkers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>아직 작업을 시작한 작업자가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkerStats;
