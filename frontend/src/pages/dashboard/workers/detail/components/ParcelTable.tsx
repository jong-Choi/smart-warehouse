import { Table, TableBody, TableCell, TableRow } from "@/ui/table";
import type { OperatorParcel } from "@/types/operator";

// 금액 포맷팅 유틸리티 함수
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "NORMAL":
      return "정상";
    case "ACCIDENT":
      return "사고";
    case "UNLOADED":
      return "하차완료";
    case "PENDING_UNLOAD":
      return "하차대기";
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "NORMAL":
      return "bg-green-100 text-green-800";
    case "ACCIDENT":
      return "bg-red-100 text-red-800";
    case "UNLOADED":
      return "bg-blue-100 text-blue-800";
    case "PENDING_UNLOAD":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

interface ParcelTableProps {
  parcels: OperatorParcel[];
  total: number;
}

export function ParcelTable({ parcels, total }: ParcelTableProps) {
  return (
    <div className="bg-card rounded-lg border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">처리 내역</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">총 {total}개</span>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <thead>
              <tr>
                <th className="px-4 py-3 text-left font-medium">운송장 번호</th>
                <th className="px-4 py-3 text-left font-medium">상태</th>
                <th className="px-4 py-3 text-left font-medium">배송지</th>
                <th className="px-4 py-3 text-left font-medium">보험가액</th>
                <th className="px-4 py-3 text-left font-medium">처리일시</th>
              </tr>
            </thead>
            <TableBody>
              {parcels.map((parcel) => (
                <TableRow key={parcel.id}>
                  <TableCell className="font-medium">
                    {parcel.waybill.number}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                        parcel.status
                      )}`}
                    >
                      {getStatusLabel(parcel.status)}
                    </span>
                  </TableCell>
                  <TableCell>{parcel.location.name}</TableCell>
                  <TableCell>{formatCurrency(parcel.declaredValue)}</TableCell>
                  <TableCell>
                    {new Date(parcel.processedAt).toLocaleString("ko-KR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
