import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { ParcelRow } from "./ParcelRow";
import type { UnloadingParcel } from "./types";

interface UnloadingTableProps {
  parcels: UnloadingParcel[];
  onRefresh: () => void;
}

export const UnloadingTable: React.FC<UnloadingTableProps> = ({
  parcels,
  onRefresh,
}) => {
  return (
    <div className="bg-card rounded-lg border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">운송장 목록</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              총 {parcels.length}개
            </span>
            <button
              onClick={onRefresh}
              className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              새로고침
            </button>
          </div>
        </div>

        {parcels.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            하차 대기 중인 운송장이 없습니다.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>운송장 번호</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>생성일시</TableHead>
                <TableHead>업데이트일시</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parcels.map((parcel) => (
                <ParcelRow key={parcel.id} parcel={parcel} />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
