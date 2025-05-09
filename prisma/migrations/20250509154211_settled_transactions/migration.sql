/*
  Warnings:

  - You are about to drop the column `cybrid_transfer_settlement_guid` on the `cybrid_transactions` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "cybrid_transfer_status" ADD VALUE 'reverted';

-- AlterTable
ALTER TABLE "cybrid_transactions" DROP COLUMN "cybrid_transfer_settlement_guid",
ADD COLUMN     "withdrawal_transaction_id" VARCHAR(45),
ALTER COLUMN "initiated_by" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "cybrid_transactions" ADD CONSTRAINT "cybrid_transactions_withdrawal_transaction_id_fkey" FOREIGN KEY ("withdrawal_transaction_id") REFERENCES "cybrid_transactions"("cybrid_transaction_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
