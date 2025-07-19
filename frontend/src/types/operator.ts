export interface ParcelStatusInfo {
  status: "PENDING_UNLOAD" | "UNLOADED" | "NORMAL" | "ACCIDENT";
  isAccident: boolean;
}

export interface Operator {
  id: number;
  name: string;
  code: string;
  type: "HUMAN" | "MACHINE";
  createdAt: string;
  _count?: {
    shifts: number;
    works: number;
    parcels: number;
  };
  parcels?: ParcelStatusInfo[];
}

export interface OperatorWithParcels extends Operator {
  parcels: ParcelStatusInfo[];
}

export interface OperatorDetail {
  id: number;
  name: string;
  code: string;
  type: "HUMAN" | "MACHINE";
  createdAt: string;
  shifts: OperatorShift[];
  works: OperatorWork[];
  parcels: OperatorParcel[];
  parcelsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OperatorShift {
  id: number;
  operatorId: number;
  date: string;
  startTime: string;
  endTime: string;
  operator: {
    id: number;
    name: string;
    code: string;
    type: "HUMAN" | "MACHINE";
  };
}

export interface OperatorWork {
  id: number;
  operatorId: number;
  date: string;
  locationId: number;
  processedCount: number;
  accidentCount: number;
  revenue: number;
  errorCount: number;
  createdAt: string;
  operator: {
    id: number;
    name: string;
    code: string;
    type: "HUMAN" | "MACHINE";
  };
  location: {
    id: number;
    name: string;
    address?: string;
  };
}

export interface OperatorParcel {
  id: number;
  waybillId: number;
  operatorId: number;
  locationId: number;
  status: "PENDING_UNLOAD" | "UNLOADED" | "NORMAL" | "ACCIDENT";
  declaredValue: number;
  processedAt: string;
  isAccident: boolean;
  location: {
    id: number;
    name: string;
    address?: string;
  };
  waybill: {
    id: number;
    number: string;
    status: string;
  };
}
