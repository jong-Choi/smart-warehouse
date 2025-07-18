import { TableHeader, TableRow } from "@ui/table";
import { SortableHeader } from "@/components/ui/sortable-header";
import { useUnloadingTableStore } from "@/stores/unloadingTableStore";

export const UnloadingTableHeader: React.FC = () => {
  const { sorting, setSorting } = useUnloadingTableStore();

  const handleSort = (columnId: string) => {
    setSorting((prev) => {
      const currentSort = prev.find((sort) => sort.id === columnId);

      if (!currentSort) {
        // 첫 번째 정렬: 오름차순
        return [{ id: columnId, desc: false }];
      } else if (!currentSort.desc) {
        // 두 번째 정렬: 내림차순
        return [{ id: columnId, desc: true }];
      } else {
        // 세 번째 정렬: 정렬 해제
        return [];
      }
    });
  };

  return (
    <TableHeader>
      <TableRow>
        <SortableHeader
          columnId="waybillId"
          sorting={sorting}
          onSort={handleSort}
        >
          운송장 번호
        </SortableHeader>
        <SortableHeader columnId="status" sorting={sorting} onSort={handleSort}>
          상태
        </SortableHeader>
        <SortableHeader
          columnId="createdAt"
          sorting={sorting}
          onSort={handleSort}
        >
          등록일시
        </SortableHeader>
        <SortableHeader
          columnId="unloadedAt"
          sorting={sorting}
          onSort={handleSort}
        >
          하차일시
        </SortableHeader>
        <SortableHeader
          columnId="workerProcessedAt"
          sorting={sorting}
          onSort={handleSort}
        >
          처리일시
        </SortableHeader>
        <SortableHeader
          columnId="processedBy"
          sorting={sorting}
          onSort={handleSort}
        >
          처리 작업자
        </SortableHeader>
        <SortableHeader
          columnId="declaredValue"
          sorting={sorting}
          onSort={handleSort}
          className="text-right"
        >
          운송가액
        </SortableHeader>
      </TableRow>
    </TableHeader>
  );
};
