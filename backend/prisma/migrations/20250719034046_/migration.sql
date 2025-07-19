-- CreateTable
CREATE TABLE "operators" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "operator_shifts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "operatorId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    CONSTRAINT "operator_shifts_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operators" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "locations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "operator_works" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "operatorId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "locationId" INTEGER NOT NULL,
    "processedCount" INTEGER NOT NULL,
    "accidentCount" INTEGER NOT NULL,
    "revenue" INTEGER NOT NULL,
    "errorCount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "operator_works_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operators" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "operator_works_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "waybills" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "shippedAt" DATETIME NOT NULL,
    "deliveredAt" DATETIME
);

-- CreateTable
CREATE TABLE "parcels" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "waybillId" INTEGER NOT NULL,
    "operatorId" INTEGER,
    "locationId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "declaredValue" INTEGER NOT NULL,
    "processedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isAccident" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "parcels_waybillId_fkey" FOREIGN KEY ("waybillId") REFERENCES "waybills" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "parcels_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operators" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "parcels_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "operators_code_key" ON "operators"("code");

-- CreateIndex
CREATE UNIQUE INDEX "operator_shifts_operatorId_date_key" ON "operator_shifts"("operatorId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "operator_works_operatorId_date_locationId_key" ON "operator_works"("operatorId", "date", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "waybills_number_key" ON "waybills"("number");

-- CreateIndex
CREATE UNIQUE INDEX "parcels_waybillId_key" ON "parcels"("waybillId");
