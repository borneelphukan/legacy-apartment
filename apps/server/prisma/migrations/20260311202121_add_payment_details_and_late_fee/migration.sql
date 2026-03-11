-- AlterTable
ALTER TABLE "monthly_payment" ADD COLUMN     "lateFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "paymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentType" TEXT;
