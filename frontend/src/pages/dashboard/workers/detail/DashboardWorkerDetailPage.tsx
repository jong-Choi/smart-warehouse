import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOperatorDetail } from "@/hooks/useOperator";
import {
  DetailHeader,
  OperatorInfoCards,
  ParcelFilters,
  ParcelTable,
} from "./components";

export function DashboardWorkerDetailPage() {
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
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
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
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            작업자 정보를 불러오는데 실패했습니다.
          </p>
        </div>
      </div>
    );
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    setPage(1);
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    setPage(1);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <DetailHeader operator={operator} />
      <OperatorInfoCards operator={operator} />

      <ParcelFilters
        statusFilter={statusFilter}
        startDate={startDate}
        endDate={endDate}
        onStatusFilterChange={handleStatusFilterChange}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
      />

      <ParcelTable
        parcels={operator.parcels}
        total={operator.parcelsPagination?.total || 0}
      />

      {/* 페이징 */}
      {operator.parcelsPagination && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              페이지당 행 수:
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
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
  );
}
