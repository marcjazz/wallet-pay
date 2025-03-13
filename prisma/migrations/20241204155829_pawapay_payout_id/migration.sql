/*
  Warnings:

  - The required column `pawapay_payout_id` was added to the `cybrid_transactions` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "cybrid_transactions" ADD COLUMN     "pawapay_payout_id" VARCHAR(36) NOT NULL;
