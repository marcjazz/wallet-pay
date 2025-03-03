/*
  Warnings:

  - You are about to drop the column `converstion_rate` on the `cybrid_transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cybrid_transactions" DROP COLUMN "converstion_rate",
ADD COLUMN     "conversion_rate" DOUBLE PRECISION;
