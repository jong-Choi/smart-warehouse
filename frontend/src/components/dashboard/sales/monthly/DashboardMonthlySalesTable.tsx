import { useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/ui/table";
import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  flexRender,
} from "@tanstack/react-table";
import { SortableHeader } from "@/ui/table";
import { formatCurrency, formatNumber } from "@utils/formatString";
import { useMonthlySalesSuspense } from "@hooks/useSales";
import { generateMarkdownTable } from "@utils/tableToMarkdown";
import { ExternalLink, Package } from "lucide-react";
import type { SalesData } from "@/types/sales";
import { LoadingSkeleton } from "@components/dashboard/home/waybills";

export function DashboardMonthlySalesTable({
  currentYear,
  isCollecting,
  setTableMessage,
}: {
  currentYear: number;
  isCollecting: boolean;
  setTableMessage: (message: string) => void;
}) {
  const { data } = useMonthlySalesSuspense(currentYear);
  const salesData: SalesData[] = useMemo(
    () => (data && Array.isArray(data.data) ? data.data : []),
    [data]
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const navigate = useNavigate();

  const handleMonthClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, period: string) => {
      e.stopPropagation();
      const month = parseInt(period.split(".")[1]);
      navigate(`/dashboard/sales/daily?year=${currentYear}&month=${month}`);
    },
    [currentYear, navigate]
  );

  const handleUnloadCountClick = useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement | HTMLTableRowElement>,
      period: string,
      unloadCount: number
    ) => {
      e.stopPropagation();
      if (unloadCount === 0) return;
      const month = parseInt(period.split(".")[1]);
      const startDate = new Date(currentYear, month - 1, 1);
      const endDate = new Date(currentYear, month, 1);
      navigate(
        `/dashboard/waybills?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
    },
    [currentYear, navigate]
  );

  // 정렬 컬럼 정의
  const columns = useMemo(
    () => [
      {
        accessorKey: "period",
        header: "월",
        cell: (info: {
          getValue: () => string;
          row: { original: SalesData };
        }) => {
          const period = info.getValue();
          const unloadCount = info.row.original.unloadCount;
          return (
            <button
              onClick={(e) => handleMonthClick(e, period)}
              className="flex items-center space-x-2 hover:text-blue-600 hover:underline transition-colors"
              disabled={unloadCount === 0}
            >
              <span>{period}</span>
              {unloadCount > 0 && (
                <ExternalLink className="h-3 w-3 opacity-60" />
              )}
            </button>
          );
        },
      },
      {
        accessorKey: "unloadCount",
        header: "하차물량",
        enableSorting: true,
        cell: (info: {
          getValue: () => number;
          row: { original: SalesData };
        }) => {
          const unloadCount = info.getValue();
          const period = info.row.original.period;
          return (
            <button
              onClick={(e) => handleUnloadCountClick(e, period, unloadCount)}
              className={`flex items-center justify-end space-x-1 hover:text-blue-600 hover:underline transition-colors ${
                unloadCount > 0 ? "cursor-pointer" : "cursor-default"
              }`}
              disabled={unloadCount === 0}
            >
              <span>{formatNumber(unloadCount)}건</span>
              {unloadCount > 0 && <Package className="h-3 w-3 opacity-60" />}
            </button>
          );
        },
      },
      {
        accessorKey: "totalShippingValue",
        header: "총 운송가액",
        enableSorting: true,
        cell: (info: { getValue: () => number }) => {
          const value = info.getValue();
          return (
            <span
              className={
                value > 0 ? "text-gray-900 font-medium" : "text-gray-500"
              }
            >
              {formatCurrency(value)}
            </span>
          );
        },
      },
      {
        accessorKey: "avgShippingValue",
        header: "평균 운송가액",
        enableSorting: true,
        cell: (info: { getValue: () => number }) => {
          const value = info.getValue();
          return (
            <span
              className={
                value > 0 ? "text-gray-900 font-medium" : "text-gray-500"
              }
            >
              {formatCurrency(value)}
            </span>
          );
        },
      },
      {
        accessorKey: "normalProcessCount",
        header: "정상처리건수",
        enableSorting: true,
        cell: (info: { getValue: () => number }) => {
          const value = info.getValue();
          return (
            <span
              className={
                value > 0 ? "text-gray-900 font-medium" : "text-gray-500"
              }
            >
              {formatNumber(value)}건
            </span>
          );
        },
      },
      {
        accessorKey: "processValue",
        header: "처리가액",
        enableSorting: true,
        cell: (info: { getValue: () => number }) => {
          const value = info.getValue();
          return (
            <span
              className={
                value > 0 ? "text-gray-900 font-medium" : "text-gray-500"
              }
            >
              {formatCurrency(value)}
            </span>
          );
        },
      },
      {
        accessorKey: "accidentCount",
        header: "사고건수",
        enableSorting: true,
        cell: (info: { getValue: () => number }) => {
          const value = info.getValue();
          return (
            <span className={value > 0 ? "text-red-600" : ""}>
              {formatNumber(value)}건
            </span>
          );
        },
      },
      {
        accessorKey: "accidentValue",
        header: "사고가액",
        enableSorting: true,
        cell: (info: { getValue: () => number }) => {
          const value = info.getValue();
          return (
            <span className={value > 0 ? "text-red-600" : ""}>
              {formatCurrency(value)}
            </span>
          );
        },
      },
    ],
    [handleMonthClick, handleUnloadCountClick]
  );

  // 테이블 인스턴스 생성
  const table = useReactTable({
    data: salesData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    if (isCollecting) {
      setTableMessage(generateMarkdownTable(table));
    }
  }, [isCollecting, setTableMessage, table]);

  // 정렬 핸들러
  const handleSort = useCallback((columnId: string) => {
    setSorting((prev) => {
      const currentSort = prev.find((sort) => sort.id === columnId);
      if (!currentSort) {
        return [{ id: columnId, desc: false }];
      } else if (!currentSort.desc) {
        return [{ id: columnId, desc: true }];
      } else {
        return [];
      }
    });
  }, []);

  if (!salesData) return <LoadingSkeleton />;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {table.getHeaderGroups()[0].headers.map((header) => (
              <SortableHeader
                key={header.id}
                columnId={header.column.id}
                sorting={sorting}
                onSort={handleSort}
                className={
                  header.column.id === "period" ||
                  header.column.id === "unloadCount"
                    ? "text-left"
                    : "text-right"
                }
              >
                {header.column.columnDef.header as string}
              </SortableHeader>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row, index) => (
            <TableRow
              key={`${row.original.period}-${index}`}
              className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} ${
                row.original.unloadCount > 0
                  ? "cursor-pointer hover:bg-blue-50 transition-colors"
                  : ""
              }`}
              onClick={(e) => {
                if (row.original.unloadCount > 0) {
                  handleUnloadCountClick(
                    e,
                    row.original.period,
                    row.original.unloadCount
                  );
                }
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={
                    cell.column.id === "period"
                      ? "text-left"
                      : "text-right text-gray-500"
                  }
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {salesData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {currentYear}년 매출 데이터가 없습니다.
        </div>
      )}
    </>
  );
}
