export interface Location {
  id: number;
  name: string;
  address: string | null;
  waybillCount: number;
  workCount: number;
  pendingUnloadCount: number;
  totalProcessedCount: number;
  accidentCount: number;
  totalRevenue: number;
  accidentAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationStats {
  total: number;
  locations: Location[];
}
