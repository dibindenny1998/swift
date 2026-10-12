-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "couponCode" TEXT,
ADD COLUMN     "giftMessage" TEXT,
ADD COLUMN     "giftWrap" BOOLEAN NOT NULL DEFAULT true;
