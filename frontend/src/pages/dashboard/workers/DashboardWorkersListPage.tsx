import { useState, useCallback } from "react";
import { useOperators } from "@hooks/useOperator";
import {
  SearchFilters,
  WorkersTable,
  PageHeader,
  LoadingState,
  ErrorState,
} from "./components";

export function DashboardWorkersListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

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

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <div className="p-6">
      <PageHeader total={pagination?.total || 0} />

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
