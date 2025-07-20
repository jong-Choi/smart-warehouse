/*
  Warnings:

  - You are about to drop the column `deliveredAt` on the `waybills` table. All the data in the column will be lost.
  - You are about to drop the column `shippedAt` on the `waybills` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `waybills` table. All the data in the column will be lost.
  - Added the required column `unloadDate` to the `waybills` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_waybills" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" TEXT NOT NULL,
    "unloadDate" DATETIME NOT NULL
);
INSERT INTO "new_waybills" ("id", "number") SELECT "id", "number" FROM "waybills";
DROP TABLE "waybills";
ALTER TABLE "new_waybills" RENAME TO "waybills";
CREATE UNIQUE INDEX "waybills_number_key" ON "waybills"("number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
