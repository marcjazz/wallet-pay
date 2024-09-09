/*
  Warnings:

  - You are about to drop the column `person_id` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `subdomain` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `is_used` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `is_valid` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `person_id` on the `otps` table. All the data in the column will be lost.
  - The primary key for the `person_audits` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `currency` on the `supported_currencies` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `VarChar(3)`.
  - A unique constraint covering the columns `[email]` on the table `persons` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `persons` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,subdomain]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `person_has_role_id` to the `logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `otps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `person_has_role_id` to the `otps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthdate` to the `person_audits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `person_audits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_verified` to the `person_audits` table without a default value. This is not possible if the table is not empty.
  - Made the column `first_name` on table `person_audits` required. This step will fail if there are existing NULL values in that column.
  - Made the column `last_name` on table `person_audits` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `person_audits` required. This step will fail if there are existing NULL values in that column.
  - Made the column `username` on table `person_audits` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone_number` on table `person_audits` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `person_audits` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `birthdate` to the `persons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `persons` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `logs` DROP FOREIGN KEY `fk_Log_Person1`;

-- DropForeignKey
ALTER TABLE `otps` DROP FOREIGN KEY `fk_ResetPassword_Person1`;

-- AlterTable
ALTER TABLE `logs` DROP COLUMN `person_id`,
    DROP COLUMN `subdomain`,
    ADD COLUMN `person_has_role_id` VARCHAR(191) NOT NULL,
    MODIFY `method` VARCHAR(45) NOT NULL DEFAULT 'local',
    MODIFY `refresh_token` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `otps` DROP COLUMN `is_used`,
    DROP COLUMN `is_valid`,
    DROP COLUMN `person_id`,
    ADD COLUMN `expires_at` DATETIME(0) NOT NULL,
    ADD COLUMN `is_verified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `person_has_role_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `person_audits` DROP PRIMARY KEY,
    ADD COLUMN `birthdate` DATETIME(3) NOT NULL,
    ADD COLUMN `gender` ENUM('male', 'female', 'other') NOT NULL,
    ADD COLUMN `is_verified` BOOLEAN NOT NULL,
    ADD COLUMN `preferred_language` ENUM('en-US', 'fr') NOT NULL DEFAULT 'en-US',
    MODIFY `person_audit_id` VARCHAR(191) NOT NULL,
    MODIFY `first_name` VARCHAR(45) NOT NULL,
    MODIFY `last_name` VARCHAR(45) NOT NULL,
    MODIFY `email` VARCHAR(45) NOT NULL,
    MODIFY `username` VARCHAR(45) NOT NULL,
    MODIFY `phone_number` VARCHAR(45) NOT NULL,
    MODIFY `password` VARCHAR(255) NOT NULL,
    ADD PRIMARY KEY (`person_audit_id`);

-- AlterTable
ALTER TABLE `person_has_roles` MODIFY `is_active` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `persons` ADD COLUMN `birthdate` DATETIME(3) NOT NULL,
    ADD COLUMN `gender` ENUM('male', 'female', 'other') NOT NULL,
    ADD COLUMN `is_verified` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `password` VARCHAR(255) NOT NULL,
    MODIFY `preferred_language` ENUM('en-US', 'fr') NOT NULL DEFAULT 'en-US';

-- AlterTable
ALTER TABLE `role_audits` ALTER COLUMN `is_active` DROP DEFAULT;

-- AlterTable
ALTER TABLE `roles` ADD COLUMN `subdomain` VARCHAR(45) NULL,
    MODIFY `is_active` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `supported_currencies` MODIFY `currency` VARCHAR(3) NOT NULL;

-- AlterTable
ALTER TABLE `supported_currency_audits` ALTER COLUMN `is_active` DROP DEFAULT,
    ALTER COLUMN `audited_at` DROP DEFAULT;

-- CreateIndex
CREATE INDEX `fk_Log_Person1_idx` ON `logs`(`person_has_role_id`);

-- CreateIndex
CREATE INDEX `fk_OTP_PersonHasRole1_idx` ON `otps`(`person_has_role_id`);

-- CreateIndex
CREATE UNIQUE INDEX `persons_email_key` ON `persons`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `persons_username_key` ON `persons`(`username`);

-- CreateIndex
CREATE UNIQUE INDEX `roles_title_key` ON `roles`(`title`);

-- CreateIndex
CREATE UNIQUE INDEX `roles_title_subdomain_key` ON `roles`(`title`, `subdomain`);

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `fk_Log_Person1` FOREIGN KEY (`person_has_role_id`) REFERENCES `person_has_roles`(`person_has_role_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `otps` ADD CONSTRAINT `fk_OTP_PersonHasRole1` FOREIGN KEY (`person_has_role_id`) REFERENCES `person_has_roles`(`person_has_role_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
