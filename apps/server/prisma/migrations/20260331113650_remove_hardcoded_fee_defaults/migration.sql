-- AlterTable
ALTER TABLE "resident" ALTER COLUMN "monthlyRate" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "setting" ALTER COLUMN "monthlyFee" SET DEFAULT 0,
ALTER COLUMN "yearlyFee" SET DEFAULT 0;
