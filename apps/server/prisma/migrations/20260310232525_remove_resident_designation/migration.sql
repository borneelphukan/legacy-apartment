/*
  Warnings:

  - You are about to drop the column `designation` on the `resident` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "resident" DROP COLUMN "designation";

-- AlterTable
ALTER TABLE "setting" ALTER COLUMN "year" DROP DEFAULT;
