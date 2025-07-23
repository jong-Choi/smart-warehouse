import { CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { useState } from "react";
import Stat from "@components/ui/stat";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeader, PageLayout } from "@components/ui";
import { DashboardMonthlySalesTable } from "@components/dashboard/sales/monthly";
import { useMonthlySalesMessage } from "@components/dashboard/sales/monthly/hooks/useMonthlySalesMessage";

function MonthlySalesContent({ currentYear }: { currentYear: number }) {
  const { setTableMessage, isCollecting } = useMonthlySalesMessage(currentYear);

  return (
    <>
      {/* 월별 매출 테이블 */}
      <Stat.Container>
        <Stat.Head>월별 매출 통계</Stat.Head>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <DashboardMonthlySalesTable
              currentYear={currentYear}
              isCollecting={isCollecting}
              setTableMessage={setTableMessage}
            />
          </div>
        </CardContent>
      </Stat.Container>
    </>
  );
}

export function DashboardMonthlySalesPage() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const handlePreviousYear = () => {
    setCurrentYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    setCurrentYear((prev) => prev + 1);
  };

  return (
    <PageLayout>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <SectionHeader
          title="월별 매출 현황"
          description="월별 매출 현황과 핵심 지표를 한눈에 확인하세요."
        />
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handlePreviousYear}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold">{currentYear}년</span>
          <Button variant="outline" size="sm" onClick={handleNextYear}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <MonthlySalesContent currentYear={currentYear} />
    </PageLayout>
  );
}
