import type {
  Operator,
  ParcelStatusInfo,
  OperatorsStats,
} from "@/types/operator";

export function getNormalParcelCount(operator: Operator): number {
  if (!operator.parcels) return 0;
  return operator.parcels.filter(
    (p: ParcelStatusInfo) => p.status === "NORMAL" && !p.isAccident
  ).length;
}

export function getAccidentParcelCount(operator: Operator): number {
  if (!operator.parcels) return 0;
  return operator.parcels.filter(
    (p: ParcelStatusInfo) => p.isAccident || p.status === "ACCIDENT"
  ).length;
}

// 새로운 통계 데이터를 사용하는 함수들
export function getNormalParcelCountFromStats(
  operatorStats: OperatorsStats
): number {
  return operatorStats.normalCount;
}

export function getAccidentParcelCountFromStats(
  operatorStats: OperatorsStats
): number {
  return operatorStats.accidentCount;
}

export function sortOperatorsByNormalParcels(
  operators: Operator[],
  desc: boolean = false
): Operator[] {
  return [...operators].sort((a, b) => {
    const aNormalCount = getNormalParcelCount(a);
    const bNormalCount = getNormalParcelCount(b);
    return desc ? bNormalCount - aNormalCount : aNormalCount - bNormalCount;
  });
}

export function sortOperatorsByAccidentParcels(
  operators: Operator[],
  desc: boolean = false
): Operator[] {
  return [...operators].sort((a, b) => {
    const aAccidentCount = getAccidentParcelCount(a);
    const bAccidentCount = getAccidentParcelCount(b);
    return desc
      ? bAccidentCount - aAccidentCount
      : aAccidentCount - bAccidentCount;
  });
}

// 새로운 통계 데이터를 사용하는 정렬 함수들
export function sortOperatorsStatsByNormalParcels(
  operatorsStats: OperatorsStats[],
  desc: boolean = false
): OperatorsStats[] {
  return [...operatorsStats].sort((a, b) => {
    const aNormalCount = getNormalParcelCountFromStats(a);
    const bNormalCount = getNormalParcelCountFromStats(b);
    return desc ? bNormalCount - aNormalCount : aNormalCount - bNormalCount;
  });
}

export function sortOperatorsStatsByAccidentParcels(
  operatorsStats: OperatorsStats[],
  desc: boolean = false
): OperatorsStats[] {
  return [...operatorsStats].sort((a, b) => {
    const aAccidentCount = getAccidentParcelCountFromStats(a);
    const bAccidentCount = getAccidentParcelCountFromStats(b);
    return desc
      ? bAccidentCount - aAccidentCount
      : aAccidentCount - bAccidentCount;
  });
}
