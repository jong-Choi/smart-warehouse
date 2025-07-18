import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/ui/button";
import { useOperatorDetail } from "@/hooks/useOperator";
import { WorkerDetailTable } from "@/components/dashboard/workers/detail/WorkerDetailTable";

export const DashboardWorkerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: operator, isLoading, error } = useOperatorDetail(id || "");

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
            <Link to="/dashboard/realtime/workers">
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
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/dashboard/realtime/workers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Link>
        </Button>
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
      <WorkerDetailTable
        operatorId={operator.id.toString()}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </div>
  );
};
