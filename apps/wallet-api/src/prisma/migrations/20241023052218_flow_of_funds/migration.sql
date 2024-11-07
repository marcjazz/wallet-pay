/*
  Warnings:

  - Added the required column `mask` to the `cybrid_external_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cybrid_external_accounts" ADD COLUMN     "mask" VARCHAR(4) NOT NULL;
