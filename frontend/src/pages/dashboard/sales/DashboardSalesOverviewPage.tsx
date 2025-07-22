import { Suspense, useMemo } from "react";
import {
  useSalesOverviewSuspense,
  useLocationSalesSuspense,
} from "@/hooks/useSales";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useChatbotStore } from "@/stores/chatbotStore";
import { useState, useEffect } from "react";
import Stat from "@/components/ui/stat";
import DashboardSalesOverviewStats from "@components/sales/overview/DashboardSalesOverviewStats";
import DashboardSalesOverviewTable from "@components/sales/overview/DashboardSalesOverviewTable";

function OverviewContent({ currentYear }: { currentYear: number }) {
  const { data: overviewRes } = useSalesOverviewSuspense(currentYear);
  const { data: locationRes } = useLocationSalesSuspense(currentYear);
  const overviewData = overviewRes?.data;
  const locationData = useMemo(() => locationRes?.data || [], [locationRes]);

  // 챗봇 관련 훅
  const { setSystemContext, isCollecting, setIsMessagePending } =
    useChatbotStore([
      "setSystemContext",
      "isCollecting",
      "setIsMessagePending",
    ]);

  useEffect(() => {
    if (overviewData && locationData && isCollecting) {
      const context = `현재 페이지: 매출 개요 (/dashboard/sales/overview)
⦁ 시간: ${new Date().toLocaleString()}

⦁ 조회 기간:
- ${currentYear}년

⦁ 전체 매출 현황:
- 총 매출: ${overviewData.totalRevenue?.toLocaleString() || 0}원
- 평균 운송가액: ${overviewData.avgShippingValue?.toLocaleString() || 0}원
- 사고 손실률: ${overviewData.accidentLossRate || 0}%
- 월별 성장률: ${overviewData.monthlyGrowthRate || 0}%

⦁ 처리 현황:
- 총 처리 건수: ${overviewData.totalProcessedCount?.toLocaleString() || 0}건
- 총 사고 건수: ${overviewData.totalAccidentCount?.toLocaleString() || 0}건
- 이번 달 매출: ${overviewData.currentMonthRevenue?.toLocaleString() || 0}원

⦁ 지역별 매출 테이블:

| 지역명 | 매출 | 처리 건수 | 사고 건수 | 사고율 |
|--------|------|-----------|-----------|--------|
${locationData
  .filter((data) => data.revenue > 0)
  .map((data) => {
    const accidentRate =
      data.processedCount > 0
        ? ((data.accidentCount / data.processedCount) * 100).toFixed(1)
        : "0.0";
    return `| ${data.locationName} | ${
      data.revenue?.toLocaleString() || 0
    }원 | ${data.processedCount || 0}건 | ${
      data.accidentCount || 0
    }건 | ${accidentRate}% |`;
  })
  .join("\n")}

⦁ 사용자가 현재 보고 있는 정보:
- ${currentYear}년의 전체 매출 현황과 핵심 지표
- 총 매출, 평균 운송가액, 사고 손실률, 월별 성장률 등 주요 지표 확인 가능
- 지역별 매출 현황과 처리 건수 확인 가능
- 지역 클릭 시 해당 지역의 운송장 목록으로 이동 가능
- 연도별 이동 버튼으로 다른 연도의 데이터 조회 가능`;
      setSystemContext(context);
      setIsMessagePending(false);
    }
  }, [
    overviewData,
    locationData,
    currentYear,
    setSystemContext,
    isCollecting,
    setIsMessagePending,
  ]);

  return (
    <>
      <DashboardSalesOverviewStats
        overviewData={overviewData}
        locationData={locationData}
        currentYear={currentYear}
      />
      {/* 지역별 매출 상세 테이블 */}
      <Stat.Container>
        <Stat.Head>지역별 매출 상세</Stat.Head>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <DashboardSalesOverviewTable locationData={locationData} />
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
    <div className="container mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">매출 개요</h1>
          <p className="text-muted-foreground">
            전체 매출 현황과 핵심 지표를 한눈에 확인하세요.
          </p>
        </div>
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
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <OverviewContent currentYear={currentYear} />
      </Suspense>
    </div>
  );
}
