import { Button } from "../../../ui/button";
import { LocationTable } from "./components/location-table";
import { columns } from "./components/location-columns";
import { locations } from "../../../data/location";
import {
  Plus,
  MapPin,
  Package,
  Truck,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

function DashboardLocationPage() {
  // 통계 계산
  const totalLocations = locations.length;
  const totalParcels = locations.reduce(
    (sum, location) => sum + location.parcelCount,
    0
  );
  const totalWorkCount = locations.reduce(
    (sum, location) => sum + location.workCount,
    0
  );
  const totalRevenue = locations.reduce(
    (sum, location) => sum + location.totalRevenue,
    0
  );
  const totalAccidents = locations.reduce(
    (sum, location) => sum + location.accidentCount,
    0
  );
  const totalAccidentAmount = locations.reduce(
    (sum, location) => sum + location.accidentAmount,
    0
  );
  const totalPendingUnload = locations.reduce(
    (sum, location) => sum + location.pendingUnloadCount,
    0
  );

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">위치 관리</h1>
          <p className="text-muted-foreground">
            물류센터 위치들을 관리하고 모니터링하세요.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />새 위치 추가
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">총 위치</h3>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{totalLocations}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> 이번 달
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">총 소포</h3>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">
              {totalParcels.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> 지난달 대비
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">총 수익</h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">
              ₩{totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> 지난달 대비
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">사고 건수</h3>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{totalAccidents}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">-3</span> 지난달 대비
            </p>
          </div>
        </div>
      </div>

      {/* 추가 통계 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">하차 예정</h3>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{totalPendingUnload}</div>
            <p className="text-xs text-muted-foreground">처리 대기 중</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">총 작업 수</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{totalWorkCount}</div>
            <p className="text-xs text-muted-foreground">진행 중인 작업</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">사고 손실</h3>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold text-red-600">
              -₩{totalAccidentAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">이번 달 손실</p>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">위치 목록</h3>
          <LocationTable columns={columns} data={locations} />
        </div>
      </div>
    </div>
  );
}

export default DashboardLocationPage;
