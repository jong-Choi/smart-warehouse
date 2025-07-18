import { create } from "zustand";

interface UnloadingTableState {
  // 페이징 상태
  pageIndex: number;
  pageSize: number;
  lastPageIndex: number; // 최대 페이지 인덱스

  // 필터링 상태
  globalFilter: string;
  statusFilter: string;

  // 정렬 상태
  sorting: Array<{ id: string; desc: boolean }>;

  // 액션들
  setPageIndex: (pageIndex: number) => void;
  setPageSize: (pageSize: number) => void;
  setLastPageIndex: (lastPageIndex: number) => void;
  setGlobalFilter: (filter: string) => void;
  setStatusFilter: (filter: string) => void;
  setSorting: (
    sorting:
      | Array<{ id: string; desc: boolean }>
      | ((
          prev: Array<{ id: string; desc: boolean }>
        ) => Array<{ id: string; desc: boolean }>)
  ) => void;
  resetFilters: () => void;
  resetPagination: () => void;
  resetAll: () => void;
}

const INITIAL_STATE = {
  pageIndex: 0,
  pageSize: 10,
  lastPageIndex: 0,
  globalFilter: "",
  statusFilter: "all",
  sorting: [] as Array<{ id: string; desc: boolean }>,
};

export const useUnloadingTableStore = create<UnloadingTableState>()((set) => ({
  ...INITIAL_STATE,

  setPageIndex: (pageIndex: number) =>
    set((state) => ({
      pageIndex: Math.min(pageIndex, state.lastPageIndex),
    })),
  setPageSize: (pageSize: number) => set({ pageSize, pageIndex: 0 }), // 페이지 크기 변경 시 첫 페이지로
  setLastPageIndex: (lastPageIndex: number) =>
    set(() => ({
      lastPageIndex,
    })),
  setGlobalFilter: (globalFilter: string) => set({ globalFilter }), // 필터 변경 시 페이지 유지
  setStatusFilter: (statusFilter: string) => set({ statusFilter }), // 필터 변경 시 페이지 유지
  setSorting: (
    sorting:
      | Array<{ id: string; desc: boolean }>
      | ((
          prev: Array<{ id: string; desc: boolean }>
        ) => Array<{ id: string; desc: boolean }>)
  ) =>
    set((state) => ({
      sorting: typeof sorting === "function" ? sorting(state.sorting) : sorting,
    })),

  resetFilters: () =>
    set({
      globalFilter: INITIAL_STATE.globalFilter,
      statusFilter: INITIAL_STATE.statusFilter,
      pageIndex: 0,
    }),
  resetPagination: () =>
    set({
      pageIndex: INITIAL_STATE.pageIndex,
      pageSize: INITIAL_STATE.pageSize,
      lastPageIndex: INITIAL_STATE.lastPageIndex,
    }),
  resetAll: () => set(INITIAL_STATE),
}));
