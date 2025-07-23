import { Suspense, useState, useCallback, useMemo } from "react";
import { useOperatorsSuspense } from "@hooks/useOperator";
import {
  sortOperatorsByNormalParcels,
  sortOperatorsByAccidentParcels,
} from "@/utils/operatorUtils";
import { WorkersTable, PageHeader, TableSkeleton } from "./components";
import { Stat, PageLayout } from "@components/ui";
import { Search } from "lucide-react";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Table } from "@ui/table";
import React from "react";

function WorkersListContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([
    { id: "name", desc: false },
  ]);
  // 정렬 파라미터 변환
  const currentSort = sorting[0];
  let sortField: string | undefined = currentSort?.id;
  let sortDirection: "asc" | "desc" | undefined = currentSort?.desc
    ? "desc"
    : "asc";
  const isClientSideSort =
    sortField === "normalParcels" || sortField === "accidentParcels";
  if (isClientSideSort) {
    sortField = undefined;
    sortDirection = undefined;
  }
  // Suspense 데이터 패칭
  const { data: operatorsData } = useOperatorsSuspense({
    page,
    limit,
    search: appliedSearch || undefined,
    sortField,
    sortDirection,
  });
  let operators = useMemo(() => operatorsData?.data || [], [operatorsData]);
  const pagination = operatorsData?.pagination;
  // 클라이언트 사이드 정렬 처리
  if (isClientSideSort && operators.length > 0) {
    if (currentSort?.id === "normalParcels") {
      operators = sortOperatorsByNormalParcels(operators, currentSort.desc);
    } else if (currentSort?.id === "accidentParcels") {
      operators = sortOperatorsByAccidentParcels(operators, currentSort.desc);
    }
  }
  const handleSearch = useCallback(() => {
    setAppliedSearch(searchTerm);
    setPage(1);
  }, [searchTerm]);
  const handleSearchTermChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);
  const handleSort = useCallback((columnId: string) => {
    setSorting((prev) => {
      const currentSort = prev.find((sort) => sort.id === columnId);
      if (currentSort) {
        return prev.map((sort) =>
          sort.id === columnId ? { ...sort, desc: !sort.desc } : sort
        );
      } else {
        return [{ id: columnId, desc: false }];
      }
    });
    setPage(1);
  }, []);
  return (
    <PageLayout>
      <PageHeader total={pagination?.total} isLoading={false} />

      <Stat.Container>
        <div className="flex items-center justify-between mb-4">
          <Stat.Head className="mb-0">작업자 목록</Stat.Head>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              총 {pagination?.total || 0}명
            </span>
          </div>
        </div>

        {/* 필터링 섹션 */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="작업자 코드, 이름으로 검색..."
              value={searchTerm}
              onChange={(e) => handleSearchTermChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="max-w-sm"
            />
          </div>
          <Button onClick={handleSearch}>검색</Button>
        </div>

        {/* 테이블 */}
        <div className="rounded-md border">
          <Table>
            <WorkersTable
              operators={operators}
              sorting={sorting}
              onSort={handleSort}
            />
          </Table>
        </div>

        {/* 페이지네이션 */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              이전
            </Button>
            <div className="flex space-x-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (pageNum) =>
                    Math.abs(pageNum - page) <= 2 ||
                    pageNum === 1 ||
                    pageNum === pagination.totalPages
                )
                .map((pageNum, index, array) => (
                  <React.Fragment key={pageNum}>
                    {index > 0 && array[index - 1] !== pageNum - 1 && (
                      <span className="px-2 py-1 text-gray-500">...</span>
                    )}
                    <Button
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  </React.Fragment>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === pagination.totalPages}
            >
              다음
            </Button>
          </div>
        )}
      </Stat.Container>
    </PageLayout>
  );
}

export function DashboardWorkersListPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={20} />}>
      <WorkersListContent />
    </Suspense>
  );
}
