import { useState, useCallback, useEffect, useMemo } from "react";
import { useOperators } from "@hooks/useOperator";
import { useChatbotStore } from "@/stores/chatbotStore";
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

  // 챗봇 스토어에서 컨텍스트 수집 관련 상태 가져오기
  const { setSystemContext, isCollecting } = useChatbotStore();

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

  // chatbot에 사용할 컨텍스트
  useEffect(() => {
    // isCollecting이 true일 때만 systemContext 업데이트
    if (operatorsData && isCollecting) {
      // operators 대신 operatorsData.data를 직접 사용
      const baseOperators = operatorsData.data || [];
      let displayOperators = [...baseOperators];

      // 클라이언트 사이드 정렬 처리 (컨텍스트용)
      if (isClientSideSort && displayOperators.length > 0) {
        if (currentSort?.id === "normalParcels") {
          displayOperators = sortOperatorsByNormalParcels(
            displayOperators,
            currentSort.desc
          );
        } else if (currentSort?.id === "accidentParcels") {
          displayOperators = sortOperatorsByAccidentParcels(
            displayOperators,
            currentSort.desc
          );
        }
      }

      const context = `현재 페이지: 작업자 목록 (/dashboard/workers/home)
시간: ${new Date().toLocaleString()}

📊 작업자 현황:
- 총 작업자 수: ${pagination?.total || 0}명
- 현재 페이지: ${page}/${pagination?.totalPages || 1}
- 페이지당 표시: ${limit}명

🔍 필터 조건:
- 검색어: ${appliedSearch || "없음"}
- 타입 필터: ${typeFilter}
- 정렬: ${currentSort?.id || "이름"} ${
        currentSort?.desc ? "내림차순" : "오름차순"
      }

👥 현재 표시된 작업자들 (${displayOperators.length}명):
${displayOperators
  .slice(0, 5)
  .map((op) => `- ${op.name} (${op.code}) - ${op.type}`)
  .join("\n")}
${displayOperators.length > 5 ? `... 외 ${displayOperators.length - 5}명` : ""}

💡 사용자가 현재 보고 있는 정보:
- 작업자들의 처리 실적과 사고 건수를 확인할 수 있는 페이지
- 검색, 필터링, 정렬 기능으로 원하는 작업자를 찾을 수 있음
- 페이지네이션으로 많은 작업자 데이터를 효율적으로 탐색`;
      setSystemContext(context);
    }
  }, [
    operatorsData,
    pagination,
    page,
    limit,
    appliedSearch,
    typeFilter,
    currentSort,
    setSystemContext,
    isClientSideSort,
    isCollecting,
  ]);

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
