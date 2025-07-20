import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ArrowLeft, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchWaybillById } from "@/api/waybillApi";
import type { Waybill } from "@/types";

interface DashboardWaybillDetailPageProps {
  waybill?: Waybill;
  onBack?: () => void;
}

export default function DashboardWaybillDetailPage({
  waybill: propWaybill,
  onBack,
}: DashboardWaybillDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [waybill, setWaybill] = useState<Waybill | null>(propWaybill || null);
  const [loading, setLoading] = useState(!propWaybill);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWaybill = async () => {
      if (propWaybill) {
        setWaybill(propWaybill);
        setLoading(false);
        return;
      }

      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await fetchWaybillById(parseInt(id));
        setWaybill(data);
      } catch (err) {
        setError("운송장 정보를 불러오는데 실패했습니다.");
        console.error("Failed to load waybill:", err);
      } finally {
        setLoading(false);
      }
    };

    loadWaybill();
  }, [id, propWaybill]);

  // 상태별 배지 색상
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING_UNLOAD":
        return "bg-yellow-100 text-yellow-800";
      case "UNLOADED":
        return "bg-blue-100 text-blue-800";
      case "NORMAL":
        return "bg-green-100 text-green-800";
      case "ACCIDENT":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 상태 텍스트 변환
  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING_UNLOAD":
        return "하차 예정";
      case "UNLOADED":
        return "하차 완료";
      case "NORMAL":
        return "정상 처리";
      case "ACCIDENT":
        return "사고";
      default:
        return status;
    }
  };

  // 금액 포맷팅
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground ml-3">
            운송장 정보를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (error || !waybill) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <p className="text-destructive font-medium">
            {error || "운송장을 찾을 수 없습니다."}
          </p>
          <Button
            onClick={() => navigate("/dashboard/waybills")}
            variant="outline"
            className="mt-4"
          >
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack || (() => navigate("/dashboard/waybills"))}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로 돌아가기
        </Button>
        <h1 className="text-3xl font-bold">운송장 상세 정보</h1>
        <p className="text-muted-foreground">운송장 번호: {waybill.number}</p>
      </div>

      {/* 운송장 기본 정보 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              운송장 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">운송장 번호</span>
              <span className="font-medium">{waybill.number}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">상태</span>
              <Badge className={getStatusBadgeClass(waybill.status)}>
                {getStatusText(waybill.status)}
              </Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">하차 예정일</span>
              <span className="font-medium">
                {format(new Date(waybill.unloadDate), "yyyy년 MM월 dd일", {
                  locale: ko,
                })}
              </span>
            </div>
            {waybill.processedAt && (
              <>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    처리 일시
                  </span>
                  <span className="font-medium">
                    {format(
                      new Date(waybill.processedAt),
                      "yyyy년 MM월 dd일 HH:mm",
                      {
                        locale: ko,
                      }
                    )}
                  </span>
                </div>
              </>
            )}
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">작업자</span>
              <span className="font-medium">
                {waybill.operator?.name || "미지정"}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">배송지</span>
              <span className="font-medium">
                {waybill.location?.name || "위치 정보 없음"}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">사고 여부</span>
              <Badge variant={waybill.isAccident ? "destructive" : "secondary"}>
                {waybill.isAccident ? "사고" : "정상"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              물건 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {waybill.parcel ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    물건 가격
                  </span>
                  <span className="font-medium text-lg">
                    {formatCurrency(waybill.parcel.declaredValue)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">소포 ID</span>
                  <span className="font-medium">#{waybill.parcel.id}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                연결된 물건 정보가 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
