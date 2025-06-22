/*
  Warnings:

  - A unique constraint covering the columns `[person_id,phone_number]` on the table `receiver_payout_info` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "receiver_payout_info_person_id_fullname_phone_number_key";

-- CreateIndex
CREATE UNIQUE INDEX "receiver_payout_info_person_id_phone_number_key" ON "receiver_payout_info"("person_id", "phone_number");
