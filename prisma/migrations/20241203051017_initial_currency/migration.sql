/*
  Warnings:

  - Added the required column `initial_currency_amount` to the `cybrid_transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `receiver_payout_info` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cybrid_transactions" ADD COLUMN     "currency" "cybrid_supported_currency" NOT NULL DEFAULT 'usd',
ADD COLUMN     "initial_currency_amount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "receiver_payout_info" ADD COLUMN     "address" VARCHAR(90) NOT NULL;
