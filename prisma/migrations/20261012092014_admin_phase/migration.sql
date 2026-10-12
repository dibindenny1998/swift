-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "refundedAmount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "labelUrl" TEXT;

-- CreateTable
CREATE TABLE "AdminLoginAttempt" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminLoginAttempt_email_createdAt_idx" ON "AdminLoginAttempt"("email", "createdAt");

-- CreateIndex
CREATE INDEX "AdminLoginAttempt_ip_createdAt_idx" ON "AdminLoginAttempt"("ip", "createdAt");
