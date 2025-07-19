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
    // 기존 데이터 삭제 (순서 중요: 외래키 제약조건 때문에)
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

    // A1~B10 코드의 기계들 생성 (이름은 A01, B02 형식)
    const machineCodes = [];
    for (let i = 1; i <= 10; i++) {
      machineCodes.push(`A${i}`);
    }
    for (let i = 1; i <= 10; i++) {
      machineCodes.push(`B${i}`);
    }

    const machines = await Promise.all(
      machineCodes.map((code) =>
        prisma.operator.create({
          data: {
            name: `자동분류기-${code.replace(
              /([A-Z])(\d+)/,
              (match, letter, num) => `${letter}${num.padStart(2, "0")}`
            )}`,
            code: code,
            type: OperatorType.MACHINE,
          },
        })
      )
    );

    // 모든 작업자 배열에 기계들 추가
    const allOperators = [...operators, ...machines];

    console.log("✅ 작업자 생성 완료");

    // 운송장 생성 (더 많은 데이터)
    const waybillData = [
      {
        number: "WB20241201001",
        status: WaybillStatus.DELIVERED,
        shippedAt: "2024-12-01T09:00:00Z",
        deliveredAt: "2024-12-02T14:30:00Z",
      },
      {
        number: "WB20241201002",
        status: WaybillStatus.IN_TRANSIT,
        shippedAt: "2024-12-01T10:00:00Z",
      },
      {
        number: "WB20241201003",
        status: WaybillStatus.RETURNED,
        shippedAt: "2024-12-01T11:00:00Z",
        deliveredAt: "2024-12-03T16:00:00Z",
      },
      {
        number: "WB20241201004",
        status: WaybillStatus.ERROR,
        shippedAt: "2024-12-01T12:00:00Z",
      },
      {
        number: "WB20241202001",
        status: WaybillStatus.DELIVERED,
        shippedAt: "2024-12-02T08:00:00Z",
        deliveredAt: "2024-12-03T10:00:00Z",
      },
      {
        number: "WB20241202002",
        status: WaybillStatus.IN_TRANSIT,
        shippedAt: "2024-12-02T09:00:00Z",
      },
      {
        number: "WB20241202003",
        status: WaybillStatus.IN_TRANSIT,
        shippedAt: "2024-12-02T10:00:00Z",
      },
      {
        number: "WB20241202004",
        status: WaybillStatus.DELIVERED,
        shippedAt: "2024-12-02T11:00:00Z",
        deliveredAt: "2024-12-03T12:00:00Z",
      },
      {
        number: "WB20241203001",
        status: WaybillStatus.IN_TRANSIT,
        shippedAt: "2024-12-03T07:00:00Z",
      },
      {
        number: "WB20241203002",
        status: WaybillStatus.IN_TRANSIT,
        shippedAt: "2024-12-03T08:00:00Z",
      },
      {
        number: "WB20241203003",
        status: WaybillStatus.DELIVERED,
        shippedAt: "2024-12-03T09:00:00Z",
        deliveredAt: "2024-12-04T11:00:00Z",
      },
      {
        number: "WB20241203004",
        status: WaybillStatus.RETURNED,
        shippedAt: "2024-12-03T10:00:00Z",
        deliveredAt: "2024-12-04T15:00:00Z",
      },
      {
        number: "WB20241204001",
        status: WaybillStatus.IN_TRANSIT,
        shippedAt: "2024-12-04T06:00:00Z",
      },
      {
        number: "WB20241204002",
        status: WaybillStatus.IN_TRANSIT,
        shippedAt: "2024-12-04T07:00:00Z",
      },
      {
        number: "WB20241204003",
        status: WaybillStatus.ERROR,
        shippedAt: "2024-12-04T08:00:00Z",
      },
      {
        number: "WB20241204004",
        status: WaybillStatus.DELIVERED,
        shippedAt: "2024-12-04T09:00:00Z",
        deliveredAt: "2024-12-05T10:00:00Z",
      },
      {
        number: "WB20241205001",
        status: WaybillStatus.IN_TRANSIT,
        shippedAt: "2024-12-05T05:00:00Z",
      },
      {
        number: "WB20241205002",
        status: WaybillStatus.IN_TRANSIT,
        shippedAt: "2024-12-05T06:00:00Z",
      },
      {
        number: "WB20241205003",
        status: WaybillStatus.IN_TRANSIT,
        shippedAt: "2024-12-05T07:00:00Z",
      },
      {
        number: "WB20241205004",
        status: WaybillStatus.DELIVERED,
        shippedAt: "2024-12-05T08:00:00Z",
        deliveredAt: "2024-12-06T09:00:00Z",
      },
    ];

    const waybills = await Promise.all(
      waybillData.map((data) =>
        prisma.waybill.create({
          data: {
            number: data.number,
            status: data.status,
            shippedAt: new Date(data.shippedAt),
            deliveredAt: data.deliveredAt
              ? new Date(data.deliveredAt)
              : undefined,
          },
        })
      )
    );

    console.log("✅ 운송장 생성 완료");

    // 소포 생성 (운송장과 1:1 관계)
    const parcelData = [
      // WB20241201001 (배송완료)
      {
        waybillIndex: 0,
        operatorIndex: 0,
        locationIndex: 0,
        status: ParcelStatus.NORMAL,
        value: 50000,
        processedAt: "2024-12-02T14:30:00Z",
        isAccident: false,
      },
      // WB20241201002 (배송중)
      {
        waybillIndex: 1,
        operatorIndex: 3,
        locationIndex: 3,
        status: ParcelStatus.UNLOADED,
        value: 75000,
        processedAt: "2024-12-02T16:00:00Z",
        isAccident: false,
      },
      // WB20241201003 (반송)
      {
        waybillIndex: 2,
        operatorIndex: 0,
        locationIndex: 0,
        status: ParcelStatus.ACCIDENT,
        value: 100000,
        processedAt: "2024-12-03T16:00:00Z",
        isAccident: true,
      },
      // WB20241201004 (오류)
      {
        waybillIndex: 3,
        operatorIndex: 1,
        locationIndex: 1,
        status: ParcelStatus.ACCIDENT,
        value: 45000,
        processedAt: "2024-12-02T18:00:00Z",
        isAccident: true,
      },
      // WB20241202001 (배송완료)
      {
        waybillIndex: 4,
        operatorIndex: 2,
        locationIndex: 2,
        status: ParcelStatus.NORMAL,
        value: 60000,
        processedAt: "2024-12-03T10:00:00Z",
        isAccident: false,
      },
      // WB20241202002 (배송중)
      {
        waybillIndex: 5,
        operatorIndex: 4,
        locationIndex: 0,
        status: ParcelStatus.UNLOADED,
        value: 55000,
        processedAt: "2024-12-03T11:00:00Z",
        isAccident: false,
      },
      // WB20241202003 (배송중)
      {
        waybillIndex: 6,
        operatorIndex: 7,
        locationIndex: 3,
        status: ParcelStatus.UNLOADED,
        value: 42000,
        processedAt: "2024-12-03T12:30:00Z",
        isAccident: false,
      },
      // WB20241202004 (배송완료)
      {
        waybillIndex: 7,
        operatorIndex: 9,
        locationIndex: 1,
        status: ParcelStatus.NORMAL,
        value: 67000,
        processedAt: "2024-12-03T12:00:00Z",
        isAccident: false,
      },
      // WB20241203001 (배송중)
      {
        waybillIndex: 8,
        operatorIndex: 10,
        locationIndex: 2,
        status: ParcelStatus.UNLOADED,
        value: 48000,
        processedAt: "2024-12-04T11:00:00Z",
        isAccident: false,
      },
      // WB20241203002 (배송중)
      {
        waybillIndex: 9,
        operatorIndex: 13,
        locationIndex: 1,
        status: ParcelStatus.UNLOADED,
        value: 52000,
        processedAt: "2024-12-04T12:30:00Z",
        isAccident: false,
      },
      // WB20241203003 (배송완료)
      {
        waybillIndex: 10,
        operatorIndex: 15,
        locationIndex: 3,
        status: ParcelStatus.NORMAL,
        value: 58000,
        processedAt: "2024-12-04T11:00:00Z",
        isAccident: false,
      },
      // WB20241203004 (반송)
      {
        waybillIndex: 11,
        operatorIndex: 16,
        locationIndex: 0,
        status: ParcelStatus.ACCIDENT,
        value: 72000,
        processedAt: "2024-12-04T15:00:00Z",
        isAccident: true,
      },
      // WB20241204001 (배송중)
      {
        waybillIndex: 12,
        operatorIndex: 17,
        locationIndex: 1,
        status: ParcelStatus.UNLOADED,
        value: 39000,
        processedAt: "2024-12-05T10:00:00Z",
        isAccident: false,
      },
      // WB20241204002 (배송중)
      {
        waybillIndex: 13,
        operatorIndex: 19,
        locationIndex: 3,
        status: ParcelStatus.UNLOADED,
        value: 44000,
        processedAt: "2024-12-05T11:00:00Z",
        isAccident: false,
      },
      // WB20241204003 (오류)
      {
        waybillIndex: 14,
        operatorIndex: 22,
        locationIndex: 2,
        status: ParcelStatus.ACCIDENT,
        value: 38000,
        processedAt: "2024-12-05T12:30:00Z",
        isAccident: true,
      },
      // WB20241204004 (배송완료)
      {
        waybillIndex: 15,
        operatorIndex: 23,
        locationIndex: 3,
        status: ParcelStatus.NORMAL,
        value: 51000,
        processedAt: "2024-12-05T10:00:00Z",
        isAccident: false,
      },
      // WB20241205001 (배송중)
      {
        waybillIndex: 16,
        operatorIndex: 1,
        locationIndex: 1,
        status: ParcelStatus.UNLOADED,
        value: 47000,
        processedAt: "2024-12-06T09:00:00Z",
        isAccident: false,
      },
      // WB20241205002 (배송중)
      {
        waybillIndex: 17,
        operatorIndex: 3,
        locationIndex: 3,
        status: ParcelStatus.UNLOADED,
        value: 56000,
        processedAt: "2024-12-06T10:00:00Z",
        isAccident: false,
      },
      // WB20241205003 (배송중)
      {
        waybillIndex: 18,
        operatorIndex: 6,
        locationIndex: 2,
        status: ParcelStatus.UNLOADED,
        value: 42000,
        processedAt: "2024-12-06T11:30:00Z",
        isAccident: false,
      },
      // WB20241205004 (배송완료)
      {
        waybillIndex: 19,
        operatorIndex: 8,
        locationIndex: 0,
        status: ParcelStatus.NORMAL,
        value: 64000,
        processedAt: "2024-12-06T09:00:00Z",
        isAccident: false,
      },
    ];

    const parcels = await Promise.all(
      parcelData.map((data) =>
        prisma.parcel.create({
          data: {
            waybillId: waybills[data.waybillIndex].id,
            operatorId:
              allOperators[data.operatorIndex % allOperators.length].id,
            locationId: locations[data.locationIndex % locations.length].id,
            status: data.status,
            declaredValue: data.value,
            processedAt: new Date(data.processedAt),
            isAccident: data.isAccident,
          },
        })
      )
    );

    console.log("✅ 소포 생성 완료");

    // 근무 기록 생성
    const shifts = await Promise.all([
      prisma.operatorShift.create({
        data: {
          operatorId: allOperators[0].id,
          date: new Date("2024-12-02"),
          startTime: new Date("2024-12-02T08:00:00Z"),
          endTime: new Date("2024-12-02T18:00:00Z"),
        },
      }),
      prisma.operatorShift.create({
        data: {
          operatorId: allOperators[1].id,
          date: new Date("2024-12-02"),
          startTime: new Date("2024-12-02T09:00:00Z"),
          endTime: new Date("2024-12-02T19:00:00Z"),
        },
      }),
      prisma.operatorShift.create({
        data: {
          operatorId: allOperators[2].id,
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
          operatorId: allOperators[0].id,
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
          operatorId: allOperators[1].id,
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
          operatorId: allOperators[2].id,
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
    console.log(
      `   - 작업자: ${allOperators.length}개 (기본 4개 + A1~B10 기계 20개)`
    );
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
