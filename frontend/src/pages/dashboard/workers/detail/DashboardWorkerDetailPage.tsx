import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOperatorDetail } from "@/hooks/useOperator";
import { Table, TableBody, TableCell, TableRow } from "@/ui/table";

// 금액 포맷팅 유틸리티 함수
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const DashboardWorkerDetailPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const {
    data: operator,
    isLoading,
    error,
  } = useOperatorDetail(
    code || "",
    page,
    pageSize,
    statusFilter,
    startDate || undefined,
    endDate || undefined
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/realtime/workers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로가기
            </Link>
          </Button>
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-4">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (error || !operator) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/workers/home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로가기
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            작업자 정보를 불러오는데 실패했습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Button variant="outline" size="sm" asChild>
        <Link to="/dashboard/workers/home">
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로가기
        </Link>
      </Button>
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {operator.name} ({operator.code})
          </h1>
          <p className="text-muted-foreground">작업자 상세 정보 및 처리 내역</p>
        </div>
      </div>

      {/* 기본 정보 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">
            작업자 타입
          </h3>
          <p className="text-lg font-medium">
            {operator.type === "HUMAN" ? "사람" : "기계"}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">
            등록일
          </h3>
          <p className="text-lg font-medium">
            {new Date(operator.createdAt).toLocaleDateString("ko-KR")}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">
            총 처리 건수
          </h3>
          <p className="text-lg font-medium">{operator.parcels.length}건</p>
        </div>
      </div>

      {/* 처리 내역 테이블 */}
      <div className="bg-card rounded-lg border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">처리 내역</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                총 {operator.parcelsPagination?.total || 0}개
              </span>
            </div>
          </div>

          {/* 필터링 섹션 */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">상태:</span>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="NORMAL">정상</SelectItem>
                  <SelectItem value="ACCIDENT">사고</SelectItem>
                  <SelectItem value="UNLOADED">하차완료</SelectItem>
                  <SelectItem value="PENDING_UNLOAD">하차대기</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">시작일:</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">종료일:</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-40"
              />
            </div>
          </div>

          {/* 테이블 */}
          <div className="rounded-md border">
            <Table>
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left font-medium">
                    운송장 번호
                  </th>
                  <th className="px-4 py-3 text-left font-medium">상태</th>
                  <th className="px-4 py-3 text-left font-medium">처리일시</th>
                  <th className="px-4 py-3 text-left font-medium">배송지</th>
                  <th className="px-4 py-3 text-left font-medium">운송가액</th>
                  <th className="px-4 py-3 text-left font-medium">사고여부</th>
                </tr>
              </thead>
              <TableBody>
                {operator.parcels && operator.parcels.length > 0 ? (
                  operator.parcels.map((parcel) => (
                    <TableRow key={parcel.id}>
                      <TableCell className="font-medium">
                        {parcel.waybill.number}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          switch (parcel.status) {
                            case "NORMAL":
                              return "정상";
                            case "ACCIDENT":
                              return "사고";
                            case "UNLOADED":
                              return "하차완료";
                            case "PENDING_UNLOAD":
                              return "하차대기";
                            default:
                              return parcel.status;
                          }
                        })()}
                      </TableCell>
                      <TableCell>
                        {new Date(parcel.processedAt).toLocaleString("ko-KR")}
                      </TableCell>
                      <TableCell>{parcel.location.name}</TableCell>
                      <TableCell>
                        {formatCurrency(parcel.declaredValue)}
                      </TableCell>
                      <TableCell>
                        {parcel.isAccident ? "예" : "아니오"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-12 text-center">
                      {(() => {
                        switch (statusFilter) {
                          case "NORMAL":
                            return "정상 처리 내역이 없습니다.";
                          case "ACCIDENT":
                            return "사고 처리 내역이 없습니다.";
                          case "UNLOADED":
                            return "하차 완료 내역이 없습니다.";
                          case "PENDING_UNLOAD":
                            return "하차 대기 내역이 없습니다.";
                          case "all":
                          default:
                            return "처리 내역이 없습니다.";
                        }
                      })()}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* 페이징 */}
          {operator.parcelsPagination && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  페이지당 행 수:
                </span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  이전
                </Button>
                <span className="text-sm">
                  {page} / {operator.parcelsPagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= operator.parcelsPagination.totalPages}
                >
                  다음
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
