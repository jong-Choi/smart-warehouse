import React from "react";

interface StatsCardProps {
  title: string;
  value: number;
  color?: string;
}

/**
 * 통계 정보를 표시하는 카드 컴포넌트
 */
export const StatsCard = React.memo<StatsCardProps>(
  ({ title, value, color = "" }) => (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="text-sm font-medium">{title}</div>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  )
);

StatsCard.displayName = "StatsCard";
