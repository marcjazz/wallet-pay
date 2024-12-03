/*
  Warnings:

  - Added the required column `address` to the `receiver_payout_info` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "receiver_payout_info" ADD COLUMN     "address" VARCHAR(90) NOT NULL;
