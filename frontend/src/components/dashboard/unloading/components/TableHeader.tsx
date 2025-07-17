import React from "react";
import { TableHead, TableHeader, TableRow } from "../../../../ui/table";

export const UnloadingTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>운송장 번호</TableHead>
        <TableHead>상태</TableHead>
        <TableHead>생성일시</TableHead>
        <TableHead>업데이트일시</TableHead>
      </TableRow>
    </TableHeader>
  );
};
