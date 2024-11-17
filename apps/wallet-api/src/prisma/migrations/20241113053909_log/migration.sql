/*
  Warnings:

  - The primary key for the `bank_payout_info` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `bank_payout_info_id` on the `bank_payout_info` table. All the data in the column will be lost.
  - You are about to drop the column `identity_verification_guid` on the `cybrid_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `verification_status` on the `cybrid_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `bank_info_id` on the `cybrid_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `payout_info_id` on the `cybrid_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `logs` table. All the data in the column will be lost.
  - The primary key for the `receiver_payout_info` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `receiver_payout_info_id` on the `receiver_payout_info` table. All the data in the column will be lost.
  - You are about to drop the column `subdomain` on the `roles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[person_id,fullname,phone_number]` on the table `receiver_payout_info` will be added. If there are existing duplicate values, this will fail.
  - The required column `receiver_bank_payout_info_id` was added to the `bank_payout_info` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `cybrid_counter_party_id` was added to the `receiver_payout_info` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `cybrid_counterparty_guid` to the `receiver_payout_info` table without a default value. This is not possible if the table is not empty.
  - Added the required column `person_id` to the `receiver_payout_info` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "cybrid_transactions" DROP CONSTRAINT "fk_CybridTransaction_BankInfo1";

-- DropForeignKey
ALTER TABLE "cybrid_transactions" DROP CONSTRAINT "fk_CybridTransaction_PayoutInfo1";

-- DropForeignKey
ALTER TABLE "stripe_transactions" DROP CONSTRAINT "fk_StripeTransaction_BankPayoutInfo1";

-- DropForeignKey
ALTER TABLE "stripe_transactions" DROP CONSTRAINT "fk_StripeTransaction_ReceiverPayoutInfo1";

-- DropIndex
DROP INDEX "fk_CybridTransaction_BankInfo1_idx";

-- DropIndex
DROP INDEX "fk_CybridTransaction_PayoutInfo1_idx";

-- DropIndex
DROP INDEX "roles_title_subdomain_key";

-- AlterTable
ALTER TABLE "bank_payout_info" DROP CONSTRAINT "bank_payout_info_pkey",
DROP COLUMN "bank_payout_info_id",
ADD COLUMN     "receiver_bank_payout_info_id" VARCHAR(36) NOT NULL,
ADD CONSTRAINT "bank_payout_info_pkey" PRIMARY KEY ("receiver_bank_payout_info_id");

-- AlterTable
ALTER TABLE "cybrid_accounts" DROP COLUMN "identity_verification_guid",
DROP COLUMN "verification_status";

-- AlterTable
ALTER TABLE "cybrid_external_accounts" ALTER COLUMN "mask" DROP NOT NULL;

-- AlterTable
ALTER TABLE "cybrid_transactions" DROP COLUMN "bank_info_id",
DROP COLUMN "payout_info_id",
ADD COLUMN     "receiver_bank_payout_info_id" TEXT,
ADD COLUMN     "receiver_payout_info_id" TEXT;

-- AlterTable
ALTER TABLE "logs" DROP COLUMN "refresh_token";

-- AlterTable
ALTER TABLE "receiver_payout_info" DROP CONSTRAINT "receiver_payout_info_pkey",
DROP COLUMN "receiver_payout_info_id",
ADD COLUMN     "cybrid_counter_party_id" VARCHAR(36) NOT NULL,
ADD COLUMN     "cybrid_counterparty_guid" VARCHAR(45) NOT NULL,
ADD COLUMN     "person_id" TEXT NOT NULL,
ADD CONSTRAINT "receiver_payout_info_pkey" PRIMARY KEY ("cybrid_counter_party_id");

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "subdomain";

-- CreateTable
CREATE TABLE "CybridSubscriptionEvent" (
    "event_guid" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "organization_guid" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CybridSubscriptionEvent_event_guid_key" ON "CybridSubscriptionEvent"("event_guid");

-- CreateIndex
CREATE INDEX "fk_CybridTransaction_BankInfo1_idx" ON "cybrid_transactions"("receiver_bank_payout_info_id");

-- CreateIndex
CREATE INDEX "fk_CybridTransaction_PayoutInfo1_idx" ON "cybrid_transactions"("receiver_payout_info_id");

-- CreateIndex
CREATE UNIQUE INDEX "receiver_payout_info_person_id_fullname_phone_number_key" ON "receiver_payout_info"("person_id", "fullname", "phone_number");

-- AddForeignKey
ALTER TABLE "cybrid_transactions" ADD CONSTRAINT "fk_CybridTransaction_PayoutInfo1" FOREIGN KEY ("receiver_payout_info_id") REFERENCES "receiver_payout_info"("cybrid_counter_party_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cybrid_transactions" ADD CONSTRAINT "fk_CybridTransaction_BankInfo1" FOREIGN KEY ("receiver_bank_payout_info_id") REFERENCES "bank_payout_info"("receiver_bank_payout_info_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "receiver_payout_info" ADD CONSTRAINT "fk_ReceiverPayoutInfo_Person" FOREIGN KEY ("person_id") REFERENCES "persons"("person_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stripe_transactions" ADD CONSTRAINT "fk_StripeTransaction_ReceiverPayoutInfo1" FOREIGN KEY ("receiver_payout_info_id") REFERENCES "receiver_payout_info"("cybrid_counter_party_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stripe_transactions" ADD CONSTRAINT "fk_StripeTransaction_BankPayoutInfo1" FOREIGN KEY ("bank_payout_info_id") REFERENCES "bank_payout_info"("receiver_bank_payout_info_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
