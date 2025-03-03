/*
  Warnings:

  - You are about to drop the column `converstion_rate` on the `stripe_transactions` table. All the data in the column will be lost.
  - Added the required column `conversion_rate` to the `stripe_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stripe_transactions" DROP COLUMN "converstion_rate",
ADD COLUMN     "conversion_rate" DOUBLE PRECISION NOT NULL;
