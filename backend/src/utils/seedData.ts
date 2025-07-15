import {
  PrismaClient,
  OperatorType,
  ParcelStatus,
  WaybillStatus,
} from "@generated/prisma";

const prisma = new PrismaClient();

async function seedData() {
  console.log("🌱 샘플 데이터 생성 시작...");

  try {
    // 기존 데이터 삭제
    await prisma.parcel.deleteMany();
    await prisma.operatorWork.deleteMany();
    await prisma.operatorShift.deleteMany();
    await prisma.waybill.deleteMany();
    await prisma.operator.deleteMany();
    await prisma.location.deleteMany();

    console.log("✅ 기존 데이터 삭제 완료");

    // 배송지 생성
    const locations = await Promise.all([
      prisma.location.create({
        data: {
          name: "서울 강남구",
          address: "서울특별시 강남구 테헤란로 123",
        },
      }),
      prisma.location.create({
        data: {
          name: "부산 해운대구",
          address: "부산광역시 해운대구 해운대로 456",
        },
      }),
      prisma.location.create({
        data: {
          name: "대구 중구",
          address: "대구광역시 중구 동성로 789",
        },
      }),
      prisma.location.create({
        data: {
          name: "인천 연수구",
          address: "인천광역시 연수구 송도대로 321",
        },
      }),
    ]);

    console.log("✅ 배송지 생성 완료");

    // 작업자 생성
    const operators = await Promise.all([
      prisma.operator.create({
        data: {
          name: "김택배",
          code: "OP001",
          type: OperatorType.HUMAN,
        },
      }),
      prisma.operator.create({
        data: {
          name: "이배송",
          code: "OP002",
          type: OperatorType.HUMAN,
        },
      }),
      prisma.operator.create({
        data: {
          name: "자동분류기-A",
          code: "MACH001",
          type: OperatorType.MACHINE,
        },
      }),
      prisma.operator.create({
        data: {
          name: "자동분류기-B",
          code: "MACH002",
          type: OperatorType.MACHINE,
        },
      }),
    ]);

    console.log("✅ 작업자 생성 완료");

    // 운송장 생성
    const waybills = await Promise.all([
      prisma.waybill.create({
        data: {
          number: "WB20241201001",
          status: WaybillStatus.DELIVERED,
          shippedAt: new Date("2024-12-01T09:00:00Z"),
          deliveredAt: new Date("2024-12-02T14:30:00Z"),
        },
      }),
      prisma.waybill.create({
        data: {
          number: "WB20241201002",
          status: WaybillStatus.IN_TRANSIT,
          shippedAt: new Date("2024-12-01T10:00:00Z"),
        },
      }),
      prisma.waybill.create({
        data: {
          number: "WB20241201003",
          status: WaybillStatus.RETURNED,
          shippedAt: new Date("2024-12-01T11:00:00Z"),
          deliveredAt: new Date("2024-12-03T16:00:00Z"),
        },
      }),
      prisma.waybill.create({
        data: {
          number: "WB20241201004",
          status: WaybillStatus.ERROR,
          shippedAt: new Date("2024-12-01T12:00:00Z"),
        },
      }),
    ]);

    console.log("✅ 운송장 생성 완료");

    // 소포 생성
    const parcels = await Promise.all([
      // 정상 배송된 소포들
      prisma.parcel.create({
        data: {
          waybillId: waybills[0].id,
          operatorId: operators[0].id,
          locationId: locations[0].id,
          status: ParcelStatus.NORMAL,
          declaredValue: 50000,
          processedAt: new Date("2024-12-02T14:30:00Z"),
          isAccident: false,
        },
      }),
      prisma.parcel.create({
        data: {
          waybillId: waybills[0].id,
          operatorId: operators[1].id,
          locationId: locations[1].id,
          status: ParcelStatus.NORMAL,
          declaredValue: 30000,
          processedAt: new Date("2024-12-02T15:00:00Z"),
          isAccident: false,
        },
      }),
      // 배송 중인 소포들
      prisma.parcel.create({
        data: {
          waybillId: waybills[1].id,
          operatorId: operators[2].id,
          locationId: locations[2].id,
          status: ParcelStatus.UNLOADED,
          declaredValue: 75000,
          processedAt: new Date("2024-12-02T16:00:00Z"),
          isAccident: false,
        },
      }),
      prisma.parcel.create({
        data: {
          waybillId: waybills[1].id,
          operatorId: operators[3].id,
          locationId: locations[3].id,
          status: ParcelStatus.PENDING_UNLOAD,
          declaredValue: 25000,
          processedAt: new Date("2024-12-02T17:00:00Z"),
          isAccident: false,
        },
      }),
      // 반송된 소포
      prisma.parcel.create({
        data: {
          waybillId: waybills[2].id,
          operatorId: operators[0].id,
          locationId: locations[0].id,
          status: ParcelStatus.ACCIDENT,
          declaredValue: 100000,
          processedAt: new Date("2024-12-03T16:00:00Z"),
          isAccident: true,
        },
      }),
      // 오류 소포
      prisma.parcel.create({
        data: {
          waybillId: waybills[3].id,
          operatorId: operators[1].id,
          locationId: locations[1].id,
          status: ParcelStatus.ACCIDENT,
          declaredValue: 45000,
          processedAt: new Date("2024-12-02T18:00:00Z"),
          isAccident: true,
        },
      }),
    ]);

    console.log("✅ 소포 생성 완료");

    // 근무 기록 생성
    const shifts = await Promise.all([
      prisma.operatorShift.create({
        data: {
          operatorId: operators[0].id,
          date: new Date("2024-12-02"),
          startTime: new Date("2024-12-02T08:00:00Z"),
          endTime: new Date("2024-12-02T18:00:00Z"),
        },
      }),
      prisma.operatorShift.create({
        data: {
          operatorId: operators[1].id,
          date: new Date("2024-12-02"),
          startTime: new Date("2024-12-02T09:00:00Z"),
          endTime: new Date("2024-12-02T19:00:00Z"),
        },
      }),
      prisma.operatorShift.create({
        data: {
          operatorId: operators[2].id,
          date: new Date("2024-12-02"),
          startTime: new Date("2024-12-02T00:00:00Z"),
          endTime: new Date("2024-12-02T23:59:59Z"),
        },
      }),
    ]);

    console.log("✅ 근무 기록 생성 완료");

    // 작업 통계 생성
    const works = await Promise.all([
      prisma.operatorWork.create({
        data: {
          operatorId: operators[0].id,
          date: new Date("2024-12-02"),
          locationId: locations[0].id,
          processedCount: 2,
          accidentCount: 1,
          revenue: 150000,
          errorCount: 0,
        },
      }),
      prisma.operatorWork.create({
        data: {
          operatorId: operators[1].id,
          date: new Date("2024-12-02"),
          locationId: locations[1].id,
          processedCount: 2,
          accidentCount: 1,
          revenue: 75000,
          errorCount: 1,
        },
      }),
      prisma.operatorWork.create({
        data: {
          operatorId: operators[2].id,
          date: new Date("2024-12-02"),
          locationId: locations[2].id,
          processedCount: 1,
          accidentCount: 0,
          revenue: 75000,
          errorCount: 0,
        },
      }),
    ]);

    console.log("✅ 작업 통계 생성 완료");

    console.log("🎉 샘플 데이터 생성 완료!");
    console.log(`📊 생성된 데이터:`);
    console.log(`   - 배송지: ${locations.length}개`);
    console.log(`   - 작업자: ${operators.length}개`);
    console.log(`   - 운송장: ${waybills.length}개`);
    console.log(`   - 소포: ${parcels.length}개`);
    console.log(`   - 근무기록: ${shifts.length}개`);
    console.log(`   - 작업통계: ${works.length}개`);
  } catch (error) {
    console.error("❌ 샘플 데이터 생성 중 오류 발생:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트가 직접 실행될 때만 실행
if (require.main === module) {
  seedData();
}

export { seedData };
