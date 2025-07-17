import type { Parcel } from "../../../types/waybill";

export interface UnloadingParcel extends Parcel {
  createdAt: string;
  updatedAt: string;
}
