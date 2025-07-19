import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  ArrowLeft,
  Package,
  Truck,
  User,
  MapPin,
  Calendar,
} from "lucide-react";
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
      case "IN_TRANSIT":
        return "bg-blue-100 text-blue-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "RETURNED":
        return "bg-yellow-100 text-yellow-800";
      case "ERROR":
        return "bg-red-100 text-red-800";
      case "PENDING_UNLOAD":
        return "bg-orange-100 text-orange-800";
      case "UNLOADED":
        return "bg-purple-100 text-purple-800";
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
      case "IN_TRANSIT":
        return "운송중";
      case "DELIVERED":
        return "배송완료";
      case "RETURNED":
        return "반송";
      case "ERROR":
        return "오류";
      case "PENDING_UNLOAD":
        return "하차 대기";
      case "UNLOADED":
        return "하차 완료";
      case "NORMAL":
        return "정상";
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
              <span className="text-sm text-muted-foreground">출발일</span>
              <span className="font-medium">
                {format(new Date(waybill.shippedAt), "yyyy년 MM월 dd일", {
                  locale: ko,
                })}
              </span>
            </div>
            {waybill.deliveredAt && (
              <>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">도착일</span>
                  <span className="font-medium">
                    {format(new Date(waybill.deliveredAt), "yyyy년 MM월 dd일", {
                      locale: ko,
                    })}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              소포 통계
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">총 소포 수</span>
              <span className="font-medium text-lg">
                {waybill.parcels.length}개
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">총 운송가액</span>
              <span className="font-medium text-lg">
                {formatCurrency(
                  waybill.parcels.reduce(
                    (sum, parcel) => sum + parcel.declaredValue,
                    0
                  )
                )}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                평균 운송가액
              </span>
              <span className="font-medium">
                {waybill.parcels.length > 0
                  ? formatCurrency(
                      waybill.parcels.reduce(
                        (sum, parcel) => sum + parcel.declaredValue,
                        0
                      ) / waybill.parcels.length
                    )
                  : "0원"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 소포 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            소포 목록 ({waybill.parcels.length}개)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">소포 ID</th>
                  <th className="text-left p-3 font-medium">상태</th>
                  <th className="text-left p-3 font-medium">위치</th>
                  <th className="text-left p-3 font-medium">운송가액</th>
                  <th className="text-left p-3 font-medium">처리일시</th>
                  <th className="text-left p-3 font-medium">작업자</th>
                  <th className="text-left p-3 font-medium">사고 여부</th>
                </tr>
              </thead>
              <tbody>
                {waybill.parcels.map((parcel) => (
                  <tr key={parcel.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">#{parcel.id}</td>
                    <td className="p-3">
                      <Badge className={getStatusBadgeClass(parcel.status)}>
                        {getStatusText(parcel.status)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {parcel.location?.name || "위치 정보 없음"}
                      </div>
                    </td>
                    <td className="p-3 font-medium">
                      {formatCurrency(parcel.declaredValue)}
                    </td>
                    <td className="p-3">
                      {parcel.processedAt ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(
                            new Date(parcel.processedAt),
                            "yyyy-MM-dd HH:mm",
                            { locale: ko }
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3">
                      {parcel.operator ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {parcel.operator.name}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          parcel.isAccident ? "destructive" : "secondary"
                        }
                      >
                        {parcel.isAccident ? "사고" : "정상"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
