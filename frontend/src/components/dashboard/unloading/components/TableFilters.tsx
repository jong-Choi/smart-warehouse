import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TableFiltersProps {
  globalFilter: string;
  statusFilter: string;
  onGlobalFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusFilterChange: (value: string) => void;
}

export const TableFilters: React.FC<TableFiltersProps> = ({
  globalFilter,
  statusFilter,
  onGlobalFilterChange,
  onStatusFilterChange,
}) => {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex items-center gap-2 flex-1">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="운송장 번호로 검색..."
          value={globalFilter ?? ""}
          onChange={onGlobalFilterChange}
          className="max-w-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">상태:</span>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="PENDING_UNLOAD">하차 대기</SelectItem>
            <SelectItem value="UNLOADED">하차 완료</SelectItem>
            <SelectItem value="NORMAL">정상</SelectItem>
            <SelectItem value="ACCIDENT">사고</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
