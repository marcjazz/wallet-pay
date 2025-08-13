/*
  Warnings:

  - Changed the type of `status` on the `cybrid_external_accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."cybrid_external_account_status" AS ENUM ('storing', 'verified', 'unverified', 'failed', 'refresh_required', 'deleting', 'deleted');

-- AlterEnum
ALTER TYPE "public"."identity_verification_status" ADD VALUE 'completed';

-- DropIndex
DROP INDEX "public"."receiver_payout_info_person_id_phone_number_key";

-- AlterTable
ALTER TABLE "public"."cybrid_external_accounts" DROP COLUMN "status",
ADD COLUMN     "status" "public"."cybrid_external_account_status" NOT NULL;

-- DropEnum
DROP TYPE "public"."cybrid_external_acccount_status";
