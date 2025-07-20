import { PrismaClient, OperatorType, WaybillStatus } from "@generated/prisma";

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

    // 운송장 생성 (처리 정보 포함)
    const waybillData = [
      {
        number: "WB20241201001",
        unloadDate: "2024-12-01T09:00:00Z",
        operatorIndex: 0,
        locationIndex: 0,
        status: WaybillStatus.NORMAL,
        processedAt: "2024-12-02T14:30:00Z",
        isAccident: false,
        declaredValue: 50000,
      },
      {
        number: "WB20241201002",
        unloadDate: "2024-12-01T10:00:00Z",
        operatorIndex: 3,
        locationIndex: 3,
        status: WaybillStatus.UNLOADED,
        processedAt: "2024-12-02T16:00:00Z",
        isAccident: false,
        declaredValue: 75000,
      },
      {
        number: "WB20241201003",
        unloadDate: "2024-12-01T11:00:00Z",
        operatorIndex: 0,
        locationIndex: 0,
        status: WaybillStatus.ACCIDENT,
        processedAt: "2024-12-03T16:00:00Z",
        isAccident: true,
        declaredValue: 100000,
      },
      {
        number: "WB20241201004",
        unloadDate: "2024-12-01T12:00:00Z",
        operatorIndex: 1,
        locationIndex: 1,
        status: WaybillStatus.ACCIDENT,
        processedAt: "2024-12-02T18:00:00Z",
        isAccident: true,
        declaredValue: 45000,
      },
      {
        number: "WB20241202001",
        unloadDate: "2024-12-02T08:00:00Z",
        operatorIndex: 2,
        locationIndex: 2,
        status: WaybillStatus.NORMAL,
        processedAt: "2024-12-03T10:00:00Z",
        isAccident: false,
        declaredValue: 60000,
      },
      {
        number: "WB20241202002",
        unloadDate: "2024-12-02T09:00:00Z",
        operatorIndex: 4,
        locationIndex: 0,
        status: WaybillStatus.UNLOADED,
        processedAt: "2024-12-03T11:00:00Z",
        isAccident: false,
        declaredValue: 55000,
      },
      {
        number: "WB20241202003",
        unloadDate: "2024-12-02T10:00:00Z",
        operatorIndex: 7,
        locationIndex: 3,
        status: WaybillStatus.UNLOADED,
        processedAt: "2024-12-03T12:30:00Z",
        isAccident: false,
        declaredValue: 42000,
      },
      {
        number: "WB20241202004",
        unloadDate: "2024-12-02T11:00:00Z",
        operatorIndex: 9,
        locationIndex: 1,
        status: WaybillStatus.NORMAL,
        processedAt: "2024-12-03T12:00:00Z",
        isAccident: false,
        declaredValue: 67000,
      },
      {
        number: "WB20241203001",
        unloadDate: "2024-12-03T07:00:00Z",
        operatorIndex: 10,
        locationIndex: 2,
        status: WaybillStatus.UNLOADED,
        processedAt: "2024-12-04T11:00:00Z",
        isAccident: false,
        declaredValue: 48000,
      },
      {
        number: "WB20241203002",
        unloadDate: "2024-12-03T08:00:00Z",
        operatorIndex: 13,
        locationIndex: 1,
        status: WaybillStatus.UNLOADED,
        processedAt: "2024-12-04T12:30:00Z",
        isAccident: false,
        declaredValue: 52000,
      },
      {
        number: "WB20241203003",
        unloadDate: "2024-12-03T09:00:00Z",
        operatorIndex: 15,
        locationIndex: 3,
        status: WaybillStatus.NORMAL,
        processedAt: "2024-12-04T11:00:00Z",
        isAccident: false,
        declaredValue: 58000,
      },
      {
        number: "WB20241203004",
        unloadDate: "2024-12-03T10:00:00Z",
        operatorIndex: 16,
        locationIndex: 0,
        status: WaybillStatus.ACCIDENT,
        processedAt: "2024-12-04T15:00:00Z",
        isAccident: true,
        declaredValue: 72000,
      },
      {
        number: "WB20241204001",
        unloadDate: "2024-12-04T06:00:00Z",
        operatorIndex: 17,
        locationIndex: 1,
        status: WaybillStatus.UNLOADED,
        processedAt: "2024-12-05T10:00:00Z",
        isAccident: false,
        declaredValue: 39000,
      },
      {
        number: "WB20241204002",
        unloadDate: "2024-12-04T07:00:00Z",
        operatorIndex: 19,
        locationIndex: 3,
        status: WaybillStatus.UNLOADED,
        processedAt: "2024-12-05T11:00:00Z",
        isAccident: false,
        declaredValue: 44000,
      },
      {
        number: "WB20241204003",
        unloadDate: "2024-12-04T08:00:00Z",
        operatorIndex: 22,
        locationIndex: 2,
        status: WaybillStatus.ACCIDENT,
        processedAt: "2024-12-05T12:30:00Z",
        isAccident: true,
        declaredValue: 38000,
      },
      {
        number: "WB20241204004",
        unloadDate: "2024-12-04T09:00:00Z",
        operatorIndex: 23,
        locationIndex: 3,
        status: WaybillStatus.NORMAL,
        processedAt: "2024-12-05T10:00:00Z",
        isAccident: false,
        declaredValue: 51000,
      },
      {
        number: "WB20241205001",
        unloadDate: "2024-12-05T05:00:00Z",
        operatorIndex: 1,
        locationIndex: 1,
        status: WaybillStatus.UNLOADED,
        processedAt: "2024-12-06T09:00:00Z",
        isAccident: false,
        declaredValue: 47000,
      },
      {
        number: "WB20241205002",
        unloadDate: "2024-12-05T06:00:00Z",
        operatorIndex: 3,
        locationIndex: 3,
        status: WaybillStatus.UNLOADED,
        processedAt: "2024-12-06T10:00:00Z",
        isAccident: false,
        declaredValue: 56000,
      },
      {
        number: "WB20241205003",
        unloadDate: "2024-12-05T07:00:00Z",
        operatorIndex: 6,
        locationIndex: 2,
        status: WaybillStatus.UNLOADED,
        processedAt: "2024-12-06T11:30:00Z",
        isAccident: false,
        declaredValue: 42000,
      },
      {
        number: "WB20241205004",
        unloadDate: "2024-12-05T08:00:00Z",
        operatorIndex: 8,
        locationIndex: 0,
        status: WaybillStatus.NORMAL,
        processedAt: "2024-12-06T09:00:00Z",
        isAccident: false,
        declaredValue: 64000,
      },
    ];

    const waybills = await Promise.all(
      waybillData.map((data) =>
        prisma.waybill.create({
          data: {
            number: data.number,
            unloadDate: new Date(data.unloadDate),
            operatorId:
              allOperators[data.operatorIndex % allOperators.length].id,
            locationId: locations[data.locationIndex % locations.length].id,
            status: data.status,
            processedAt: new Date(data.processedAt),
            isAccident: data.isAccident,
          },
        })
      )
    );

    console.log("✅ 운송장 생성 완료");

    // 소포 생성 (물건 정보만)
    const parcels = await Promise.all(
      waybillData.map((data, index) =>
        prisma.parcel.create({
          data: {
            waybillId: waybills[index].id,
            declaredValue: data.declaredValue,
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
