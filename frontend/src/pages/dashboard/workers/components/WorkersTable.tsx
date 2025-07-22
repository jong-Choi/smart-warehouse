import { memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  SortableHeader,
} from "@ui/table";
import { Calendar, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@components/ui/button";
import {
  getNormalParcelCount,
  getAccidentParcelCount,
} from "@/utils/operatorUtils";
import type { Operator } from "@/types/operator";
import { StatusBadge } from "@ui/status-badge";
import { STATUS_MAP } from "@utils/stautsMap";

interface WorkersTableProps {
  operators: Operator[];
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  sorting: Array<{ id: string; desc: boolean }>;
  onSort: (columnId: string) => void;
}

export const WorkersTable = memo<WorkersTableProps>(
  ({
    operators,
    onPageChange,
    currentPage,
    totalPages,
    total,
    limit,
    sorting,
    onSort,
  }) => {
    const navigate = useNavigate();
    return (
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">작업자 정보</h2>
        </div>
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader
                  columnId="code"
                  sorting={sorting}
                  onSort={onSort}
                >
                  코드
                </SortableHeader>
                <SortableHeader
                  columnId="name"
                  sorting={sorting}
                  onSort={onSort}
                >
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
                  onClick={() =>
                    navigate(`/dashboard/workers/${operator.code}`)
                  }
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
          </Table>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                {total}개 중 {(currentPage - 1) * limit + 1}-
                {Math.min(currentPage * limit, total)}개 표시
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  이전
                </Button>
                <span className="flex items-center px-3 text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  다음
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

WorkersTable.displayName = "WorkersTable";
