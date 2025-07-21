/*
  Warnings:

  - The primary key for the `sales_stats` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accidentCount` on the `sales_stats` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `sales_stats` table. All the data in the column will be lost.
  - You are about to drop the column `processedCount` on the `sales_stats` table. All the data in the column will be lost.
  - You are about to drop the column `revenue` on the `sales_stats` table. All the data in the column will be lost.
  - The primary key for the `waybill_stats` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `count` on the `waybill_stats` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `waybill_stats` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `waybill_stats` table. All the data in the column will be lost.
  - Added the required column `totalSales` to the `sales_stats` table without a default value. This is not possible if the table is not empty.
  - Made the column `locationId` on table `sales_stats` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `totalCount` to the `waybill_stats` table without a default value. This is not possible if the table is not empty.
  - Made the column `locationId` on table `waybill_stats` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sales_stats" (
    "date" TEXT NOT NULL,
    "locationId" INTEGER NOT NULL,
    "totalSales" INTEGER NOT NULL,

    PRIMARY KEY ("date", "locationId"),
    CONSTRAINT "sales_stats_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sales_stats" ("date", "locationId") SELECT "date", "locationId" FROM "sales_stats";
DROP TABLE "sales_stats";
ALTER TABLE "new_sales_stats" RENAME TO "sales_stats";
CREATE TABLE "new_waybill_stats" (
    "date" TEXT NOT NULL,
    "locationId" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,

    PRIMARY KEY ("date", "locationId"),
    CONSTRAINT "waybill_stats_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_waybill_stats" ("date", "locationId") SELECT "date", "locationId" FROM "waybill_stats";
DROP TABLE "waybill_stats";
ALTER TABLE "new_waybill_stats" RENAME TO "waybill_stats";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
