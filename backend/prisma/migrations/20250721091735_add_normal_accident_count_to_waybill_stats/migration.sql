-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_waybill_monthly_stats" (
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "normalCount" INTEGER NOT NULL DEFAULT 0,
    "accidentCount" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("year", "month", "locationId"),
    CONSTRAINT "waybill_monthly_stats_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_waybill_monthly_stats" ("locationId", "month", "totalCount", "year") SELECT "locationId", "month", "totalCount", "year" FROM "waybill_monthly_stats";
DROP TABLE "waybill_monthly_stats";
ALTER TABLE "new_waybill_monthly_stats" RENAME TO "waybill_monthly_stats";
CREATE TABLE "new_waybill_stats" (
    "date" TEXT NOT NULL,
    "locationId" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "normalCount" INTEGER NOT NULL DEFAULT 0,
    "accidentCount" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("date", "locationId"),
    CONSTRAINT "waybill_stats_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_waybill_stats" ("date", "locationId", "totalCount") SELECT "date", "locationId", "totalCount" FROM "waybill_stats";
DROP TABLE "waybill_stats";
ALTER TABLE "new_waybill_stats" RENAME TO "waybill_stats";
CREATE TABLE "new_waybill_yearly_stats" (
    "year" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "normalCount" INTEGER NOT NULL DEFAULT 0,
    "accidentCount" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("year", "locationId"),
    CONSTRAINT "waybill_yearly_stats_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_waybill_yearly_stats" ("locationId", "totalCount", "year") SELECT "locationId", "totalCount", "year" FROM "waybill_yearly_stats";
DROP TABLE "waybill_yearly_stats";
ALTER TABLE "new_waybill_yearly_stats" RENAME TO "waybill_yearly_stats";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
