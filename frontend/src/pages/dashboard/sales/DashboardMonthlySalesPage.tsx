import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMonthlySales } from "@/api/salesApi";
import type { SalesData } from "@/types/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table } from "@/ui/table";
import { ChevronLeft, ChevronRight, ExternalLink, Package } from "lucide-react";

export function DashboardMonthlySalesPage() {
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMonthlySales = async (year: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchMonthlySales(year);
      setSalesData(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "데이터 로딩 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMonthlySales(currentYear);
  }, [currentYear]);

  const handlePreviousYear = () => {
    setCurrentYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    setCurrentYear((prev) => prev + 1);
  };

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

  const handleMonthClick = (period: string) => {
    // "2024.01" 형식에서 월 추출
    const month = parseInt(period.split(".")[1]);
    navigate(`/dashboard/sales/daily?year=${currentYear}&month=${month}`);
  };

  const handleUnloadCountClick = (period: string, unloadCount: number) => {
    if (unloadCount === 0) return;

    // "2024.01" 형식에서 월 추출
    const month = parseInt(period.split(".")[1]);
    const startDate = new Date(currentYear, month - 1, 1);
    const endDate = new Date(currentYear, month, 1);

    navigate(
      `/dashboard/waybills?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    );
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-semibold">오류가 발생했습니다</p>
              <p className="mt-2">{error}</p>
              <Button
                onClick={() => loadMonthlySales(currentYear)}
                className="mt-4"
              >
                다시 시도
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      <Card>
        <CardHeader>
          <CardTitle>월별 매출 통계</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
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
                      key={data.period}
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
                            handleUnloadCountClick(
                              data.period,
                              data.unloadCount
                            )
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
                          className={
                            data.accidentCount > 0 ? "text-red-600" : ""
                          }
                        >
                          {formatNumber(data.accidentCount)}건
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        <span
                          className={
                            data.accidentValue > 0 ? "text-red-600" : ""
                          }
                        >
                          {formatCurrency(data.accidentValue)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {salesData.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  {currentYear}년 매출 데이터가 없습니다.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
