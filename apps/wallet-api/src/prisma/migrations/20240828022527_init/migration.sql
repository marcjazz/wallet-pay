-- CreateTable
CREATE TABLE `bank_payout_info` (
    `bank_payout_info_id` VARCHAR(36) NOT NULL,
    `holder_name` VARCHAR(45) NOT NULL,
    `bank_name` VARCHAR(45) NOT NULL,
    `iban_number` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`bank_payout_info_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_audits` (
    `cybrid_customer_audit_id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `cybrid_customer_id` VARCHAR(36) NOT NULL,
    `audited_by` VARCHAR(36) NOT NULL,

    INDEX `fk_CustomerAudit_Customer1_idx`(`cybrid_customer_id`),
    INDEX `fk_CustomerAudit_PersonHasRole1_idx`(`audited_by`),
    PRIMARY KEY (`cybrid_customer_audit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cybrid_accounts` (
    `cybrid_account_id` VARCHAR(36) NOT NULL,
    `cybrid_account_guid` VARCHAR(45) NOT NULL,
    `currency` ENUM('usd', 'cad') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `cybrid_customer_id` VARCHAR(191) NOT NULL,
    `account_type` ENUM('external', 'fiat') NOT NULL,

    INDEX `fk_CybridAccount_CybridCustomer1_idx`(`cybrid_customer_id`),
    PRIMARY KEY (`cybrid_account_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cybrid_customers` (
    `cybrid_customer_id` VARCHAR(36) NOT NULL,
    `cybrid_customer_guid` VARCHAR(45) NOT NULL,
    `country` ENUM('usa', 'canada') NULL,
    `identity_verification_guid` VARCHAR(45) NOT NULL,
    `person_id` VARCHAR(191) NOT NULL,

    INDEX `fk_Customer_Person1_idx`(`person_id`),
    PRIMARY KEY (`cybrid_customer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cybrid_external_accounts` (
    `cybrid_external_account_id` VARCHAR(36) NOT NULL,
    `identity_verification_guid` VARCHAR(45) NOT NULL,
    `cybrid_external_account_guid` VARCHAR(45) NOT NULL,
    `cybrid_customer_id` VARCHAR(191) NOT NULL,

    INDEX `fk_ExternalAccount_CybridCustomer1_idx`(`cybrid_customer_id`),
    PRIMARY KEY (`cybrid_external_account_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cybrid_transactions` (
    `cybrid_transaction_id` VARCHAR(36) NOT NULL,
    `cybrid_transaction_guid` VARCHAR(45) NOT NULL,
    `amount_sent` INTEGER NOT NULL,
    `initial_currency` ENUM('usd', 'cad') NOT NULL,
    `converstion_rate` INTEGER NOT NULL,
    `fees` INTEGER NOT NULL,
    `transaction_id` VARCHAR(45) NOT NULL,
    `transaction_type` ENUM('remittance', 'convert', 'funding', 'withdrawal', 'account', 'xaf') NOT NULL,
    `initiated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `settled_at` DATETIME(0) NULL,
    `local_customer_id` VARCHAR(191) NULL,
    `payout_info_id` VARCHAR(191) NULL,
    `bank_info_id` VARCHAR(191) NULL,
    `cybrid_account_id` VARCHAR(191) NULL,
    `cybrid_external_account_id` VARCHAR(191) NULL,
    `initiated_by` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `cybrid_transaction_guid_UNIQUE`(`cybrid_transaction_guid`),
    INDEX `fk_CybridTransaction_BankInfo1_idx`(`bank_info_id`),
    INDEX `fk_CybridTransaction_CybridAccount1_idx`(`initiated_by`),
    INDEX `fk_CybridTransaction_CybridAccount2_idx`(`cybrid_account_id`),
    INDEX `fk_CybridTransaction_CybridExternalAccount1_idx`(`cybrid_external_account_id`),
    INDEX `fk_CybridTransaction_LocalCustomer1_idx`(`local_customer_id`),
    INDEX `fk_CybridTransaction_PayoutInfo1_idx`(`payout_info_id`),
    PRIMARY KEY (`cybrid_transaction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `local_customers` (
    `local_customer_id` VARCHAR(36) NOT NULL,
    `currency` ENUM('XAF', 'NIARA') NULL,
    `account_number` VARCHAR(45) NOT NULL,
    `verification_status` ENUM('unverified', 'pending', 'verified') NULL,
    `balance` INTEGER NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `person_id` VARCHAR(191) NOT NULL,

    INDEX `fk_LocalCustomer_Person1_idx`(`person_id`),
    PRIMARY KEY (`local_customer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `local_transactions` (
    `local_transaction_id` VARCHAR(36) NOT NULL,
    `amount` INTEGER NOT NULL,
    `initiated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `sent_by` VARCHAR(191) NOT NULL,
    `received_by` VARCHAR(191) NOT NULL,
    `initiated_by` VARCHAR(191) NOT NULL,

    INDEX `fk_LocalTransaction_LocalCustomer1_idx`(`sent_by`),
    INDEX `fk_LocalTransaction_LocalCustomer2_idx`(`received_by`),
    INDEX `fk_LocalTransaction_PersonHasRole1_idx`(`initiated_by`),
    PRIMARY KEY (`local_transaction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logs` (
    `log_id` VARCHAR(36) NOT NULL,
    `login_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `logout_at` DATETIME(0) NULL,
    `method` VARCHAR(45) NOT NULL,
    `refresh_token` VARCHAR(45) NOT NULL,
    `subdomain` VARCHAR(45) NULL,
    `person_id` VARCHAR(191) NOT NULL,

    INDEX `fk_Log_Person1_idx`(`person_id`),
    PRIMARY KEY (`log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `otps` (
    `otp_id` VARCHAR(36) NOT NULL,
    `is_valid` BOOLEAN NOT NULL,
    `code` VARCHAR(45) NOT NULL,
    `usage` VARCHAR(45) NOT NULL,
    `is_used` BOOLEAN NOT NULL DEFAULT false,
    `updated_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `person_id` VARCHAR(191) NOT NULL,

    INDEX `fk_ResetPassword_Person1_idx`(`person_id`),
    PRIMARY KEY (`otp_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `persons` (
    `person_id` VARCHAR(36) NOT NULL,
    `first_name` VARCHAR(45) NOT NULL,
    `last_name` VARCHAR(45) NOT NULL,
    `email` VARCHAR(45) NOT NULL,
    `username` VARCHAR(45) NOT NULL,
    `phone_number` VARCHAR(45) NOT NULL,
    `password` VARCHAR(45) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `preferred_language` ENUM('en-US', 'fr') NOT NULL,

    PRIMARY KEY (`person_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `person_audits` (
    `person_audit_id` INTEGER NOT NULL,
    `first_name` VARCHAR(45) NULL,
    `last_name` VARCHAR(45) NULL,
    `email` VARCHAR(45) NULL,
    `username` VARCHAR(45) NULL,
    `phone_number` VARCHAR(45) NULL,
    `password` VARCHAR(45) NULL,
    `audited_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `person_id` VARCHAR(191) NOT NULL,
    `audited_by` VARCHAR(191) NOT NULL,

    INDEX `fk_PersonAudit_Person2_idx`(`person_id`),
    INDEX `fk_PersonAudit_PersonHasRole1_idx`(`audited_by`),
    PRIMARY KEY (`person_audit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `person_has_roles` (
    `person_has_role_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `person_id` VARCHAR(36) NOT NULL,
    `role_id` VARCHAR(36) NOT NULL,
    `created_by` VARCHAR(36) NULL,

    INDEX `fk_Login_Person1_idx`(`person_id`),
    INDEX `fk_Login_Role1_idx`(`role_id`),
    INDEX `fk_PersonHasRole_PersonHasRole1_idx`(`created_by`),
    PRIMARY KEY (`person_has_role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `person_has_role_audits` (
    `person_has_role_audit_id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL,
    `audited_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `person_has_role_id` VARCHAR(191) NOT NULL,
    `audited_by` VARCHAR(191) NOT NULL,

    INDEX `fk_PersonHasRoleAudit_PersonHasRole1_idx`(`person_has_role_id`),
    INDEX `fk_PersonHasRoleAudit_PersonHasRole2_idx`(`audited_by`),
    PRIMARY KEY (`person_has_role_audit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `receiver_payout_info` (
    `receiver_payout_info_id` VARCHAR(36) NOT NULL,
    `fullname` VARCHAR(45) NOT NULL,
    `phone_number` VARCHAR(45) NOT NULL,
    `national_id_number` VARCHAR(45) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`receiver_payout_info_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `role_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(45) NOT NULL,
    `is_active` BOOLEAN NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` VARCHAR(191) NOT NULL,

    INDEX `fk_Role_Person1_idx`(`created_by`),
    PRIMARY KEY (`role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_audits` (
    `role_audit_id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `title` VARCHAR(45) NOT NULL,
    `audited_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `role_id` VARCHAR(191) NOT NULL,
    `audited_by` VARCHAR(191) NOT NULL,

    INDEX `fk_RoleAudit_Person1_idx`(`audited_by`),
    INDEX `fk_RoleAudit_Role1_idx`(`role_id`),
    PRIMARY KEY (`role_audit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stripe_transactions` (
    `stripe_transaction_id` VARCHAR(36) NOT NULL,
    `amount_sent` INTEGER NOT NULL,
    `fees` INTEGER NOT NULL,
    `converstion_rate` INTEGER NOT NULL,
    `transaction_id` VARCHAR(45) NOT NULL,
    `stripe_transaction_guid` VARCHAR(45) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `settled_at` DATETIME(0) NULL,
    `initial_currency` VARCHAR(36) NOT NULL,
    `created_by` VARCHAR(36) NOT NULL,
    `local_customer_id` VARCHAR(36) NULL,
    `receiver_payout_info_id` VARCHAR(36) NULL,
    `bank_payout_info_id` VARCHAR(36) NULL,

    INDEX `fk_StripeTransaction_BankPayoutInfo1_idx`(`bank_payout_info_id`),
    INDEX `fk_StripeTransaction_LocalCustomer1_idx`(`local_customer_id`),
    INDEX `fk_StripeTransaction_PersonHasRole1_idx`(`created_by`),
    INDEX `fk_StripeTransaction_ReceiverPayoutInfo1_idx`(`receiver_payout_info_id`),
    INDEX `fk_StripeTransaction_SupportedCurrency1_idx`(`initial_currency`),
    PRIMARY KEY (`stripe_transaction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supported_currencies` (
    `supported_currency_id` VARCHAR(36) NOT NULL,
    `currency` ENUM('usa', 'canada') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `xaf_rate` INTEGER NOT NULL,
    `last_updated` DATETIME(0) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` VARCHAR(191) NOT NULL,

    INDEX `fk_SupportedCurrency_PersonHasRole1_idx`(`created_by`),
    PRIMARY KEY (`supported_currency_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supported_currency_audits` (
    `supported_currency_audit_id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `audited_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `supported_currency_id` VARCHAR(191) NOT NULL,
    `audited_by` VARCHAR(191) NOT NULL,

    INDEX `fk_SupportedCurrencyAudit_SupportedCurrency1_idx`(`supported_currency_id`),
    INDEX `fk_SupportedCurrency_PersonHasRole1_idx`(`audited_by`),
    PRIMARY KEY (`supported_currency_audit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `customer_audits` ADD CONSTRAINT `fk_CustomerAudit_Customer1` FOREIGN KEY (`cybrid_customer_id`) REFERENCES `cybrid_customers`(`cybrid_customer_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `customer_audits` ADD CONSTRAINT `fk_CustomerAudit_PersonHasRole1` FOREIGN KEY (`audited_by`) REFERENCES `person_has_roles`(`person_has_role_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cybrid_accounts` ADD CONSTRAINT `fk_CybridAccount_CybridCustomer1` FOREIGN KEY (`cybrid_customer_id`) REFERENCES `cybrid_customers`(`cybrid_customer_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cybrid_customers` ADD CONSTRAINT `fk_Customer_Person1` FOREIGN KEY (`person_id`) REFERENCES `persons`(`person_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cybrid_external_accounts` ADD CONSTRAINT `fk_ExternalAccount_CybridCustomer1` FOREIGN KEY (`cybrid_customer_id`) REFERENCES `cybrid_customers`(`cybrid_customer_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cybrid_transactions` ADD CONSTRAINT `fk_CybridTransaction_LocalCustomer1` FOREIGN KEY (`local_customer_id`) REFERENCES `local_customers`(`local_customer_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cybrid_transactions` ADD CONSTRAINT `fk_CybridTransaction_PayoutInfo1` FOREIGN KEY (`payout_info_id`) REFERENCES `receiver_payout_info`(`receiver_payout_info_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cybrid_transactions` ADD CONSTRAINT `fk_CybridTransaction_BankInfo1` FOREIGN KEY (`bank_info_id`) REFERENCES `bank_payout_info`(`bank_payout_info_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cybrid_transactions` ADD CONSTRAINT `fk_CybridTransaction_CybridAccount2` FOREIGN KEY (`cybrid_account_id`) REFERENCES `cybrid_accounts`(`cybrid_account_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cybrid_transactions` ADD CONSTRAINT `fk_CybridTransaction_CybridExternalAccount1` FOREIGN KEY (`cybrid_external_account_id`) REFERENCES `cybrid_external_accounts`(`cybrid_external_account_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cybrid_transactions` ADD CONSTRAINT `fk_CybridTransaction_CybridAccount1` FOREIGN KEY (`initiated_by`) REFERENCES `cybrid_accounts`(`cybrid_account_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `local_customers` ADD CONSTRAINT `fk_LocalCustomer_Person1` FOREIGN KEY (`person_id`) REFERENCES `persons`(`person_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `local_transactions` ADD CONSTRAINT `fk_LocalTransaction_LocalCustomer1` FOREIGN KEY (`sent_by`) REFERENCES `local_customers`(`local_customer_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `local_transactions` ADD CONSTRAINT `fk_LocalTransaction_LocalCustomer2` FOREIGN KEY (`received_by`) REFERENCES `local_customers`(`local_customer_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `local_transactions` ADD CONSTRAINT `fk_LocalTransaction_PersonHasRole1` FOREIGN KEY (`initiated_by`) REFERENCES `person_has_roles`(`person_has_role_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `fk_Log_Person1` FOREIGN KEY (`person_id`) REFERENCES `persons`(`person_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `otps` ADD CONSTRAINT `fk_ResetPassword_Person1` FOREIGN KEY (`person_id`) REFERENCES `persons`(`person_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `person_audits` ADD CONSTRAINT `fk_PersonAudit_Person2` FOREIGN KEY (`person_id`) REFERENCES `persons`(`person_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `person_audits` ADD CONSTRAINT `fk_PersonAudit_PersonHasRole1` FOREIGN KEY (`audited_by`) REFERENCES `person_has_roles`(`person_has_role_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `person_has_roles` ADD CONSTRAINT `fk_PersonHasRole_Person1` FOREIGN KEY (`person_id`) REFERENCES `persons`(`person_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `person_has_roles` ADD CONSTRAINT `fk_PersonHasRole_Role1` FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `person_has_roles` ADD CONSTRAINT `fk_PersonHasRole_PersonHasRole1` FOREIGN KEY (`created_by`) REFERENCES `person_has_roles`(`person_has_role_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `person_has_role_audits` ADD CONSTRAINT `fk_PersonHasRoleAudit_PersonHasRole1` FOREIGN KEY (`person_has_role_id`) REFERENCES `person_has_roles`(`person_has_role_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `person_has_role_audits` ADD CONSTRAINT `fk_PersonHasRoleAudit_PersonHasRole2` FOREIGN KEY (`audited_by`) REFERENCES `person_has_roles`(`person_has_role_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `fk_Role_Person1` FOREIGN KEY (`created_by`) REFERENCES `persons`(`person_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `role_audits` ADD CONSTRAINT `fk_RoleAudit_Role1` FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `role_audits` ADD CONSTRAINT `fk_RoleAudit_Person1` FOREIGN KEY (`audited_by`) REFERENCES `persons`(`person_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `stripe_transactions` ADD CONSTRAINT `fk_StripeTransaction_SupportedCurrency1` FOREIGN KEY (`initial_currency`) REFERENCES `supported_currencies`(`supported_currency_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `stripe_transactions` ADD CONSTRAINT `fk_StripeTransaction_PersonHasRole1` FOREIGN KEY (`created_by`) REFERENCES `person_has_roles`(`person_has_role_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `stripe_transactions` ADD CONSTRAINT `fk_StripeTransaction_LocalCustomer1` FOREIGN KEY (`local_customer_id`) REFERENCES `local_customers`(`local_customer_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `stripe_transactions` ADD CONSTRAINT `fk_StripeTransaction_ReceiverPayoutInfo1` FOREIGN KEY (`receiver_payout_info_id`) REFERENCES `receiver_payout_info`(`receiver_payout_info_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `stripe_transactions` ADD CONSTRAINT `fk_StripeTransaction_BankPayoutInfo1` FOREIGN KEY (`bank_payout_info_id`) REFERENCES `bank_payout_info`(`bank_payout_info_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `supported_currencies` ADD CONSTRAINT `fk_SupportedCurrency_PersonHasRole1` FOREIGN KEY (`created_by`) REFERENCES `person_has_roles`(`person_has_role_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `supported_currency_audits` ADD CONSTRAINT `fk_SupportedCurrencyAudit_SupportedCurrency1` FOREIGN KEY (`supported_currency_id`) REFERENCES `supported_currencies`(`supported_currency_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `supported_currency_audits` ADD CONSTRAINT `fk_SupportedCurrency_PersonHasRole10` FOREIGN KEY (`audited_by`) REFERENCES `person_has_roles`(`person_has_role_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
