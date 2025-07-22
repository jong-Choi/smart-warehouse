import { Suspense, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useSalesOverviewSuspense,
  useLocationSalesSuspense,
} from "@/hooks/useSales";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/ui/table";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  MapPin,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useChatbotStore } from "@/stores/chatbotStore";
import { useState, useEffect } from "react";
import Stat from "@/components/ui/stat";

function OverviewContent({ currentYear }: { currentYear: number }) {
  const navigate = useNavigate();
  const { data: overviewRes } = useSalesOverviewSuspense(currentYear);
  const { data: locationRes } = useLocationSalesSuspense(currentYear);
  const overviewData = overviewRes?.data;
  const locationData = useMemo(() => locationRes?.data || [], [locationRes]);

  // 챗봇 관련 훅
  const { setSystemContext, isCollecting, setIsMessagePending } =
    useChatbotStore();

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("ko-KR").format(value);
  };

  const handleLocationClick = (locationName: string) => {
    navigate(
      `/dashboard/location/waybills?location=${encodeURIComponent(
        locationName
      )}`
    );
  };

  return (
    <>
      {/* 매출 요약 + 추가 통계 카드들 */}
      <Stat.Container>
        <Stat.Header>
          <h3 className="text-lg font-semibold mb-2">매출 요약 및 통계</h3>
          <p className="text-sm text-muted-foreground mb-4">
            올해 전체 매출, 주요 지표, 처리 건수 등 상세 통계를 한눈에
            확인하세요.
          </p>
        </Stat.Header>
        <Stat.Grid cols={3}>
          <Stat.Card
            icon={DollarSign}
            title="총 매출"
            value={formatCurrency(overviewData?.totalRevenue || 0)}
            variant="purple"
            helpMessage="올해 누적 매출입니다."
          />
          <Stat.Card
            icon={Package}
            title="평균 운송가액"
            value={formatCurrency(overviewData?.avgShippingValue || 0)}
            variant="blue"
            helpMessage="운송장 1건당 평균 운송가액입니다."
          />

          <Stat.Card
            icon={DollarSign}
            title="이번 달 매출"
            value={formatCurrency(overviewData?.currentMonthRevenue || 0)}
            variant="green"
            helpMessage="이번 달 누적 매출입니다."
          />
        </Stat.Grid>
        <Stat.Grid cols={4} className="mt-6">
          <Stat.Card
            icon={Package}
            title="총 처리 건수"
            value={`${formatNumber(overviewData?.totalProcessedCount || 0)}건`}
            variant="default"
            helpMessage="정상 처리된 운송장 수입니다."
          />
          <Stat.Card
            icon={AlertTriangle}
            title="총 사고 건수"
            value={`${formatNumber(overviewData?.totalAccidentCount || 0)}건`}
            variant="red"
            helpMessage="사고 발생 운송장 수입니다."
          />
          <Stat.Card
            icon={AlertTriangle}
            title="사고 손실률"
            value={`${overviewData?.accidentLossRate || 0}%`}
            variant="red"
            helpMessage="총 매출 대비 사고로 인한 손실 비율입니다."
          />
          <Stat.Card
            icon={
              overviewData?.monthlyGrowthRate &&
              overviewData.monthlyGrowthRate > 0
                ? TrendingUp
                : TrendingDown
            }
            title="월별 성장률"
            value={`${overviewData?.monthlyGrowthRate || 0}%`}
            variant={
              overviewData?.monthlyGrowthRate &&
              overviewData.monthlyGrowthRate > 0
                ? "green"
                : "red"
            }
            helpMessage="지난달 대비 매출 성장률입니다."
          />
        </Stat.Grid>
      </Stat.Container>
      {/* 지역별 매출 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Stat.Container>
          <Stat.Header className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            지역별 매출 현황
          </Stat.Header>
          <CardContent className="p-0">
            {locationData.length > 0 ? (
              <>
                <div className="space-y-4">
                  {locationData.slice(0, 5).map((location, index) => (
                    <div
                      key={location.locationName}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => handleLocationClick(location.locationName)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{location.locationName}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(location.processedCount)}건 처리
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {formatCurrency(location.revenue)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
                {locationData.length > 5 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/dashboard/location")}
                    >
                      전체 지역 보기
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  지역별 매출 데이터가 없습니다
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {currentYear}년에 조회된 지역별 매출 정보가 없습니다.
                </p>
                <Button variant="outline" size="sm" disabled>
                  다른 연도 확인하기
                </Button>
              </div>
            )}
          </CardContent>
        </Stat.Container>
        <Stat.Container>
          <Stat.Header className="flex items-center gap-2">
            <ExternalLink className="mr-2 h-4 w-4" />
            빠른 액션
          </Stat.Header>
          <CardContent className="p-0">
            <div className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/dashboard/sales/monthly")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                월별 매출 상세보기
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/dashboard/sales/daily")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                일별 매출 상세보기
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/dashboard/waybills")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                운송장 목록 보기
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/dashboard/location/waybills")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                위치 관리 보기
              </Button>
            </div>
          </CardContent>
        </Stat.Container>
      </div>
      {/* 지역별 매출 상세 테이블 */}
      <Stat.Container>
        <Stat.Header>지역별 매출 상세</Stat.Header>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>순위</TableHead>
                  <TableHead>지역명</TableHead>
                  <TableHead className="text-right">매출</TableHead>
                  <TableHead className="text-right">처리건수</TableHead>
                  <TableHead className="text-right">사고건수</TableHead>
                  <TableHead className="text-right">평균 운송가액</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locationData.map((location, index) => (
                  <TableRow
                    key={location.locationName}
                    onClick={() => handleLocationClick(location.locationName)}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{location.locationName}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(location.revenue)}
                    </TableCell>
                    <TableCell className="text-right text-gray-500">
                      {formatNumber(location.processedCount)}건
                    </TableCell>
                    <TableCell className="text-right text-gray-500">
                      <span
                        className={
                          location.accidentCount > 0 ? "text-red-600" : ""
                        }
                      >
                        {formatNumber(location.accidentCount)}건
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-gray-500">
                      {formatCurrency(
                        location.processedCount > 0
                          ? location.revenue / location.processedCount
                          : 0
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
