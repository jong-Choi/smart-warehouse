import { create } from "zustand";
import type { UnloadingParcel } from "../components/dashboard/unloading/types";

interface UnloadingParcelsState {
  parcels: UnloadingParcel[];
  setParcels: (parcels: UnloadingParcel[]) => void;
  updateParcel: (waybillId: number, updates: Partial<UnloadingParcel>) => void;
  clearParcels: () => void;
}

export const useUnloadingParcelsStore = create<UnloadingParcelsState>(
  (set) => ({
    parcels: [],

    setParcels: (parcels) => set({ parcels }),

    updateParcel: (waybillId, updates) =>
      set((state) => ({
        parcels: state.parcels.map((parcel) =>
          parcel.waybillId === waybillId ? { ...parcel, ...updates } : parcel
        ),
      })),

    clearParcels: () => set({ parcels: [] }),
  })
);
