const { PrismaClient } = require("./src/generated/prisma");

const prisma = new PrismaClient();

async function checkData() {
  try {
    // operatorId가 있는 waybills 조회
    const waybills = await prisma.waybill.findMany({
      where: {
        operatorId: { not: null },
      },
      select: {
        id: true,
        operatorId: true,
        unloadDate: true,
        processedAt: true,
        status: true,
        isAccident: true,
      },
      take: 10,
    });

    console.log("Sample waybills:");
    waybills.forEach((wb) => {
      console.log(
        `ID: ${wb.id}, Operator: ${wb.operatorId}, UnloadDate: ${wb.unloadDate}, ProcessedAt: ${wb.processedAt}, Status: ${wb.status}`
      );
    });

    // operatorId별로 날짜 분포 확인 (SQLite 날짜 함수 사용)
    const operatorStats = await prisma.$queryRaw`
      SELECT 
        operatorId,
        COUNT(*) as total_count,
        COUNT(DISTINCT strftime('%Y-%m-%d', unloadDate/1000, 'unixepoch')) as unload_days,
        COUNT(DISTINCT strftime('%Y-%m-%d', processedAt/1000, 'unixepoch')) as processed_days,
        MIN(unloadDate) as min_unload,
        MAX(unloadDate) as max_unload,
        MIN(processedAt) as min_processed,
        MAX(processedAt) as max_processed
      FROM waybills 
      WHERE operatorId IS NOT NULL
      GROUP BY operatorId
      LIMIT 5
    `;

    console.log("\nOperator stats:");
    operatorStats.forEach((stat) => {
      console.log(`Operator ${stat.operatorId}:`);
      console.log(`  Total count: ${stat.total_count}`);
      console.log(`  Unload days: ${stat.unload_days}`);
      console.log(`  Processed days: ${stat.processed_days}`);
      console.log(`  Min unload: ${stat.min_unload}`);
      console.log(`  Max unload: ${stat.max_unload}`);
      console.log(`  Min processed: ${stat.min_processed}`);
      console.log(`  Max processed: ${stat.max_processed}`);
      console.log("");
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
