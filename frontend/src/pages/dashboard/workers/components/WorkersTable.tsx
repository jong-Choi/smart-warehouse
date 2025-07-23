import { memo } from "react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  SortableHeader,
} from "@ui/table";
import { Calendar, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getNormalParcelCount,
  getAccidentParcelCount,
} from "@/utils/operatorUtils";
import type { Operator } from "@/types/operator";
import { StatusBadge } from "@ui/status-badge";
import { STATUS_MAP } from "@utils/stautsMap";

interface WorkersTableProps {
  operators: Operator[];
  sorting: Array<{ id: string; desc: boolean }>;
  onSort: (columnId: string) => void;
}

export const WorkersTable = memo<WorkersTableProps>(
  ({ operators, sorting, onSort }) => {
    const navigate = useNavigate();
    return (
      <>
        <TableHeader>
          <TableRow>
            <SortableHeader columnId="code" sorting={sorting} onSort={onSort}>
              코드
            </SortableHeader>
            <SortableHeader columnId="name" sorting={sorting} onSort={onSort}>
              이름
            </SortableHeader>
            <TableHead>타입</TableHead>
            <TableHead>근무일수</TableHead>
            <SortableHeader
              columnId="normalParcels"
              sorting={sorting}
              onSort={onSort}
            >
              정상 처리
            </SortableHeader>
            <SortableHeader
              columnId="accidentParcels"
              sorting={sorting}
              onSort={onSort}
            >
              사고 처리
            </SortableHeader>
            <SortableHeader
              columnId="createdAt"
              sorting={sorting}
              onSort={onSort}
            >
              등록일
            </SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operators.map((operator) => (
            <TableRow
              key={operator.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/dashboard/workers/${operator.code}`)}
            >
              <TableCell className="font-mono">{operator.code}</TableCell>
              <TableCell className="font-medium">{operator.name}</TableCell>
              <TableCell>
                <StatusBadge color={STATUS_MAP[operator.type].color}>
                  {STATUS_MAP[operator.type].text}
                </StatusBadge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{operator._count?.shifts || 0}일</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4 text-green-500" />
                  <span>{getNormalParcelCount(operator)}개</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4 text-red-500" />
                  <span>{getAccidentParcelCount(operator)}개</span>
                </div>
              </TableCell>
              <TableCell>
                {new Date(operator.createdAt).toLocaleDateString("ko-KR")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </>
    );
  }
);

WorkersTable.displayName = "WorkersTable";
