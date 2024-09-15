/*
  Warnings:

  - A unique constraint covering the columns `[cybrid_customer_guid]` on the table `cybrid_customers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `cybrid_customers` MODIFY `identity_verification_guid` VARCHAR(45) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `cybrid_customers_cybrid_customer_guid_key` ON `cybrid_customers`(`cybrid_customer_guid`);
