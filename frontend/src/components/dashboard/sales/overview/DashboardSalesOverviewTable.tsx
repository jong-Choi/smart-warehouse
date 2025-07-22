import { useMemo, useCallback } from "react";
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
import type { LocationSalesData } from "@/api/salesApi";

export function DashboardSalesOverviewTable({
  locationData,
}: {
  locationData: LocationSalesData[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const navigate = useNavigate();
  const handleLocationClick = (locationName: string) => {
    navigate(
      `/dashboard/location/waybills?location=${encodeURIComponent(
        locationName
      )}`
    );
  };

  const rankedLocationData = useMemo(() => {
    const sorted = [...locationData].sort((a, b) => b.revenue - a.revenue);
    return locationData.map((item) => {
      const avgShippingValue =
        item.processedCount > 0 ? item.revenue / item.processedCount : 0;
      return {
        ...item,
        rank: sorted.findIndex((s) => s.locationName === item.locationName) + 1,
        avgShippingValue,
      };
    });
  }, [locationData]);

  // 정렬 컬럼 정의
  const columns = useMemo(
    () => [
      {
        accessorKey: "rank",
        header: "순위",
        enableSorting: true,
        cell: (info: { getValue: () => number }) => info.getValue(),
      },
      {
        accessorKey: "locationName",
        header: "지역명",
      },
      {
        accessorKey: "revenue",
        header: "매출",
        cell: (info: { getValue: () => number }) =>
          formatCurrency(info.getValue()),
      },
      {
        accessorKey: "processedCount",
        header: "처리건수",
        cell: (info: { getValue: () => number }) =>
          `${formatNumber(info.getValue())}건`,
      },
      {
        accessorKey: "accidentCount",
        header: "사고건수",
        cell: (info: { getValue: () => number }) => (
          <span className={info.getValue() > 0 ? "text-red-600" : ""}>
            {formatNumber(info.getValue())}건
          </span>
        ),
      },
      {
        accessorKey: "avgShippingValue",
        header: "평균 운송가액",
        enableSorting: true,
        cell: (info: { getValue: () => number }) =>
          formatCurrency(info.getValue()),
      },
    ],
    []
  );
  // 테이블 인스턴스 생성
  const table = useReactTable({
    data: rankedLocationData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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
  return (
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
                header.column.id === "revenue" ||
                header.column.id === "processedCount" ||
                header.column.id === "accidentCount" ||
                header.column.id === "avgShippingValue"
                  ? "text-right"
                  : ["rank"].includes(header.column.id)
                  ? "text-left"
                  : "text-center"
              }
            >
              {header.column.columnDef.header as string}
            </SortableHeader>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.original.locationName}
            onClick={() => handleLocationClick(row.original.locationName)}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={
                  [
                    "revenue",
                    "processedCount",
                    "accidentCount",
                    "avgShippingValue",
                  ].includes(cell.column.id)
                    ? "text-right text-gray-500"
                    : ["rank"].includes(cell.column.id)
                    ? "text-left"
                    : "text-center"
                }
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
