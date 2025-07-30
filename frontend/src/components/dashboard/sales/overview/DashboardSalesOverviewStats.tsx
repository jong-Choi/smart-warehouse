import { useNavigate } from "react-router-dom";
import { CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
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
import Stat from "@components/ui/stat";
import { formatCurrency, formatNumber } from "@utils/formatString";
import {
  useLocationSalesSuspense,
  useSalesOverviewSuspense,
} from "@hooks/useSales";
import { useEffect } from "react";

export function DashboardSalesOverviewStats({
  currentYear,
  setStatsMessage,
  isCollecting,
}: {
  currentYear: number;
  setStatsMessage: (message: string) => void;
  isCollecting: boolean;
}) {
  const { data: overviewRes } = useSalesOverviewSuspense(currentYear);
  const overviewData = overviewRes.data;
  const { data: locationRes } = useLocationSalesSuspense(currentYear);
  const locationData = locationRes.data;

  const navigate = useNavigate();
  const handleLocationClick = (locationId: number) => {
    navigate(`/dashboard/location/waybills/${encodeURIComponent(locationId)}`);
  };

  useEffect(() => {
    if (isCollecting) {
      setStatsMessage(`⦁ 전체 매출 현황:
- 총 매출: ${overviewData.totalRevenue?.toLocaleString() || 0}원
- 평균 운송가액: ${overviewData.avgShippingValue?.toLocaleString() || 0}원
- 사고 손실률: ${overviewData.accidentLossRate || 0}%
- 월별 성장률: ${overviewData.monthlyGrowthRate || 0}%

⦁ 처리 현황:
- 총 처리 건수: ${overviewData.totalProcessedCount?.toLocaleString() || 0}건
- 총 사고 건수: ${overviewData.totalAccidentCount?.toLocaleString() || 0}건
- 이번 달 매출: ${overviewData.currentMonthRevenue?.toLocaleString() || 0}원`);
    }
  }, [isCollecting, setStatsMessage, overviewData]);
  return (
    <>
      {/* 매출 요약 + 추가 통계 카드들 */}
      <Stat.Container>
        <Stat.Head>
          <div className="text-lg font-semibold mb-2">매출 요약 및 통계</div>
          <p className="text-sm text-muted-foreground mb-4">
            올해 전체 매출, 주요 지표, 처리 건수 등 상세 통계를 한눈에
            확인하세요.
          </p>
        </Stat.Head>
        <Stat.Grid cols={1} className="grid-cols-1 @[950px]:grid-cols-3">
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
        <Stat.Grid
          cols={1}
          className="mt-6 grid-cols-1 @[350px]:grid-cols-2 @[950px]:grid-cols-4"
        >
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
          <Stat.Head className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            지역별 매출 현황
          </Stat.Head>
          <CardContent className="p-0">
            {locationData.length > 0 ? (
              <>
                <div className="space-y-4">
                  {locationData.slice(0, 5).map((location, index) => (
                    <div
                      key={location.locationId}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => handleLocationClick(location.locationId)}
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
          <Stat.Head className="flex items-center gap-2">
            <ExternalLink className="mr-2 h-4 w-4" />
            빠른 액션
          </Stat.Head>
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
    </>
  );
}
