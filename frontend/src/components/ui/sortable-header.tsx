import React from "react";
import { TableHead } from "../../ui/table";
import { Button } from "./button";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface SortableHeaderProps {
  columnId: string;
  children: React.ReactNode;
  sorting: Array<{ id: string; desc: boolean }>;
  onSort: (columnId: string) => void;
  className?: string;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  columnId,
  children,
  sorting,
  onSort,
  className = "",
}) => {
  const handleSort = () => {
    onSort(columnId);
  };

  const getSortIcon = () => {
    const currentSort = sorting.find((sort) => sort.id === columnId);

    if (!currentSort) {
      return <ChevronsUpDown className="h-4 w-4" />;
    }

    return currentSort.desc ? (
      <ChevronDown className="h-4 w-4" />
    ) : (
      <ChevronUp className="h-4 w-4" />
    );
  };

  const isSorted = () => {
    return sorting.some((sort) => sort.id === columnId);
  };

  return (
    <TableHead className={className}>
      <Button
        variant="ghost"
        onClick={handleSort}
        className={`h-auto p-0 font-semibold hover:bg-transparent flex items-center gap-1 ${
          isSorted() ? "text-primary" : ""
        }`}
      >
        {children}
        {getSortIcon()}
      </Button>
    </TableHead>
  );
};
