-- CreateEnum
CREATE TYPE "ShippingCarrier" AS ENUM ('JT_EXPRESS', 'LALAMOVE', 'GRAB_EXPRESS', 'LBC', 'GOGO_XPRESS', 'NINJA_VAN', 'SELF_DELIVERY', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BulkOrderStatus" ADD VALUE 'READY_FOR_PICKUP';
ALTER TYPE "BulkOrderStatus" ADD VALUE 'IN_TRANSIT';
ALTER TYPE "BulkOrderStatus" ADD VALUE 'OUT_FOR_DELIVERY';

-- AlterTable
ALTER TABLE "BulkOrder" ADD COLUMN     "actualDeliveryDate" TIMESTAMP(3),
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "carrier" "ShippingCarrier",
ADD COLUMN     "carrierOther" TEXT,
ADD COLUMN     "coldChainSurcharge" DECIMAL(10,2),
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "deliveryProofUrl" TEXT,
ADD COLUMN     "deliverySignature" TEXT,
ADD COLUMN     "estimatedDeliveryDate" TIMESTAMP(3),
ADD COLUMN     "inTransitAt" TIMESTAMP(3),
ADD COLUMN     "outForDeliveryAt" TIMESTAMP(3),
ADD COLUMN     "processingAt" TIMESTAMP(3),
ADD COLUMN     "quotedAt" TIMESTAMP(3),
ADD COLUMN     "readyForPickupAt" TIMESTAMP(3),
ADD COLUMN     "receivedBy" TEXT,
ADD COLUMN     "requiresColdChain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "trackingNumber" TEXT,
ADD COLUMN     "trackingUrl" TEXT;

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" TEXT NOT NULL,
    "bulkOrderId" TEXT NOT NULL,
    "fromStatus" "BulkOrderStatus" NOT NULL,
    "toStatus" "BulkOrderStatus" NOT NULL,
    "changedById" TEXT NOT NULL,
    "changedByName" TEXT NOT NULL,
    "changedByRole" TEXT NOT NULL,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderStatusHistory_bulkOrderId_idx" ON "OrderStatusHistory"("bulkOrderId");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_createdAt_idx" ON "OrderStatusHistory"("createdAt");

-- CreateIndex
CREATE INDEX "BulkOrder_trackingNumber_idx" ON "BulkOrder"("trackingNumber");

-- CreateIndex
CREATE INDEX "BulkOrder_carrier_idx" ON "BulkOrder"("carrier");

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_bulkOrderId_fkey" FOREIGN KEY ("bulkOrderId") REFERENCES "BulkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
