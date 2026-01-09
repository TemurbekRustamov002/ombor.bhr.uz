-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'BRIGADIER';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "brigadierId" TEXT,
ADD COLUMN     "contourId" TEXT;

-- CreateTable
CREATE TABLE "Brigadier" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brigadier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contour" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "name" TEXT,
    "area" DOUBLE PRECISION NOT NULL,
    "brigadierId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brigadier_userId_key" ON "Brigadier"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Contour_number_key" ON "Contour"("number");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_brigadierId_fkey" FOREIGN KEY ("brigadierId") REFERENCES "Brigadier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_contourId_fkey" FOREIGN KEY ("contourId") REFERENCES "Contour"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brigadier" ADD CONSTRAINT "Brigadier_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contour" ADD CONSTRAINT "Contour_brigadierId_fkey" FOREIGN KEY ("brigadierId") REFERENCES "Brigadier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
