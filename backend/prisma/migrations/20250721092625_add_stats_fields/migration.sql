-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sales_monthly_stats" (
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "totalSales" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "normalCount" INTEGER NOT NULL DEFAULT 0,
    "normalValue" INTEGER NOT NULL DEFAULT 0,
    "accidentCount" INTEGER NOT NULL DEFAULT 0,
    "accidentValue" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("year", "month", "locationId"),
    CONSTRAINT "sales_monthly_stats_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sales_monthly_stats" ("locationId", "month", "totalSales", "year") SELECT "locationId", "month", "totalSales", "year" FROM "sales_monthly_stats";
DROP TABLE "sales_monthly_stats";
ALTER TABLE "new_sales_monthly_stats" RENAME TO "sales_monthly_stats";
CREATE TABLE "new_sales_stats" (
    "date" TEXT NOT NULL,
    "locationId" INTEGER NOT NULL,
    "totalSales" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "normalCount" INTEGER NOT NULL DEFAULT 0,
    "normalValue" INTEGER NOT NULL DEFAULT 0,
    "accidentCount" INTEGER NOT NULL DEFAULT 0,
    "accidentValue" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("date", "locationId"),
    CONSTRAINT "sales_stats_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sales_stats" ("date", "locationId", "totalSales") SELECT "date", "locationId", "totalSales" FROM "sales_stats";
DROP TABLE "sales_stats";
ALTER TABLE "new_sales_stats" RENAME TO "sales_stats";
CREATE TABLE "new_sales_yearly_stats" (
    "year" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "totalSales" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "normalCount" INTEGER NOT NULL DEFAULT 0,
    "normalValue" INTEGER NOT NULL DEFAULT 0,
    "accidentCount" INTEGER NOT NULL DEFAULT 0,
    "accidentValue" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("year", "locationId"),
    CONSTRAINT "sales_yearly_stats_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sales_yearly_stats" ("locationId", "totalSales", "year") SELECT "locationId", "totalSales", "year" FROM "sales_yearly_stats";
DROP TABLE "sales_yearly_stats";
ALTER TABLE "new_sales_yearly_stats" RENAME TO "sales_yearly_stats";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
