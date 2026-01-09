-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProductUnit" ADD VALUE 'GRAMM';
ALTER TYPE "ProductUnit" ADD VALUE 'SACK';

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "customData" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "Farmer" ADD COLUMN     "customData" JSONB NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE "MonitoringConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonitoringConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonitoringConfig_key_key" ON "MonitoringConfig"("key");
