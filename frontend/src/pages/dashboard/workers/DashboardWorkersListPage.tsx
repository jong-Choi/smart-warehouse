import { Suspense, useState, useCallback, useMemo } from "react";
import { useOperatorsSuspense } from "@hooks/useOperator";
import {
  sortOperatorsByNormalParcels,
  sortOperatorsByAccidentParcels,
} from "@/utils/operatorUtils";
import {
  SearchFilters,
  WorkersTable,
  PageHeader,
  TableSkeleton,
} from "./components";

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
    <div className="p-6">
      <PageHeader total={pagination?.total} isLoading={false} />
      <SearchFilters
        searchTerm={searchTerm}
        onSearchTermChange={handleSearchTermChange}
        onSearch={handleSearch}
      />
      <WorkersTable
        operators={operators}
        onPageChange={handlePageChange}
        currentPage={page}
        totalPages={pagination?.totalPages || 1}
        total={pagination?.total || 0}
        limit={limit}
        sorting={sorting}
        onSort={handleSort}
      />
    </div>
  );
}

export function DashboardWorkersListPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={20} />}>
      <WorkersListContent />
    </Suspense>
  );
}
