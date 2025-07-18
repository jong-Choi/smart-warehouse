import { WaybillStats } from "@/components/dashboard/home/stats";

function DashboardHomePage() {
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

      {/* 운송장 현황 통계 */}
      <WaybillStats />
    </div>
  );
}

export default DashboardHomePage;
