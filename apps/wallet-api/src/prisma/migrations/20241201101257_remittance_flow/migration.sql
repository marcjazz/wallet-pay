/*
  Warnings:

  - A unique constraint covering the columns `[cybrid_counterparty_guid]` on the table `receiver_payout_info` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `currency` to the `cybrid_external_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `receiver_payout_info` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "cybrid_counterparty_status" AS ENUM ('storing', 'unverified', 'verified', 'rejected');

-- AlterEnum
ALTER TYPE "cybrid_supported_currency" ADD VALUE 'usdc_sol';

-- AlterTable
ALTER TABLE "cybrid_external_accounts" ADD COLUMN     "currency" "cybrid_supported_currency" NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "cybrid_transactions" ADD COLUMN     "cybrid_crypto_account_id" TEXT,
ADD COLUMN     "payout_at" TIMESTAMP;

-- AlterTable
ALTER TABLE "receiver_payout_info" ADD COLUMN     "identity_verification_guid" VARCHAR(45),
ADD COLUMN     "status" "cybrid_counterparty_status" NOT NULL,
ADD COLUMN     "verification_status" "identity_verification_status";

-- CreateIndex
CREATE UNIQUE INDEX "receiver_payout_info_cybrid_counterparty_guid_key" ON "receiver_payout_info"("cybrid_counterparty_guid");

-- RenameForeignKey
ALTER TABLE "cybrid_transactions" RENAME CONSTRAINT "fk_CybridTransaction_CybridAccount1" TO "fk_CybridTransaction_CybridCustomer1";

-- RenameForeignKey
ALTER TABLE "cybrid_transactions" RENAME CONSTRAINT "fk_CybridTransaction_CybridAccount2" TO "fk_CybridTransaction_CybridAccount1";

-- AddForeignKey
ALTER TABLE "cybrid_transactions" ADD CONSTRAINT "fk_CybridTransaction_CybridAccount2" FOREIGN KEY ("cybrid_crypto_account_id") REFERENCES "cybrid_accounts"("cybrid_account_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
