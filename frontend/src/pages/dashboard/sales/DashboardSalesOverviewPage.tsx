import { Suspense } from "react";
import { CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { useState } from "react";
import Stat from "@components/ui/stat";
import { SectionHeader, PageLayout } from "@components/ui";
import {
  DashboardSalesOverviewStats,
  DashboardSalesOverviewTable,
} from "@components/dashboard/sales/overview";
import { useSalesContextMessage } from "@components/dashboard/sales/overview/hooks/useSalesContextMessage";
import { LoadingSkeleton } from "@components/dashboard/home/waybills/LoadingSkeleton";

function OverviewContent({ currentYear }: { currentYear: number }) {
  const { setStatsMessage, setTableMessage, isCollecting } =
    useSalesContextMessage(currentYear);

  return (
    <>
      <DashboardSalesOverviewStats
        currentYear={currentYear}
        isCollecting={isCollecting}
        setStatsMessage={setStatsMessage}
      />
      {/* 지역별 매출 상세 테이블 */}
      <Stat.Container>
        <Stat.Head>지역별 매출 상세</Stat.Head>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Suspense fallback={<LoadingSkeleton />}>
              <DashboardSalesOverviewTable
                currentYear={currentYear}
                isCollecting={isCollecting}
                setTableMessage={setTableMessage}
              />
            </Suspense>
          </div>
        </CardContent>
      </Stat.Container>
    </>
  );
}

export function DashboardSalesOverviewPage() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const handleYearChange = (year: number) => {
    setCurrentYear(year);
  };

  return (
    <PageLayout>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <SectionHeader
          title="매출 개요"
          description="전체 매출 현황과 핵심 지표를 한눈에 확인하세요."
        />
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleYearChange(currentYear - 1)}
          >
            {currentYear - 1}년
          </Button>
          <span className="text-lg font-semibold">{currentYear}년</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleYearChange(currentYear + 1)}
          >
            {currentYear + 1}년
          </Button>
        </div>
      </div>

      <OverviewContent currentYear={currentYear} />
    </PageLayout>
  );
}
