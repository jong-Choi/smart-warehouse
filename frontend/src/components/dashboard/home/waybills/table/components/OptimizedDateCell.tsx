import React, { useMemo } from "react";

interface OptimizedDateCellProps {
  date: string;
}

// 최적화된 날짜 셀 컴포넌트
export const OptimizedDateCell = React.memo<OptimizedDateCellProps>(
  ({ date }) => {
    const formattedDate = useMemo(() => {
      if (!date) return "-";
      return new Date(date).toLocaleString("ko-KR");
    }, [date]);

    return <div className="text-sm text-muted-foreground">{formattedDate}</div>;
  }
);

OptimizedDateCell.displayName = "OptimizedDateCell";
