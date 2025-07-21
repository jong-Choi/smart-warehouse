-- CreateTable
CREATE TABLE "waybill_yearly_stats" (
    "year" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,

    PRIMARY KEY ("year", "locationId"),
    CONSTRAINT "waybill_yearly_stats_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "waybill_monthly_stats" (
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,

    PRIMARY KEY ("year", "month", "locationId"),
    CONSTRAINT "waybill_monthly_stats_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sales_yearly_stats" (
    "year" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "totalSales" INTEGER NOT NULL,

    PRIMARY KEY ("year", "locationId"),
    CONSTRAINT "sales_yearly_stats_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sales_monthly_stats" (
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "totalSales" INTEGER NOT NULL,

    PRIMARY KEY ("year", "month", "locationId"),
    CONSTRAINT "sales_monthly_stats_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
