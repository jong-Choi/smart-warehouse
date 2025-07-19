import { useState, useCallback } from "react";
import { useOperators } from "@hooks/useOperator";
import {
  sortOperatorsByNormalParcels,
  sortOperatorsByAccidentParcels,
} from "@/utils/operatorUtils";
import {
  SearchFilters,
  WorkersTable,
  PageHeader,
  ErrorState,
  TableSkeleton,
} from "./components";

export function DashboardWorkersListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([
    { id: "name", desc: false }, // 기본값: 이름 오름차순
  ]);

  // 정렬 파라미터 변환
  const currentSort = sorting[0]; // 단일 정렬만 지원
  let sortField: string | undefined = currentSort?.id;
  let sortDirection: "asc" | "desc" | undefined = currentSort?.desc
    ? "desc"
    : "asc";

  // 특별한 정렬 필드들은 프론트엔드에서 처리
  const isClientSideSort =
    sortField === "normalParcels" || sortField === "accidentParcels";

  if (isClientSideSort) {
    sortField = undefined;
    sortDirection = undefined;
  }

  const {
    data: operatorsData,
    isLoading,
    error,
  } = useOperators({
    page,
    limit,
    search: appliedSearch || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    sortField,
    sortDirection,
  });

  let operators = operatorsData?.data || [];
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

  const handleTypeFilterChange = useCallback((value: string) => {
    setTypeFilter(value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSort = useCallback((columnId: string) => {
    setSorting((prev) => {
      const currentSort = prev.find((sort) => sort.id === columnId);
      if (currentSort) {
        // 이미 정렬된 컬럼이면 방향만 변경
        return prev.map((sort) =>
          sort.id === columnId ? { ...sort, desc: !sort.desc } : sort
        );
      } else {
        // 새로운 컬럼 정렬
        return [{ id: columnId, desc: false }];
      }
    });
    setPage(1); // 정렬 변경 시 첫 페이지로 이동
  }, []);

  if (error) {
    return <ErrorState />;
  }

  return (
    <div className="p-6">
      <PageHeader total={pagination?.total} isLoading={isLoading} />

      <SearchFilters
        searchTerm={searchTerm}
        typeFilter={typeFilter}
        onSearchTermChange={handleSearchTermChange}
        onTypeFilterChange={handleTypeFilterChange}
        onSearch={handleSearch}
      />

      {isLoading ? (
        <TableSkeleton rows={limit} />
      ) : (
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
      )}
    </div>
  );
}
