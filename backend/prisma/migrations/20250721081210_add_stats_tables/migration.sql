-- CreateTable
CREATE TABLE "waybill_stats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "locationId" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,
    CONSTRAINT "waybill_stats_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sales_stats" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "locationId" INTEGER NOT NULL,
    "totalSales" INTEGER NOT NULL,
    CONSTRAINT "sales_stats_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "waybill_stats_date_locationId_key" ON "waybill_stats"("date", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "sales_stats_date_locationId_key" ON "sales_stats"("date", "locationId");
