import React from "react";
import { TableHead, TableHeader, TableRow } from "../../../../ui/table";

export const UnloadingTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>운송장 번호</TableHead>
        <TableHead>상태</TableHead>
        <TableHead>등록일시</TableHead>
        <TableHead>하차일시</TableHead>
        <TableHead>처리일시</TableHead>
        <TableHead>처리 작업자</TableHead>
        <TableHead className="text-right">운송가액</TableHead>
      </TableRow>
    </TableHeader>
  );
};
