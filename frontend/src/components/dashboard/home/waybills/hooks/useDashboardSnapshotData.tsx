import { useState, useEffect, useCallback } from "react";
import { useUnloadingParcelsStore } from "@/stores/unloadingParcelsStore";
import type { UnloadingParcel } from "@components/dashboard/home/waybills/types";

export function useDashboardSnapshotData() {
  const hasData = useUnloadingParcelsStore(
    (state) => state.parcels && state.parcels.length > 0
  );

  const [tableData, setTableData] = useState<UnloadingParcel[] | null>(null);

  const createSnapshot = useCallback(() => {
    const currentParcels = useUnloadingParcelsStore.getState().parcels;
    if (!currentParcels || currentParcels.length === 0) {
      setTableData(null);
      return;
    }
    setTableData([...currentParcels]); // 깊은 복사
  }, []);

  useEffect(() => {
    if (hasData && tableData === null) {
      createSnapshot();
    }
  }, [hasData, tableData, createSnapshot]);

  const handleRefresh = useCallback(() => {
    createSnapshot();
  }, [createSnapshot]);

  return {
    tableData,
    handleRefresh,
  };
}
