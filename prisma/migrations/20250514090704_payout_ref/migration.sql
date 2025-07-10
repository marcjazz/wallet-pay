/*
  Warnings:

  - You are about to drop the column `pawapay_payout_id` on the `cybrid_transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cybrid_transactions" DROP COLUMN "pawapay_payout_id",
ADD COLUMN     "remittance_payout_ref" VARCHAR(36);
