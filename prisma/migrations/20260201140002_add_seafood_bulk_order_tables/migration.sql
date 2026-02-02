-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "localName" TEXT,
ADD COLUMN     "merchantId" TEXT,
ADD COLUMN     "productType" "ProductType" NOT NULL DEFAULT 'FRESH',
ADD COLUMN     "requiresColdChain" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "seafoodType" "SeafoodType" NOT NULL DEFAULT 'FISH',
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "speciesName" TEXT,
ALTER COLUMN "stockUnit" SET DEFAULT 'kg',
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "weightValue" DECIMAL(10,3) NOT NULL,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "estimatedSubtotal" DECIMAL(10,2) NOT NULL,
    "estimatedTotal" DECIMAL(10,2) NOT NULL,
    "estimatedWeightKg" DECIMAL(10,3) NOT NULL,
    "finalSubtotal" DECIMAL(10,2),
    "finalShipping" DECIMAL(10,2),
    "finalTotal" DECIMAL(10,2),
    "preferredDeliveryDate" TIMESTAMP(3),
    "deliveryNotes" TEXT,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "companyName" TEXT,
    "shippingAddress" JSONB,
    "status" "BulkOrderStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkOrderItem" (
    "id" TEXT NOT NULL,
    "bulkOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productImage" TEXT,
    "localName" TEXT,
    "productType" TEXT NOT NULL,
    "seafoodType" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unitType" TEXT NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "weightKg" DECIMAL(10,3) NOT NULL,
    "finalUnitPrice" DECIMAL(10,2),
    "finalTotalPrice" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BulkOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "quoteNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bulkOrderId" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "shippingCost" DECIMAL(10,2),
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "totalWeightKg" DECIMAL(10,3) NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "companyName" TEXT,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "customerNotes" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteItem" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productImage" TEXT,
    "localName" TEXT,
    "productType" TEXT NOT NULL,
    "seafoodType" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unitType" TEXT NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "weightKg" DECIMAL(10,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "ProductVariant_sku_idx" ON "ProductVariant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "BulkOrder_orderNumber_key" ON "BulkOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "BulkOrder_userId_idx" ON "BulkOrder"("userId");

-- CreateIndex
CREATE INDEX "BulkOrder_orderNumber_idx" ON "BulkOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "BulkOrder_status_idx" ON "BulkOrder"("status");

-- CreateIndex
CREATE INDEX "BulkOrder_createdAt_idx" ON "BulkOrder"("createdAt");

-- CreateIndex
CREATE INDEX "BulkOrderItem_bulkOrderId_idx" ON "BulkOrderItem"("bulkOrderId");

-- CreateIndex
CREATE INDEX "BulkOrderItem_productId_idx" ON "BulkOrderItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_quoteNumber_key" ON "Quote"("quoteNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_bulkOrderId_key" ON "Quote"("bulkOrderId");

-- CreateIndex
CREATE INDEX "Quote_userId_idx" ON "Quote"("userId");

-- CreateIndex
CREATE INDEX "Quote_quoteNumber_idx" ON "Quote"("quoteNumber");

-- CreateIndex
CREATE INDEX "Quote_status_idx" ON "Quote"("status");

-- CreateIndex
CREATE INDEX "Quote_validUntil_idx" ON "Quote"("validUntil");

-- CreateIndex
CREATE INDEX "QuoteItem_quoteId_idx" ON "QuoteItem"("quoteId");

-- CreateIndex
CREATE INDEX "QuoteItem_productId_idx" ON "QuoteItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_merchantId_idx" ON "Product"("merchantId");

-- CreateIndex
CREATE INDEX "Product_productType_idx" ON "Product"("productType");

-- CreateIndex
CREATE INDEX "Product_seafoodType_idx" ON "Product"("seafoodType");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkOrder" ADD CONSTRAINT "BulkOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkOrderItem" ADD CONSTRAINT "BulkOrderItem_bulkOrderId_fkey" FOREIGN KEY ("bulkOrderId") REFERENCES "BulkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkOrderItem" ADD CONSTRAINT "BulkOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_bulkOrderId_fkey" FOREIGN KEY ("bulkOrderId") REFERENCES "BulkOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
