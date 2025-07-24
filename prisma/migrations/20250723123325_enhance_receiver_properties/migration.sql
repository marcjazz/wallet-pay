-- AlterTable
ALTER TABLE "receiver_payout_info" ADD COLUMN     "deleted_at" TIMESTAMP,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;
