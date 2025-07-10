/*
  Warnings:

  - You are about to drop the column `username` on the `person_audits` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `persons` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "persons_username_key";

-- AlterTable
ALTER TABLE "person_audits" DROP COLUMN "username";

-- AlterTable
ALTER TABLE "persons" DROP COLUMN "username";
