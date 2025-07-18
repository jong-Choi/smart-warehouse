import { User } from "lucide-react";

interface PageHeaderProps {
  total: number;
}

export function PageHeader({ total }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">작업자 목록</h1>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <User className="w-4 h-4" />
        <span>총 {total}명의 작업자</span>
      </div>
    </div>
  );
}
