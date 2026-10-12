-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "components" JSONB,
ADD COLUMN     "detailSnapshot" TEXT;
