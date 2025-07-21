/*
  Warnings:

  - You are about to drop the column `totalSales` on the `sales_stats` table. All the data in the column will be lost.
  - You are about to drop the column `totalCount` on the `waybill_stats` table. All the data in the column will be lost.
  - Added the required column `accidentCount` to the `sales_stats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `processedCount` to the `sales_stats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revenue` to the `sales_stats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `count` to the `waybill_stats` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sales_stats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "locationId" INTEGER,
    "revenue" INTEGER NOT NULL,
    "processedCount" INTEGER NOT NULL,
    "accidentCount" INTEGER NOT NULL
);
INSERT INTO "new_sales_stats" ("date", "id", "locationId") SELECT "date", "id", "locationId" FROM "sales_stats";
DROP TABLE "sales_stats";
ALTER TABLE "new_sales_stats" RENAME TO "sales_stats";
CREATE TABLE "new_waybill_stats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "locationId" INTEGER,
    "status" TEXT,
    "count" INTEGER NOT NULL
);
INSERT INTO "new_waybill_stats" ("date", "id", "locationId") SELECT "date", "id", "locationId" FROM "waybill_stats";
DROP TABLE "waybill_stats";
ALTER TABLE "new_waybill_stats" RENAME TO "waybill_stats";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
