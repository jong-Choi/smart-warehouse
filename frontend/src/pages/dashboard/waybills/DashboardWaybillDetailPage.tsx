import { Suspense, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Package, Truck } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { SectionHeader, PageLayout } from "@components/ui";
import { useWaybillDetailSuspense } from "@/hooks/useWaybills";
import type { Waybill } from "@/types";
import { LoadingSkeleton } from "@components/dashboard/home/waybills";
import { StatusBadge } from "@ui/status-badge";
import { STATUS_MAP } from "@utils/stautsMap";
import { formatCurrency } from "@utils/formatString";
import { useWaybillDetailMessage } from "@components/dashboard/waybills/detail/hooks";

interface DashboardWaybillDetailPageProps {
  waybill?: Waybill;
}

function WaybillDetailContent({ waybill }: { waybill?: Waybill }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const suspenseWaybill = useWaybillDetailSuspense(id ? parseInt(id) : 0).data;
  const waybillData: Waybill | null = waybill
    ? waybill
    : id
    ? suspenseWaybill ?? null
    : null;

  // 챗봇 context hook
  const { setWaybillMessage, isCollecting } = useWaybillDetailMessage();

  // waybill 데이터가 변경될 때마다 context 업데이트
  useEffect(() => {
    if (isCollecting && waybillData) {
      const message = `운송장 번호: ${waybillData.number}
상태: ${STATUS_MAP[waybillData.status].text}
하차 예정일: ${format(new Date(waybillData.unloadDate), "yyyy년 MM월 dd일", {
        locale: ko,
      })}
${
  waybillData.processedAt
    ? `처리 일시: ${format(
        new Date(waybillData.processedAt),
        "yyyy년 MM월 dd일 HH:mm",
        { locale: ko }
      )}`
    : ""
}
작업자: ${waybillData.operator?.name || "미지정"}
배송지: ${waybillData.location?.name || "위치 정보 없음"}
사고 여부: ${waybillData.isAccident ? "사고" : "정상"}
${
  waybillData.parcel
    ? `운송 가액: ${formatCurrency(waybillData.parcel.declaredValue)}
소포 ID: #${waybillData.parcel.id}`
    : "물건 정보: 없음"
}`;
      setWaybillMessage(message);
    }
  }, [isCollecting, waybillData, setWaybillMessage]);

  if (!waybillData) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <p className="text-destructive font-medium">
            운송장을 찾을 수 없습니다.
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
    <PageLayout>
      {/* 헤더 */}
      <div className="mb-6">
        <SectionHeader
          title="운송장 상세 정보"
          description={`운송장 번호: ${waybillData.number}`}
        />
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
              <span className="font-medium">{waybillData.number}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">상태</span>
              <StatusBadge color={STATUS_MAP[waybillData.status].color}>
                {STATUS_MAP[waybillData.status].text}
              </StatusBadge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">하차 예정일</span>
              <span className="font-medium">
                {format(new Date(waybillData.unloadDate), "yyyy년 MM월 dd일", {
                  locale: ko,
                })}
              </span>
            </div>
            {waybillData.processedAt && (
              <>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    처리 일시
                  </span>
                  <span className="font-medium">
                    {format(
                      new Date(waybillData.processedAt),
                      "yyyy년 MM월 dd일 HH:mm",
                      { locale: ko }
                    )}
                  </span>
                </div>
              </>
            )}
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">작업자</span>
              <span className="font-medium">
                {waybillData.operator?.name || "미지정"}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">배송지</span>
              <span className="font-medium">
                {waybillData.location?.name || "위치 정보 없음"}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">사고 여부</span>
              <StatusBadge color={waybillData.isAccident ? "red" : "green"}>
                {waybillData.isAccident ? "사고" : "정상"}
              </StatusBadge>
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
            {waybillData.parcel ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    운송 가액
                  </span>
                  <span className="font-medium text-lg">
                    {formatCurrency(waybillData.parcel.declaredValue)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">소포 ID</span>
                  <span className="font-medium">#{waybillData.parcel.id}</span>
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
    </PageLayout>
  );
}

export default function DashboardWaybillDetailPage(
  props: DashboardWaybillDetailPageProps
) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <WaybillDetailContent {...props} />
    </Suspense>
  );
}
