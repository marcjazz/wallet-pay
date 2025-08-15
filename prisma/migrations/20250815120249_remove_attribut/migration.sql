/*
  Warnings:

  - The values [completed] on the enum `identity_verification_status` will be removed. If these variants are still used in the database, this will fail.
  - Changed the type of `status` on the `cybrid_external_accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."cybrid_external_acccount_status" AS ENUM ('storing', 'verified', 'unverified', 'failed', 'refresh_required', 'deleting', 'deleted');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."identity_verification_status_new" AS ENUM ('storing', 'waiting', 'pending', 'reviewing', 'expired', 'passed', 'failed');
ALTER TABLE "public"."cybrid_customers" ALTER COLUMN "verification_status" TYPE "public"."identity_verification_status_new" USING ("verification_status"::text::"public"."identity_verification_status_new");
ALTER TABLE "public"."cybrid_external_accounts" ALTER COLUMN "verification_status" TYPE "public"."identity_verification_status_new" USING ("verification_status"::text::"public"."identity_verification_status_new");
ALTER TABLE "public"."receiver_payout_info" ALTER COLUMN "verification_status" TYPE "public"."identity_verification_status_new" USING ("verification_status"::text::"public"."identity_verification_status_new");
ALTER TYPE "public"."identity_verification_status" RENAME TO "identity_verification_status_old";
ALTER TYPE "public"."identity_verification_status_new" RENAME TO "identity_verification_status";
DROP TYPE "public"."identity_verification_status_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."cybrid_external_accounts" DROP COLUMN "status",
ADD COLUMN     "status" "public"."cybrid_external_acccount_status" NOT NULL;

-- DropEnum
DROP TYPE "public"."cybrid_external_account_status";
