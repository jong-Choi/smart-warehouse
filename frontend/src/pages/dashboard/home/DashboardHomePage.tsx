import React from "react";
import { DonutChart } from "../../../components/ui";
import { Package, Truck, CheckCircle, AlertTriangle } from "lucide-react";

function DashboardHomePage() {
  // 도넛 차트 데이터 - 기존 색상과 일치
  const chartData = [
    { name: "하차 예정 수량", value: 45, color: "#6B7280" }, // gray-500
    { name: "하차 수량", value: 32, color: "#3B82F6" }, // blue-500
    { name: "처리완료 수량", value: 28, color: "#10B981" }, // green-500
    { name: "파손 수량", value: 5, color: "#EF4444" }, // red-500
  ];

  const totalCount = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">대시보드 홈</h1>
          <p className="text-muted-foreground">
            물류센터의 전체 현황을 한눈에 확인하세요.
          </p>
        </div>
      </div>

      {/* 기존 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900">총 아이템</h3>
          <p className="text-2xl font-bold text-blue-700">1,234</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900">활성 주문</h3>
          <p className="text-2xl font-bold text-green-700">56</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-900">수익</h3>
          <p className="text-2xl font-bold text-purple-700">₩12,345,000</p>
        </div>
      </div>

      {/* 도넛 차트와 통계가 함께 있는 섹션 - 절반 너비 */}
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
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">하차 예정 수량</span>
                    </div>
                    <span className="text-xl font-bold text-gray-700">45</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">하차 수량</span>
                    </div>
                    <span className="text-xl font-bold text-blue-700">32</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">처리완료 수량</span>
                    </div>
                    <span className="text-xl font-bold text-green-700">28</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="font-medium">파손 수량</span>
                    </div>
                    <span className="text-xl font-bold text-red-700">5</span>
                  </div>
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
    </div>
  );
}

export default DashboardHomePage;
