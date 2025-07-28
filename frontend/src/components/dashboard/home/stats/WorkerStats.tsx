import { useWorkersStore } from "@/stores/workersStore";
import { Users, Clock, TrendingUp } from "lucide-react";
import Stat from "@components/ui/stat";
import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/shallow";

function WorkerStats({
  isCollecting,
  setWorkerStatsMessage,
  setWorkerTableMessage,
}: {
  isCollecting: boolean;
  setWorkerStatsMessage: (message: string) => void;
  setWorkerTableMessage: (message: string) => void;
}) {
  const { activeWorkers } = useWorkersStore(
    useShallow((state) => ({
      activeWorkers: state.activeWorkers,
    }))
  );

  // 각 작업자의 통계 계산
  const workerStats = useMemo(
    () =>
      activeWorkers.map((worker) => {
        const totalProcessed = worker.processedCount + worker.accidentCount;
        const accidentRate =
          totalProcessed > 0
            ? (worker.accidentCount / totalProcessed) * 100
            : 0;

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
      }),
    [activeWorkers]
  );

  // 전체 통계
  const totalActiveWorkers = activeWorkers.length;
  const totalProcessed = workerStats.reduce(
    (sum, w) => sum + w.totalProcessed,
    0
  );
  const totalAccidentCount = workerStats.reduce(
    (sum, w) => sum + w.accidentCount,
    0
  );

  const avgAccidentRate =
    totalProcessed > 0
      ? Math.round(
          (workerStats.reduce((sum, w) => sum + w.accidentCount, 0) /
            totalProcessed) *
            100 *
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

  useEffect(() => {
    if (!isCollecting) return;
    setWorkerStatsMessage(
      `활성 작업자: ${totalActiveWorkers}명
총 처리건수: ${totalProcessed}건`
    );
  }, [totalActiveWorkers, totalProcessed, setWorkerStatsMessage, isCollecting]);

  useEffect(() => {
    if (!isCollecting) return;
    setWorkerTableMessage(
      `| 작업자ID | 처리건수 | 사고 건수 | 사고율(%) | 가동률(%) |
|----------|----------|-----------|-----------|-----------|
${workerStats
  .map(
    (worker) =>
      `| ${worker.id} | ${worker.totalProcessed} | ${worker.accidentCount} | ${worker.accidentRate}% | ${worker.utilizationRate}% |`
  )
  .join("\n")}`
    );
  }, [
    totalActiveWorkers,
    totalProcessed,
    setWorkerTableMessage,
    workerStats,
    isCollecting,
  ]);

  return (
    <div className="w-full lg:w-1/2">
      <Stat.Container className="h-full flex flex-col">
        <Stat.Head>작업자 현황</Stat.Head>

        {/* 요약 통계 */}
        <Stat.Grid cols={1} className="mb-6 @[350px]:grid-cols-2">
          <Stat.Card
            icon={Users}
            title="활성 작업자"
            value={totalActiveWorkers}
            variant="blue"
          />
          <Stat.Card
            icon={TrendingUp}
            title="총 처리건수"
            value={totalProcessed}
            variant="green"
          />
        </Stat.Grid>

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
                {workerStats.map((worker) => {
                  const {
                    id,
                    totalProcessed,
                    accidentCount,
                    accidentRate,
                    utilizationRate,
                  } = worker;
                  return (
                    <tr key={id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{id}</td>
                      <td className="p-2 text-right">{totalProcessed}</td>
                      <td className="p-2 text-right">{accidentCount}</td>
                      <td className="p-2 text-right">
                        <span
                          className={`font-medium ${
                            accidentRate > 5
                              ? "text-red-600"
                              : accidentRate > 2
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {accidentRate}%
                        </span>
                      </td>
                      <td className="p-2 text-right">
                        <span
                          className={`font-medium ${
                            utilizationRate > 80
                              ? "text-green-600"
                              : utilizationRate > 60
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {utilizationRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="sticky bottom-0 bg-gray-50 z-10">
                <tr className="bg-gray-50 font-semibold">
                  <td className="p-2">총계</td>
                  <td className="p-2 text-right">{totalProcessed}</td>
                  <td className="p-2 text-right">{totalAccidentCount}</td>
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
      </Stat.Container>
    </div>
  );
}

export default WorkerStats;
