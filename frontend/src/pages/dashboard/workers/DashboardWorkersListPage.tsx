import React from "react";
import { useOperators } from "@hooks/useOperator";
import { User } from "lucide-react";
import { SearchFilters, WorkersTable } from "./components";

export function DashboardWorkersListPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [appliedSearch, setAppliedSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(20);

  const {
    data: operatorsData,
    isLoading,
    error,
  } = useOperators({
    page,
    limit,
    search: appliedSearch || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
  });

  const operators = operatorsData?.data || [];
  const pagination = operatorsData?.pagination;

  const handleSearch = React.useCallback(() => {
    setAppliedSearch(searchTerm);
    setPage(1);
  }, [searchTerm]);

  const handleSearchTermChange = React.useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleTypeFilterChange = React.useCallback((value: string) => {
    setTypeFilter(value);
    setPage(1);
  }, []);

  const handlePageChange = React.useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">작업자 목록</h1>
        </div>
        <div className="grid gap-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">작업자 목록</h1>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="text-center text-red-600">
            작업자 목록을 불러오는 중 오류가 발생했습니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">작업자 목록</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span>총 {pagination?.total || 0}명의 작업자</span>
        </div>
      </div>

      <SearchFilters
        searchTerm={searchTerm}
        typeFilter={typeFilter}
        onSearchTermChange={handleSearchTermChange}
        onTypeFilterChange={handleTypeFilterChange}
        onSearch={handleSearch}
      />

      <WorkersTable
        operators={operators}
        onPageChange={handlePageChange}
        currentPage={page}
        totalPages={pagination?.totalPages || 1}
        total={pagination?.total || 0}
        limit={limit}
      />
    </div>
  );
}
