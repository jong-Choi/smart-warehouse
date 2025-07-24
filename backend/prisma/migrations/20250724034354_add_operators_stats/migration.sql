-- CreateTable
CREATE TABLE "operators_stats" (
    "operatorId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "workDays" INTEGER NOT NULL DEFAULT 0,
    "normalCount" INTEGER NOT NULL DEFAULT 0,
    "accidentCount" INTEGER NOT NULL DEFAULT 0,
    "firstWorkDate" DATETIME,
    CONSTRAINT "operators_stats_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operators" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
