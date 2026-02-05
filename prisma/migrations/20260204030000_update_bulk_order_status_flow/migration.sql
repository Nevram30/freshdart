-- Clean up any partial state from previous failed attempt
DROP TYPE IF EXISTS "BulkOrderStatus_new";

-- Step 1: Create new enum type with all new values
CREATE TYPE "BulkOrderStatus_new" AS ENUM (
    'ORDER_PLACED',
    'PENDING_CONFIRMATION',
    'CONFIRMED',
    'AWAITING_PAYMENT',
    'PAID',
    'PREPARING',
    'READY_FOR_SHIPMENT',
    'IN_TRANSIT',
    'DELIVERED',
    'COMPLETED',
    'DISPUTED',
    'RESOLVED',
    'CANCELLED'
);

-- Step 2: Convert BulkOrder.status column
ALTER TABLE "BulkOrder" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "BulkOrder"
    ALTER COLUMN "status" TYPE "BulkOrderStatus_new"
    USING (
        CASE "status"::text
            WHEN 'PENDING' THEN 'ORDER_PLACED'
            WHEN 'REVIEWING' THEN 'PENDING_CONFIRMATION'
            WHEN 'QUOTED' THEN 'PENDING_CONFIRMATION'
            WHEN 'PROCESSING' THEN 'PREPARING'
            WHEN 'READY_FOR_PICKUP' THEN 'READY_FOR_SHIPMENT'
            WHEN 'SHIPPED' THEN 'IN_TRANSIT'
            WHEN 'OUT_FOR_DELIVERY' THEN 'IN_TRANSIT'
            WHEN 'REJECTED' THEN 'CANCELLED'
            ELSE "status"::text
        END
    )::"BulkOrderStatus_new";

ALTER TABLE "BulkOrder" ALTER COLUMN "status" SET DEFAULT 'ORDER_PLACED'::"BulkOrderStatus_new";

-- Step 3: Convert OrderStatusHistory.fromStatus and toStatus columns (also enum typed)
ALTER TABLE "OrderStatusHistory"
    ALTER COLUMN "fromStatus" TYPE "BulkOrderStatus_new"
    USING (
        CASE "fromStatus"::text
            WHEN 'PENDING' THEN 'ORDER_PLACED'
            WHEN 'REVIEWING' THEN 'PENDING_CONFIRMATION'
            WHEN 'QUOTED' THEN 'PENDING_CONFIRMATION'
            WHEN 'PROCESSING' THEN 'PREPARING'
            WHEN 'READY_FOR_PICKUP' THEN 'READY_FOR_SHIPMENT'
            WHEN 'SHIPPED' THEN 'IN_TRANSIT'
            WHEN 'OUT_FOR_DELIVERY' THEN 'IN_TRANSIT'
            WHEN 'REJECTED' THEN 'CANCELLED'
            ELSE "fromStatus"::text
        END
    )::"BulkOrderStatus_new";

ALTER TABLE "OrderStatusHistory"
    ALTER COLUMN "toStatus" TYPE "BulkOrderStatus_new"
    USING (
        CASE "toStatus"::text
            WHEN 'PENDING' THEN 'ORDER_PLACED'
            WHEN 'REVIEWING' THEN 'PENDING_CONFIRMATION'
            WHEN 'QUOTED' THEN 'PENDING_CONFIRMATION'
            WHEN 'PROCESSING' THEN 'PREPARING'
            WHEN 'READY_FOR_PICKUP' THEN 'READY_FOR_SHIPMENT'
            WHEN 'SHIPPED' THEN 'IN_TRANSIT'
            WHEN 'OUT_FOR_DELIVERY' THEN 'IN_TRANSIT'
            WHEN 'REJECTED' THEN 'CANCELLED'
            ELSE "toStatus"::text
        END
    )::"BulkOrderStatus_new";

-- Step 4: Drop old enum type and rename new one
DROP TYPE "BulkOrderStatus";
ALTER TYPE "BulkOrderStatus_new" RENAME TO "BulkOrderStatus";

-- Step 5: Rename existing timestamp columns
ALTER TABLE "BulkOrder" RENAME COLUMN "reviewedAt" TO "pendingConfirmationAt";
ALTER TABLE "BulkOrder" RENAME COLUMN "processingAt" TO "preparingAt";
ALTER TABLE "BulkOrder" RENAME COLUMN "readyForPickupAt" TO "readyForShipmentAt";

-- Step 6: Drop removed timestamp columns
ALTER TABLE "BulkOrder" DROP COLUMN IF EXISTS "quotedAt";
ALTER TABLE "BulkOrder" DROP COLUMN IF EXISTS "shippedAt";
ALTER TABLE "BulkOrder" DROP COLUMN IF EXISTS "outForDeliveryAt";

-- Step 7: Add new timestamp columns
ALTER TABLE "BulkOrder" ADD COLUMN "awaitingPaymentAt" TIMESTAMP(3);
ALTER TABLE "BulkOrder" ADD COLUMN "paidAt" TIMESTAMP(3);
ALTER TABLE "BulkOrder" ADD COLUMN "completedAt" TIMESTAMP(3);
ALTER TABLE "BulkOrder" ADD COLUMN "disputedAt" TIMESTAMP(3);
ALTER TABLE "BulkOrder" ADD COLUMN "resolvedAt" TIMESTAMP(3);

-- Step 8: Add payment fields
ALTER TABLE "BulkOrder" ADD COLUMN "paymentStatus" TEXT;
ALTER TABLE "BulkOrder" ADD COLUMN "paymentMethod" TEXT;
ALTER TABLE "BulkOrder" ADD COLUMN "paymentIntentId" TEXT;
ALTER TABLE "BulkOrder" ADD COLUMN "paymentUrl" TEXT;

-- Step 9: Add dispute fields
ALTER TABLE "BulkOrder" ADD COLUMN "disputeReason" TEXT;
ALTER TABLE "BulkOrder" ADD COLUMN "disputeResolution" TEXT;
