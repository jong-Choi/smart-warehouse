/**
 * Zod 검증 스키마 정의 파일
 *
 * 이 파일은 Prisma 스키마를 기반으로 한 Zod 검증 스키마들을 정의합니다.
 * 모든 API 요청/응답의 타입 안전성과 런타임 검증을 보장합니다.
 */

import { z } from "zod";

// ============================================================================
// Enum 스키마들 (Prisma 스키마와 일치)
// ============================================================================
export const OperatorTypeSchema = z.enum(["HUMAN", "MACHINE"]);
export const ParcelStatusSchema = z.enum([
  "PENDING_UNLOAD",
  "UNLOADED",
  "NORMAL",
  "ACCIDENT",
]);
export const WaybillStatusSchema = z.enum([
  "IN_TRANSIT",
  "DELIVERED",
  "RETURNED",
  "ERROR",
]);

// Enum 값 상수들 (쿼리 파싱에 사용)
export const OPERATOR_TYPES = ["HUMAN", "MACHINE"] as const;
export const PARCEL_STATUSES = [
  "PENDING_UNLOAD",
  "UNLOADED",
  "NORMAL",
  "ACCIDENT",
] as const;
export const WAYBILL_STATUSES = [
  "IN_TRANSIT",
  "DELIVERED",
  "RETURNED",
  "ERROR",
] as const;

// ============================================================================
// 기본 필터 스키마
// ============================================================================
export const DateRangeFilterSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

// ============================================================================
// API 요청 스키마들 (생성)
// ============================================================================
export const CreateOperatorSchema = z.object({
  name: z.string().min(1, "이름은 필수입니다"),
  code: z.string().min(1, "코드는 필수입니다"),
  type: OperatorTypeSchema,
});

export const CreateLocationSchema = z.object({
  name: z.string().min(1, "배송지명은 필수입니다"),
  address: z.string().optional(),
});

export const CreateWaybillSchema = z.object({
  number: z.string().min(1, "운송장 번호는 필수입니다"),
  status: WaybillStatusSchema,
  shippedAt: z.date(),
  deliveredAt: z.date().optional(),
});

export const CreateParcelSchema = z.object({
  waybillId: z.number().positive("운송장 ID는 양수여야 합니다"),
  operatorId: z.number().positive("작업자 ID는 양수여야 합니다").optional(),
  locationId: z.number().positive("배송지 ID는 양수여야 합니다"),
  status: ParcelStatusSchema,
  declaredValue: z.number().min(0, "가격은 0 이상이어야 합니다"),
  isAccident: z.boolean().default(false),
});

export const CreateOperatorShiftSchema = z.object({
  operatorId: z.number().positive("작업자 ID는 양수여야 합니다"),
  date: z.date(),
  startTime: z.date(),
  endTime: z.date(),
});

export const CreateOperatorWorkSchema = z.object({
  operatorId: z.number().positive("작업자 ID는 양수여야 합니다"),
  date: z.date(),
  locationId: z.number().positive("배송지 ID는 양수여야 합니다"),
  processedCount: z.number().min(0, "처리 수량은 0 이상이어야 합니다"),
  accidentCount: z.number().min(0, "사고 수량은 0 이상이어야 합니다"),
  revenue: z.number().min(0, "매출은 0 이상이어야 합니다"),
  errorCount: z.number().min(0, "오류 수량은 0 이상이어야 합니다").optional(),
});

// ============================================================================
// 필터 스키마들 (조회 조건)
// ============================================================================
export const OperatorFiltersSchema = DateRangeFilterSchema.extend({
  type: OperatorTypeSchema.optional(),
  search: z.string().optional(),
});

export const WaybillFiltersSchema = DateRangeFilterSchema.extend({
  status: WaybillStatusSchema.optional(),
});

export const ParcelFiltersSchema = DateRangeFilterSchema.extend({
  status: ParcelStatusSchema.optional(),
  operatorId: z.number().positive().optional(),
  locationId: z.number().positive().optional(),
  waybillId: z.number().positive().optional(),
  isAccident: z.boolean().optional(),
});

// ============================================================================
// 업데이트 스키마들 (부분 업데이트)
// ============================================================================
export const UpdateOperatorSchema = CreateOperatorSchema.partial();
export const UpdateLocationSchema = CreateLocationSchema.partial();
export const UpdateWaybillSchema = z.object({
  status: WaybillStatusSchema.optional(),
  deliveredAt: z.date().optional(),
});
export const UpdateParcelSchema = z.object({
  operatorId: z.number().positive().optional(),
  status: ParcelStatusSchema.optional(),
  isAccident: z.boolean().optional(),
});

// ============================================================================
// 페이지네이션 스키마
// ============================================================================
export const PaginationSchema = z
  .object({
    getAll: z.boolean().optional(),
    page: z.number().min(1, "페이지는 1 이상이어야 합니다").optional(),
    limit: z
      .number()
      .min(1, "제한은 1 이상이어야 합니다")
      .max(100, "제한은 100 이하여야 합니다")
      .optional(),
  })
  .refine(
    (data) => {
      // getAll이 true이면 page와 limit은 선택적
      if (data.getAll === true) {
        return true;
      }
      // getAll이 false이거나 undefined이면 page와 limit이 필요
      return data.page !== undefined && data.limit !== undefined;
    },
    {
      message:
        "getAll이 false이거나 undefined일 때는 page와 limit이 필요합니다",
      path: ["page", "limit"],
    }
  );

// ============================================================================
// 타입 추론 (Zod 스키마에서 TypeScript 타입 생성)
// ============================================================================
export type OperatorType = z.infer<typeof OperatorTypeSchema>;
export type ParcelStatus = z.infer<typeof ParcelStatusSchema>;
export type WaybillStatus = z.infer<typeof WaybillStatusSchema>;
export type DateRangeFilter = z.infer<typeof DateRangeFilterSchema>;
export type CreateOperatorRequest = z.infer<typeof CreateOperatorSchema>;
export type CreateLocationRequest = z.infer<typeof CreateLocationSchema>;
export type CreateWaybillRequest = z.infer<typeof CreateWaybillSchema>;
export type CreateParcelRequest = z.infer<typeof CreateParcelSchema>;
export type CreateOperatorShiftRequest = z.infer<
  typeof CreateOperatorShiftSchema
>;
export type CreateOperatorWorkRequest = z.infer<
  typeof CreateOperatorWorkSchema
>;
export type OperatorFilters = z.infer<typeof OperatorFiltersSchema>;
export type WaybillFilters = z.infer<typeof WaybillFiltersSchema>;
export type ParcelFilters = z.infer<typeof ParcelFiltersSchema>;
export type UpdateOperatorRequest = z.infer<typeof UpdateOperatorSchema>;
export type UpdateLocationRequest = z.infer<typeof UpdateLocationSchema>;
export type UpdateWaybillRequest = z.infer<typeof UpdateWaybillSchema>;
export type UpdateParcelRequest = z.infer<typeof UpdateParcelSchema>;
export type PaginationParams = z.infer<typeof PaginationSchema>;
