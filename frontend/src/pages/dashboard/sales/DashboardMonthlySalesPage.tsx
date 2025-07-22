import { useNavigate } from "react-router-dom";
import { useMonthlySalesSuspense } from "@/hooks/useSales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table } from "@/ui/table";
import { ChevronLeft, ChevronRight, ExternalLink, Package } from "lucide-react";
import { useChatbotStore } from "@/stores/chatbotStore";
import { useState, useEffect, useMemo } from "react";
import type { SalesData } from "@/types/sales";
import { formatCurrency, formatNumber } from "@utils/formatString";

function MonthlySalesContent({ currentYear }: { currentYear: number }) {
  const navigate = useNavigate();
  const { data } = useMonthlySalesSuspense(currentYear);
  const salesData: SalesData[] = useMemo(
    () => (data && Array.isArray(data.data) ? data.data : []),
    [data]
  );

  // 챗봇 관련 훅
  const { setSystemContext, isCollecting, setIsMessagePending } =
    useChatbotStore([
      "setSystemContext",
      "isCollecting",
      "setIsMessagePending",
    ]);

  useEffect(() => {
    if (salesData && isCollecting) {
      // 전체 통계 계산
      const totalUnloadCount = salesData.reduce(
        (sum, data) => sum + data.unloadCount,
        0
      );
      const totalRevenue = salesData.reduce(
        (sum, data) => sum + data.totalShippingValue,
        0
      );
      const totalProcessValue = salesData.reduce(
        (sum, data) => sum + data.processValue,
        0
      );
      const totalAccidentValue = salesData.reduce(
        (sum, data) => sum + data.accidentValue,
        0
      );
      const totalNormalProcessCount = salesData.reduce(
        (sum, data) => sum + data.normalProcessCount,
        0
      );
      const totalAccidentCount = salesData.reduce(
        (sum, data) => sum + data.accidentCount,
        0
      );
      const avgShippingValue =
        totalUnloadCount > 0 ? totalRevenue / totalUnloadCount : 0;
      const accidentLossRate =
        totalRevenue > 0 ? (totalAccidentValue / totalRevenue) * 100 : 0;
      const monthsWithData = salesData.filter(
        (data) => data.unloadCount > 0
      ).length;
      const context = `현재 페이지: 월별 매출 현황 (/dashboard/sales/monthly)
⦁ 시간: ${new Date().toLocaleString()}

⦁ 조회 기간:
- ${currentYear}년

⦁ 전체 현황:
- 총 하차물량: ${totalUnloadCount.toLocaleString()}건
- 총 매출: ${totalRevenue.toLocaleString()}원
- 평균 운송가액: ${avgShippingValue.toLocaleString()}원
- 총 처리가액: ${totalProcessValue.toLocaleString()}원
- 총 사고가액: ${totalAccidentValue.toLocaleString()}원
- 사고 손실률: ${accidentLossRate.toFixed(1)}%

⦁ 처리 현황:
- 정상처리건수: ${totalNormalProcessCount.toLocaleString()}건
- 사고건수: ${totalAccidentCount.toLocaleString()}건
- 데이터가 있는 월: ${monthsWithData}개월

⦁ 월별 매출 테이블:

| 월 | 하차물량 | 총 운송가액 | 평균 운송가액 | 정상처리건수 | 처리가액 | 사고건수 | 사고가액 |
|----|----------|-------------|---------------|--------------|----------|----------|----------|
${salesData
  .filter((data) => data.unloadCount > 0)
  .map(
    (data) =>
      `| ${
        data.period
      } | ${data.unloadCount.toLocaleString()}건 | ${data.totalShippingValue.toLocaleString()}원 | ${data.avgShippingValue.toLocaleString()}원 | ${data.normalProcessCount.toLocaleString()}건 | ${data.processValue.toLocaleString()}원 | ${data.accidentCount.toLocaleString()}건 | ${data.accidentValue.toLocaleString()}원 |`
  )
  .join("\n")}

⦁ 사용자가 현재 보고 있는 정보:
- ${currentYear}년의 월별 매출 현황
- 월별 하차물량, 총 운송가액, 평균 운송가액, 정상처리건수, 처리가액, 사고건수, 사고가액 확인 가능
- 월 클릭 시 해당 월의 일별 매출 페이지로 이동 가능
- 하차물량 클릭 시 해당 월의 운송장 목록으로 이동 가능
- 연도별 이동 버튼으로 다른 연도의 데이터 조회 가능`;
      setSystemContext(context);
      setIsMessagePending(false);
    }
  }, [
    salesData,
    currentYear,
    setSystemContext,
    isCollecting,
    setIsMessagePending,
  ]);

  const handleMonthClick = (period: string) => {
    const month = parseInt(period.split(".")[1]);
    navigate(`/dashboard/sales/daily?year=${currentYear}&month=${month}`);
  };

  const handleUnloadCountClick = (period: string, unloadCount: number) => {
    if (unloadCount === 0) return;
    const month = parseInt(period.split(".")[1]);
    const startDate = new Date(currentYear, month - 1, 1);
    const endDate = new Date(currentYear, month, 1);
    navigate(
      `/dashboard/waybills?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>월별 매출 통계</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  월
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  하차물량
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  총 운송가액
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  평균 운송가액
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  정상처리건수
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  처리가액
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사고건수
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사고가액
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesData.map((data, index) => (
                <tr
                  key={`${data.period}-${index}`}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <button
                      onClick={() => handleMonthClick(data.period)}
                      className="flex items-center space-x-2 hover:text-blue-600 hover:underline transition-colors"
                      disabled={data.unloadCount === 0}
                    >
                      <span>{data.period}</span>
                      {data.unloadCount > 0 && (
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    <button
                      onClick={() =>
                        handleUnloadCountClick(data.period, data.unloadCount)
                      }
                      className={`flex items-center justify-end space-x-1 hover:text-blue-600 hover:underline transition-colors ${
                        data.unloadCount > 0
                          ? "cursor-pointer"
                          : "cursor-default"
                      }`}
                      disabled={data.unloadCount === 0}
                    >
                      <span>{formatNumber(data.unloadCount)}건</span>
                      {data.unloadCount > 0 && (
                        <Package className="h-3 w-3 opacity-60" />
                      )}
                    </button>
                  </td>
                  <td
                    className={`px-4 py-4 whitespace-nowrap text-sm text-right ${
                      data.totalShippingValue > 0
                        ? "text-gray-900 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {formatCurrency(data.totalShippingValue)}
                  </td>
                  <td
                    className={`px-4 py-4 whitespace-nowrap text-sm text-right ${
                      data.avgShippingValue > 0
                        ? "text-gray-900 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {formatCurrency(data.avgShippingValue)}
                  </td>
                  <td
                    className={`px-4 py-4 whitespace-nowrap text-sm text-right ${
                      data.normalProcessCount > 0
                        ? "text-gray-900 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {formatNumber(data.normalProcessCount)}건
                  </td>
                  <td
                    className={`px-4 py-4 whitespace-nowrap text-sm text-right ${
                      data.processValue > 0
                        ? "text-gray-900 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {formatCurrency(data.processValue)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    <span
                      className={data.accidentCount > 0 ? "text-red-600" : ""}
                    >
                      {formatNumber(data.accidentCount)}건
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    <span
                      className={data.accidentValue > 0 ? "text-red-600" : ""}
                    >
                      {formatCurrency(data.accidentValue)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {salesData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {currentYear}년 매출 데이터가 없습니다.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
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
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">월별 매출 현황</h1>
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
    </div>
  );
}
