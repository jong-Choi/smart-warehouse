// mockWaybills.ts에서만 사용하는 타입 정의
export type MockOperatorType = "HUMAN" | "MACHINE";
// WaybillStatus와 호환되도록 수정
export type MockWaybillStatus =
  | "PENDING_UNLOAD"
  | "UNLOADED"
  | "NORMAL"
  | "ACCIDENT";

export interface MockOperator {
  id: number;
  name: string;
  code: string;
  type: MockOperatorType;
  createdAt: string;
}

export interface MockWaybillLocation {
  id: number;
  name: string;
  address: string;
  createdAt: string;
}

export interface MockParcel {
  id: number;
  waybillId: string;
  operatorId?: number;
  locationId: number;
  status: MockWaybillStatus;
  declaredValue: number;
  processedAt: string;
  isAccident: boolean;
  operator?: MockOperator;
  location?: MockWaybillLocation;
}

export interface MockWaybill {
  id: number;
  number: string;
  status: MockWaybillStatus;
  shippedAt: string;
  parcel: MockParcel;
}

export interface MockUnloadingParcel extends MockParcel {
  createdAt: string;
  unloadedAt?: string;
  workerProcessedAt?: string;
  processedBy?: string;
}

// 가짜 위치 데이터
const MOCK_LOCATIONS: MockWaybillLocation[] = [
  {
    id: 1,
    name: "서울 강남구",
    address: "서울시 강남구",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "서울 서초구",
    address: "서울시 서초구",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "서울 송파구",
    address: "서울시 송파구",
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: "부산 해운대구",
    address: "부산시 해운대구",
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: "대구 중구",
    address: "대구시 중구",
    createdAt: new Date().toISOString(),
  },
];

// 가짜 작업자 데이터
const MOCK_OPERATORS: MockOperator[] = [
  {
    id: 1,
    name: "김작업",
    code: "H001",
    type: "HUMAN",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "이분류",
    code: "H002",
    type: "HUMAN",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "박운송",
    code: "H003",
    type: "HUMAN",
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: "자동분류기A",
    code: "M001",
    type: "MACHINE",
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: "자동분류기B",
    code: "M002",
    type: "MACHINE",
    createdAt: new Date().toISOString(),
  },
];

// 운송장 번호 생성 함수
function generateWaybillNumber(): string {
  return `WB${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

// 개별 소포 생성 함수 (운송장 1개당 소포 1개)
function generateParcel(waybillId: number): MockParcel {
  const location =
    MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)];
  const operator =
    Math.random() > 0.3
      ? MOCK_OPERATORS[Math.floor(Math.random() * MOCK_OPERATORS.length)]
      : undefined;
  const isAccident = Math.random() > 0.95; // 5% 확률로 사고

  // 상태 분포: 하차 예정 40%, 하차 완료 30%, 정상 처리 25%, 사고 처리 5%
  const statusRandom = Math.random();
  let status: MockWaybillStatus;
  if (statusRandom < 0.4) {
    status = "PENDING_UNLOAD";
  } else if (statusRandom < 0.7) {
    status = "UNLOADED";
  } else if (statusRandom < 0.95) {
    status = "NORMAL";
  } else {
    status = "ACCIDENT";
  }

  const waybillCode = (() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const datePrefix = `${yyyy}${mm}${dd}`;
    const paddedId = String(waybillId).padStart(5, "0");
    return `${datePrefix}${paddedId}`;
  })();

  return {
    id: waybillId, // 소포 ID = 운송장 ID (1:1 관계)
    waybillId: `WB${waybillCode}`,
    operatorId: operator?.id,
    locationId: location.id,
    status,
    declaredValue: Math.floor(Math.random() * 100000) + 10000, // 1만원~11만원
    processedAt: new Date().toISOString(),
    isAccident,
    operator,
    location,
  };
}

// 운송장 생성 함수 (운송장 1개당 소포 1개)
function generateWaybill(id: number): MockWaybill {
  const parcel = generateParcel(id);

  return {
    id,
    number: generateWaybillNumber(),
    status: "PENDING_UNLOAD",
    shippedAt: new Date(
      Date.now() - Math.random() * 24 * 60 * 60 * 1000
    ).toISOString(), // 최근 24시간 내
    parcel, // 소포 1개 (1:1 관계)
  };
}

// 정확히 2000개의 운송장과 2000개의 하차 예정 소포 생성
export function generateMockWaybills(): MockWaybill[] {
  const waybills: MockWaybill[] = [];

  // 2000개의 운송장 생성 (각각 1개의 소포 포함)
  for (let i = 1; i <= 2000; i++) {
    waybills.push(generateWaybill(i));
  }

  return waybills;
}

// 하차 예정 소포만 필터링해서 반환 (정확히 2000개)
export function getMockUnloadingParcels(): MockParcel[] {
  const waybills = generateMockWaybills();
  return waybills
    .filter((wb) => wb.parcel && wb.parcel.status === "PENDING_UNLOAD")
    .map((wb) => wb.parcel!);
}

// UnloadingParcel 타입에 맞는 하차 예정 소포 생성
export function getMockUnloadingParcelsWithTimestamps(): MockUnloadingParcel[] {
  const waybills = generateMockWaybills();

  return waybills
    .filter((wb) => wb.parcel && wb.parcel.status === "PENDING_UNLOAD")
    .map((wb) => ({
      ...wb.parcel!,
      createdAt: wb.shippedAt, // 운송장 발송 시점을 생성일시로
      unloadedAt: undefined, // 하차 전이므로 undefined
      workerProcessedAt: undefined, // 처리 전이므로 undefined
      processedBy: undefined, // 처리 전이므로 undefined
    }));
}

// API 시뮬레이션을 위한 지연 함수
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
