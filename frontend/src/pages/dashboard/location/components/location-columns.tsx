import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "../../../../ui/badge";
import { Button } from "../../../../ui/button";
import type { Location } from "../../../../types/location";
import {
  MapPin,
  Package,
  Truck,
  AlertTriangle,
  DollarSign,
} from "lucide-react";

export const columns: ColumnDef<Location>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue<number>("id")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "위치명",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="font-medium">{row.getValue<string>("name")}</div>
          {row.original.address && (
            <div className="text-sm text-muted-foreground">
              {row.original.address}
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "parcelCount",
    header: "소포 수량",
    cell: ({ row }) => {
      const value = row.getValue<number>("parcelCount");
      return (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{value.toLocaleString()}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "workCount",
    header: "작업 수",
    cell: ({ row }) => {
      const value = row.getValue<number>("workCount");
      return (
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-green-500" />
          <span className="font-medium">{value}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "pendingUnloadCount",
    header: "하차 예정",
    cell: ({ row }) => {
      const value = row.getValue<number>("pendingUnloadCount");
      return (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            {value}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "totalProcessedCount",
    header: "총 처리량",
    cell: ({ row }) => {
      const value = row.getValue<number>("totalProcessedCount");
      return <div className="font-medium">{value.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "accidentCount",
    header: "사고 건수",
    cell: ({ row }) => {
      const count = row.getValue<number>("accidentCount");
      return (
        <div className="flex items-center gap-2">
          {count > 0 ? (
            <Badge variant="destructive" className="bg-red-100 text-red-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {count}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-green-600 border-green-200"
            >
              0
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "totalRevenue",
    header: "총 수익",
    cell: ({ row }) => {
      const value = row.getValue<number>("totalRevenue");
      return (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-500" />
          <span className="font-medium">₩{value.toLocaleString()}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "accidentAmount",
    header: "사고 금액",
    cell: ({ row }) => {
      const amount = row.getValue<number>("accidentAmount");
      return (
        <div className="flex items-center gap-2">
          {amount > 0 ? (
            <span className="text-red-600 font-medium">
              -₩{amount.toLocaleString()}
            </span>
          ) : (
            <span className="text-green-600 font-medium">₩0</span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "작업",
    cell: () => (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          상세보기
        </Button>
        <Button variant="outline" size="sm">
          편집
        </Button>
      </div>
    ),
  },
];
