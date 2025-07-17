import React, { useCallback } from "react";

interface OptimizedStatusCellProps {
  status: string;
}

// 최적화된 상태 셀 컴포넌트
export const OptimizedStatusCell = React.memo<OptimizedStatusCellProps>(
  ({ status }) => {
    const getStatusDisplay = useCallback((status: string) => {
      switch (status) {
        case "PENDING_UNLOAD":
          return {
            text: "하차 대기",
            className:
              "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
          };
        case "UNLOADED":
          return {
            text: "하차 완료",
            className:
              "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
          };
        case "NORMAL":
          return {
            text: "정상",
            className:
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          };
        case "ACCIDENT":
          return {
            text: "사고",
            className:
              "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          };
        default:
          return {
            text: status,
            className:
              "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
          };
      }
    }, []);

    const statusInfo = getStatusDisplay(status);

    return (
      <div className="flex items-center">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}
        >
          {statusInfo.text}
        </span>
      </div>
    );
  }
);

OptimizedStatusCell.displayName = "OptimizedStatusCell";
