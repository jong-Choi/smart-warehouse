import { useSearchParams } from "react-router-dom";
import { CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { useState } from "react";
import Stat from "@components/ui/stat";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeader, PageLayout } from "@components/ui";
import { DashboardDailySalesTable } from "@components/dashboard/sales/daily";
import { useDailySalesMessage } from "@components/dashboard/sales/daily/hooks/useDailySalesMessage";

function DailySalesContent({
  currentYear,
  currentMonth,
}: {
  currentYear: number;
  currentMonth: number;
}) {
  const { setTableMessage, isCollecting } = useDailySalesMessage(
    currentYear,
    currentMonth
  );

  return (
    <>
      {/* 일별 매출 테이블 */}
      <Stat.Container>
        <Stat.Head>일별 매출 통계</Stat.Head>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <DashboardDailySalesTable
              currentYear={currentYear}
              currentMonth={currentMonth}
              isCollecting={isCollecting}
              setTableMessage={setTableMessage}
            />
          </div>
        </CardContent>
      </Stat.Container>
    </>
  );
}

export function DashboardDailySalesPage() {
  const [searchParams] = useSearchParams();
  const [currentYear, setCurrentYear] = useState(() => {
    const yearParam = searchParams.get("year");
    return yearParam ? parseInt(yearParam) : new Date().getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const monthParam = searchParams.get("month");
    return monthParam ? parseInt(monthParam) : new Date().getMonth() + 1;
  });

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((prev) => prev - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((prev) => prev + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  return (
    <PageLayout>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <SectionHeader
          title="일별 매출 현황"
          description="일별 매출 현황과 핵심 지표를 한눈에 확인하세요."
        />
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold">
            {currentYear}년 {monthNames[currentMonth - 1]}
          </span>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <DailySalesContent
        currentYear={currentYear}
        currentMonth={currentMonth}
      />
    </PageLayout>
  );
}
