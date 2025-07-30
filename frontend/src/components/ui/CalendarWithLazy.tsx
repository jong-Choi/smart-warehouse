import { Skeleton } from "@ui/skeleton";
import React, { Suspense } from "react";
import type { DateRange } from "react-day-picker";

// Calendar 컴포넌트를 lazy 로딩
const Calendar = React.lazy(() =>
  import("./calendar").then((module) => ({
    default: module.Calendar,
  }))
);

interface CalendarWithLazyProps {
  fallback?: React.ReactNode;
  [key: string]: unknown;
}

export const CalendarWithLazy: React.FC<CalendarWithLazyProps> = ({
  fallback = <Skeleton className="w-[300px] h-[300px]" />,
  ...props
}) => {
  return (
    <Suspense fallback={fallback}>
      <Calendar {...props} />
    </Suspense>
  );
};

// 타입도 함께 export
export type { DateRange };
