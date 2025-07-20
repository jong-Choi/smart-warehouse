/*
  Warnings:

  - You are about to drop the column `isAccident` on the `parcels` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `parcels` table. All the data in the column will be lost.
  - You are about to drop the column `operatorId` on the `parcels` table. All the data in the column will be lost.
  - You are about to drop the column `processedAt` on the `parcels` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `parcels` table. All the data in the column will be lost.
  - Added the required column `locationId` to the `waybills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `waybills` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_parcels" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "waybillId" INTEGER NOT NULL,
    "declaredValue" INTEGER NOT NULL,
    CONSTRAINT "parcels_waybillId_fkey" FOREIGN KEY ("waybillId") REFERENCES "waybills" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_parcels" ("declaredValue", "id", "waybillId") SELECT "declaredValue", "id", "waybillId" FROM "parcels";
DROP TABLE "parcels";
ALTER TABLE "new_parcels" RENAME TO "parcels";
CREATE UNIQUE INDEX "parcels_waybillId_key" ON "parcels"("waybillId");
CREATE TABLE "new_waybills" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" TEXT NOT NULL,
    "unloadDate" DATETIME NOT NULL,
    "operatorId" INTEGER,
    "locationId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "processedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isAccident" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "waybills_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operators" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "waybills_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_waybills" ("id", "number", "unloadDate") SELECT "id", "number", "unloadDate" FROM "waybills";
DROP TABLE "waybills";
ALTER TABLE "new_waybills" RENAME TO "waybills";
CREATE UNIQUE INDEX "waybills_number_key" ON "waybills"("number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
