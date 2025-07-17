import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "../../../../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

interface TablePaginationProps {
  pageIndex: number;
  pageSize: number;
  totalRows: number;
  filteredRows: number;
  pageCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPageIndexChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  pageIndex,
  pageSize,
  totalRows,
  filteredRows,
  pageCount,
  canPreviousPage,
  canNextPage,
  onPageIndexChange,
  onPageSizeChange,
}) => {
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {totalRows}개 중 {filteredRows}개 표시
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">페이지당 행 수</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          페이지 {pageIndex + 1} / {pageCount}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageIndexChange(0)}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">첫 페이지로 이동</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageIndexChange(pageIndex - 1)}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">이전 페이지로 이동</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageIndexChange(pageIndex + 1)}
            disabled={!canNextPage}
          >
            <span className="sr-only">다음 페이지로 이동</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageIndexChange(pageCount - 1)}
            disabled={!canNextPage}
          >
            <span className="sr-only">마지막 페이지로 이동</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
