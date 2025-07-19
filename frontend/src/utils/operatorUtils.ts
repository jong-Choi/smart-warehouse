import type { Operator, ParcelStatusInfo } from "@/types/operator";

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
