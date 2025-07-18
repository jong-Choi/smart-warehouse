export interface Operator {
  id: number;
  name: string;
  code: string;
  type: "HUMAN" | "MACHINE";
  createdAt: string;
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
