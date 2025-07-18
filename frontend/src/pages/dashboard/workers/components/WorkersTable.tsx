import { memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table";
import { Calendar, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@components/ui/button";
import type { Operator } from "@/types/operator";

interface WorkersTableProps {
  operators: Operator[];
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case "LOADER":
      return "로더";
    case "UNLOADER":
      return "언로더";
    case "SORTER":
      return "분류자";
    default:
      return type;
  }
};

export const WorkersTable = memo<WorkersTableProps>(
  ({ operators, onPageChange, currentPage, totalPages, total, limit }) => {
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
                <TableHead>코드</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>타입</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>근무일수</TableHead>
                <TableHead>처리 소포</TableHead>
                <TableHead>등록일</TableHead>
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
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      {getTypeLabel(operator.type)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      활성
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{operator._count?.shifts || 0}일</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span>{operator._count?.parcels || 0}개</span>
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
