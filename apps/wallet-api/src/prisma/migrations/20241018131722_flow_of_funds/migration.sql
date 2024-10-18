-- CreateEnum
CREATE TYPE "supported_local_currency" AS ENUM ('XAF', 'NIARA');

-- CreateEnum
CREATE TYPE "cybrid_supported_country" AS ENUM ('usa', 'canada');

-- CreateEnum
CREATE TYPE "cybrid_supported_currency" AS ENUM ('usd', 'cad');

-- CreateEnum
CREATE TYPE "local_customer_verification_status" AS ENUM ('unverified', 'pending', 'verified');

-- CreateEnum
CREATE TYPE "cybrid_account_type" AS ENUM ('external', 'fiat');

-- CreateEnum
CREATE TYPE "preferred_language" AS ENUM ('en-US', 'fr');

-- CreateEnum
CREATE TYPE "PersonGender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "cybrid_transaction_type" AS ENUM ('remittance', 'convert', 'funding', 'withdrawal', 'account', 'xaf');

-- CreateEnum
CREATE TYPE "cybrid_account_status" AS ENUM ('storing', 'unverified', 'verified', 'rejected', 'frozen');

-- CreateEnum
CREATE TYPE "cybrid_external_acccount_status" AS ENUM ('storing', 'completed', 'unverified', 'failed', 'refresh_required', 'deleting', 'deleted');

-- CreateEnum
CREATE TYPE "identity_verification_status" AS ENUM ('storing', 'waiting', 'pending', 'reviewing', 'expired', 'completed');

-- CreateEnum
CREATE TYPE "cybrid_transfer_status" AS ENUM ('storing', 'reviewing', 'pending', 'completed', 'failed');

-- CreateTable
CREATE TABLE "bank_payout_info" (
    "bank_payout_info_id" VARCHAR(36) NOT NULL,
    "holder_name" VARCHAR(45) NOT NULL,
    "bank_name" VARCHAR(45) NOT NULL,
    "iban_number" VARCHAR(45) NOT NULL,

    CONSTRAINT "bank_payout_info_pkey" PRIMARY KEY ("bank_payout_info_id")
);

-- CreateTable
CREATE TABLE "customer_audits" (
    "cybrid_customer_audit_id" VARCHAR(36) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "cybrid_customer_id" VARCHAR(36) NOT NULL,
    "audited_by" VARCHAR(36) NOT NULL,

    CONSTRAINT "customer_audits_pkey" PRIMARY KEY ("cybrid_customer_audit_id")
);

-- CreateTable
CREATE TABLE "cybrid_accounts" (
    "cybrid_account_id" VARCHAR(36) NOT NULL,
    "cybrid_account_guid" VARCHAR(45) NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "identity_verification_guid" VARCHAR(45),
    "verification_status" "identity_verification_status",
    "currency" "cybrid_supported_currency" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "cybrid_customer_id" TEXT NOT NULL,

    CONSTRAINT "cybrid_accounts_pkey" PRIMARY KEY ("cybrid_account_id")
);

-- CreateTable
CREATE TABLE "cybrid_customers" (
    "cybrid_customer_id" VARCHAR(36) NOT NULL,
    "cybrid_customer_guid" VARCHAR(45) NOT NULL,
    "country" "cybrid_supported_country",
    "status" "cybrid_account_status" NOT NULL,
    "identity_verification_guid" VARCHAR(45),
    "verification_status" "identity_verification_status",
    "person_id" TEXT NOT NULL,

    CONSTRAINT "cybrid_customers_pkey" PRIMARY KEY ("cybrid_customer_id")
);

-- CreateTable
CREATE TABLE "cybrid_external_accounts" (
    "cybrid_external_account_id" VARCHAR(36) NOT NULL,
    "cybrid_external_account_guid" VARCHAR(45) NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "status" "cybrid_external_acccount_status" NOT NULL,
    "identity_verification_guid" VARCHAR(45),
    "verification_status" "identity_verification_status",
    "cybrid_customer_id" VARCHAR(36) NOT NULL,

    CONSTRAINT "cybrid_external_accounts_pkey" PRIMARY KEY ("cybrid_external_account_id")
);

-- CreateTable
CREATE TABLE "cybrid_transactions" (
    "cybrid_transaction_id" VARCHAR(36) NOT NULL,
    "cybrid_transaction_guid" VARCHAR(45) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "initial_currency" "cybrid_supported_currency" NOT NULL,
    "converstion_rate" DOUBLE PRECISION,
    "fees" DOUBLE PRECISION NOT NULL,
    "transaction_id" VARCHAR(45) NOT NULL,
    "transaction_type" "cybrid_transaction_type" NOT NULL,
    "status" "cybrid_transfer_status" NOT NULL,
    "initiated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settled_at" TIMESTAMP,
    "local_customer_id" TEXT,
    "payout_info_id" TEXT,
    "bank_info_id" TEXT,
    "cybrid_account_id" TEXT,
    "cybrid_external_account_id" TEXT,
    "initiated_by" TEXT NOT NULL,

    CONSTRAINT "cybrid_transactions_pkey" PRIMARY KEY ("cybrid_transaction_id")
);

-- CreateTable
CREATE TABLE "local_customers" (
    "local_customer_id" VARCHAR(36) NOT NULL,
    "currency" "supported_local_currency",
    "account_number" VARCHAR(45) NOT NULL,
    "verification_status" "local_customer_verification_status",
    "balance" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "person_id" TEXT NOT NULL,

    CONSTRAINT "local_customers_pkey" PRIMARY KEY ("local_customer_id")
);

-- CreateTable
CREATE TABLE "local_transactions" (
    "local_transaction_id" VARCHAR(36) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "initiated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "sent_by" TEXT NOT NULL,
    "received_by" TEXT NOT NULL,
    "initiated_by" TEXT NOT NULL,

    CONSTRAINT "local_transactions_pkey" PRIMARY KEY ("local_transaction_id")
);

-- CreateTable
CREATE TABLE "logs" (
    "log_id" VARCHAR(36) NOT NULL,
    "login_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logout_at" TIMESTAMP,
    "method" VARCHAR(45) NOT NULL DEFAULT 'local',
    "refresh_token" VARCHAR(255) NOT NULL,
    "person_has_role_id" TEXT NOT NULL,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "otps" (
    "otp_id" VARCHAR(36) NOT NULL,
    "code" VARCHAR(45) NOT NULL,
    "usage" VARCHAR(45) NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "person_has_role_id" TEXT NOT NULL,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("otp_id")
);

-- CreateTable
CREATE TABLE "persons" (
    "person_id" VARCHAR(36) NOT NULL,
    "gender" "PersonGender" NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "first_name" VARCHAR(45) NOT NULL,
    "last_name" VARCHAR(45) NOT NULL,
    "email" VARCHAR(45) NOT NULL,
    "username" VARCHAR(45) NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_number" VARCHAR(45) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "preferred_language" "preferred_language" NOT NULL DEFAULT 'en-US',

    CONSTRAINT "persons_pkey" PRIMARY KEY ("person_id")
);

-- CreateTable
CREATE TABLE "person_audits" (
    "person_audit_id" TEXT NOT NULL,
    "gender" "PersonGender" NOT NULL,
    "preferred_language" "preferred_language" NOT NULL DEFAULT 'en-US',
    "birthdate" TIMESTAMP(3) NOT NULL,
    "first_name" VARCHAR(45) NOT NULL,
    "last_name" VARCHAR(45) NOT NULL,
    "email" VARCHAR(45) NOT NULL,
    "username" VARCHAR(45) NOT NULL,
    "phone_number" VARCHAR(45) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "is_verified" BOOLEAN NOT NULL,
    "audited_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "person_id" TEXT NOT NULL,
    "audited_by" TEXT NOT NULL,

    CONSTRAINT "person_audits_pkey" PRIMARY KEY ("person_audit_id")
);

-- CreateTable
CREATE TABLE "person_has_roles" (
    "person_has_role_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "person_id" VARCHAR(36) NOT NULL,
    "role_id" VARCHAR(36) NOT NULL,
    "created_by" VARCHAR(36),

    CONSTRAINT "person_has_roles_pkey" PRIMARY KEY ("person_has_role_id")
);

-- CreateTable
CREATE TABLE "person_has_role_audits" (
    "person_has_role_audit_id" VARCHAR(36) NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "audited_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "person_has_role_id" TEXT NOT NULL,
    "audited_by" TEXT NOT NULL,

    CONSTRAINT "person_has_role_audits_pkey" PRIMARY KEY ("person_has_role_audit_id")
);

-- CreateTable
CREATE TABLE "receiver_payout_info" (
    "receiver_payout_info_id" VARCHAR(36) NOT NULL,
    "fullname" VARCHAR(45) NOT NULL,
    "phone_number" VARCHAR(45) NOT NULL,
    "national_id_number" VARCHAR(45),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receiver_payout_info_pkey" PRIMARY KEY ("receiver_payout_info_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "role_id" VARCHAR(36) NOT NULL,
    "title" VARCHAR(45) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "subdomain" VARCHAR(45),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "role_audits" (
    "role_audit_id" VARCHAR(36) NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "title" VARCHAR(45) NOT NULL,
    "audited_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role_id" TEXT NOT NULL,
    "audited_by" TEXT NOT NULL,

    CONSTRAINT "role_audits_pkey" PRIMARY KEY ("role_audit_id")
);

-- CreateTable
CREATE TABLE "stripe_transactions" (
    "stripe_transaction_id" VARCHAR(36) NOT NULL,
    "amount_sent" DOUBLE PRECISION NOT NULL,
    "fees" DOUBLE PRECISION NOT NULL,
    "converstion_rate" DOUBLE PRECISION NOT NULL,
    "transaction_id" VARCHAR(45) NOT NULL,
    "stripe_transaction_guid" VARCHAR(45) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settled_at" TIMESTAMP,
    "initial_currency" VARCHAR(36) NOT NULL,
    "created_by" VARCHAR(36) NOT NULL,
    "local_customer_id" VARCHAR(36),
    "receiver_payout_info_id" VARCHAR(36),
    "bank_payout_info_id" VARCHAR(36),

    CONSTRAINT "stripe_transactions_pkey" PRIMARY KEY ("stripe_transaction_id")
);

-- CreateTable
CREATE TABLE "supported_currencies" (
    "supported_currency_id" VARCHAR(36) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "xaf_rate" DOUBLE PRECISION NOT NULL,
    "last_updated" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "supported_currencies_pkey" PRIMARY KEY ("supported_currency_id")
);

-- CreateTable
CREATE TABLE "supported_currency_audits" (
    "supported_currency_audit_id" VARCHAR(36) NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "audited_at" TIMESTAMP NOT NULL,
    "supported_currency_id" TEXT NOT NULL,
    "audited_by" TEXT NOT NULL,

    CONSTRAINT "supported_currency_audits_pkey" PRIMARY KEY ("supported_currency_audit_id")
);

-- CreateIndex
CREATE INDEX "fk_CustomerAudit_Customer1_idx" ON "customer_audits"("cybrid_customer_id");

-- CreateIndex
CREATE INDEX "fk_CustomerAudit_PersonHasRole1_idx" ON "customer_audits"("audited_by");

-- CreateIndex
CREATE UNIQUE INDEX "cybrid_accounts_cybrid_account_guid_key" ON "cybrid_accounts"("cybrid_account_guid");

-- CreateIndex
CREATE INDEX "fk_CybridAccount_CybridCustomer1_idx" ON "cybrid_accounts"("cybrid_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "cybrid_customers_cybrid_customer_guid_key" ON "cybrid_customers"("cybrid_customer_guid");

-- CreateIndex
CREATE INDEX "fk_Customer_Person1_idx" ON "cybrid_customers"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "cybrid_external_accounts_cybrid_external_account_guid_key" ON "cybrid_external_accounts"("cybrid_external_account_guid");

-- CreateIndex
CREATE INDEX "fk_ExternalAccount_CybridCustomer1_idx" ON "cybrid_external_accounts"("cybrid_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "cybrid_transactions_cybrid_transaction_guid_key" ON "cybrid_transactions"("cybrid_transaction_guid");

-- CreateIndex
CREATE INDEX "fk_CybridTransaction_BankInfo1_idx" ON "cybrid_transactions"("bank_info_id");

-- CreateIndex
CREATE INDEX "fk_CybridTransaction_CybridAccount1_idx" ON "cybrid_transactions"("initiated_by");

-- CreateIndex
CREATE INDEX "fk_CybridTransaction_CybridAccount2_idx" ON "cybrid_transactions"("cybrid_account_id");

-- CreateIndex
CREATE INDEX "fk_CybridTransaction_CybridExternalAccount1_idx" ON "cybrid_transactions"("cybrid_external_account_id");

-- CreateIndex
CREATE INDEX "fk_CybridTransaction_LocalCustomer1_idx" ON "cybrid_transactions"("local_customer_id");

-- CreateIndex
CREATE INDEX "fk_CybridTransaction_PayoutInfo1_idx" ON "cybrid_transactions"("payout_info_id");

-- CreateIndex
CREATE INDEX "fk_LocalCustomer_Person1_idx" ON "local_customers"("person_id");

-- CreateIndex
CREATE INDEX "fk_LocalTransaction_LocalCustomer1_idx" ON "local_transactions"("sent_by");

-- CreateIndex
CREATE INDEX "fk_LocalTransaction_LocalCustomer2_idx" ON "local_transactions"("received_by");

-- CreateIndex
CREATE INDEX "fk_LocalTransaction_PersonHasRole1_idx" ON "local_transactions"("initiated_by");

-- CreateIndex
CREATE INDEX "fk_Log_Person1_idx" ON "logs"("person_has_role_id");

-- CreateIndex
CREATE INDEX "fk_OTP_PersonHasRole1_idx" ON "otps"("person_has_role_id");

-- CreateIndex
CREATE UNIQUE INDEX "persons_email_key" ON "persons"("email");

-- CreateIndex
CREATE UNIQUE INDEX "persons_username_key" ON "persons"("username");

-- CreateIndex
CREATE INDEX "fk_PersonAudit_Person2_idx" ON "person_audits"("person_id");

-- CreateIndex
CREATE INDEX "fk_PersonAudit_PersonHasRole1_idx" ON "person_audits"("audited_by");

-- CreateIndex
CREATE INDEX "fk_Login_Person1_idx" ON "person_has_roles"("person_id");

-- CreateIndex
CREATE INDEX "fk_Login_Role1_idx" ON "person_has_roles"("role_id");

-- CreateIndex
CREATE INDEX "fk_PersonHasRole_PersonHasRole1_idx" ON "person_has_roles"("created_by");

-- CreateIndex
CREATE INDEX "fk_PersonHasRoleAudit_PersonHasRole1_idx" ON "person_has_role_audits"("person_has_role_id");

-- CreateIndex
CREATE INDEX "fk_PersonHasRoleAudit_PersonHasRole2_idx" ON "person_has_role_audits"("audited_by");

-- CreateIndex
CREATE UNIQUE INDEX "roles_title_key" ON "roles"("title");

-- CreateIndex
CREATE INDEX "fk_Role_Person1_idx" ON "roles"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "roles_title_subdomain_key" ON "roles"("title", "subdomain");

-- CreateIndex
CREATE INDEX "fk_RoleAudit_Person1_idx" ON "role_audits"("audited_by");

-- CreateIndex
CREATE INDEX "fk_RoleAudit_Role1_idx" ON "role_audits"("role_id");

-- CreateIndex
CREATE INDEX "fk_StripeTransaction_BankPayoutInfo1_idx" ON "stripe_transactions"("bank_payout_info_id");

-- CreateIndex
CREATE INDEX "fk_StripeTransaction_LocalCustomer1_idx" ON "stripe_transactions"("local_customer_id");

-- CreateIndex
CREATE INDEX "fk_StripeTransaction_PersonHasRole1_idx" ON "stripe_transactions"("created_by");

-- CreateIndex
CREATE INDEX "fk_StripeTransaction_ReceiverPayoutInfo1_idx" ON "stripe_transactions"("receiver_payout_info_id");

-- CreateIndex
CREATE INDEX "fk_StripeTransaction_SupportedCurrency1_idx" ON "stripe_transactions"("initial_currency");

-- CreateIndex
CREATE INDEX "fk_SupportedCurrency_PersonHasRole1_idx" ON "supported_currencies"("created_by");

-- CreateIndex
CREATE INDEX "fk_SupportedCurrencyAudit_SupportedCurrency1_idx" ON "supported_currency_audits"("supported_currency_id");

-- CreateIndex
CREATE INDEX "fk_SupportedCurrencyAudit_PersonHasRole1_idx" ON "supported_currency_audits"("audited_by");

-- AddForeignKey
ALTER TABLE "customer_audits" ADD CONSTRAINT "fk_CustomerAudit_Customer1" FOREIGN KEY ("cybrid_customer_id") REFERENCES "cybrid_customers"("cybrid_customer_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customer_audits" ADD CONSTRAINT "fk_CustomerAudit_PersonHasRole1" FOREIGN KEY ("audited_by") REFERENCES "person_has_roles"("person_has_role_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cybrid_accounts" ADD CONSTRAINT "fk_CybridAccount_CybridCustomer1" FOREIGN KEY ("cybrid_customer_id") REFERENCES "cybrid_customers"("cybrid_customer_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cybrid_customers" ADD CONSTRAINT "fk_Customer_Person1" FOREIGN KEY ("person_id") REFERENCES "persons"("person_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cybrid_external_accounts" ADD CONSTRAINT "fk_ExternalAccount_CybridCustomer1" FOREIGN KEY ("cybrid_customer_id") REFERENCES "cybrid_customers"("cybrid_customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cybrid_transactions" ADD CONSTRAINT "fk_CybridTransaction_LocalCustomer1" FOREIGN KEY ("local_customer_id") REFERENCES "local_customers"("local_customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cybrid_transactions" ADD CONSTRAINT "fk_CybridTransaction_PayoutInfo1" FOREIGN KEY ("payout_info_id") REFERENCES "receiver_payout_info"("receiver_payout_info_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cybrid_transactions" ADD CONSTRAINT "fk_CybridTransaction_BankInfo1" FOREIGN KEY ("bank_info_id") REFERENCES "bank_payout_info"("bank_payout_info_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cybrid_transactions" ADD CONSTRAINT "fk_CybridTransaction_CybridAccount2" FOREIGN KEY ("cybrid_account_id") REFERENCES "cybrid_accounts"("cybrid_account_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cybrid_transactions" ADD CONSTRAINT "fk_CybridTransaction_CybridExternalAccount1" FOREIGN KEY ("cybrid_external_account_id") REFERENCES "cybrid_external_accounts"("cybrid_external_account_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cybrid_transactions" ADD CONSTRAINT "fk_CybridTransaction_CybridAccount1" FOREIGN KEY ("initiated_by") REFERENCES "cybrid_accounts"("cybrid_account_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "local_customers" ADD CONSTRAINT "fk_LocalCustomer_Person1" FOREIGN KEY ("person_id") REFERENCES "persons"("person_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "local_transactions" ADD CONSTRAINT "fk_LocalTransaction_LocalCustomer1" FOREIGN KEY ("sent_by") REFERENCES "local_customers"("local_customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "local_transactions" ADD CONSTRAINT "fk_LocalTransaction_LocalCustomer2" FOREIGN KEY ("received_by") REFERENCES "local_customers"("local_customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "local_transactions" ADD CONSTRAINT "fk_LocalTransaction_PersonHasRole1" FOREIGN KEY ("initiated_by") REFERENCES "person_has_roles"("person_has_role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "fk_Log_Person1" FOREIGN KEY ("person_has_role_id") REFERENCES "person_has_roles"("person_has_role_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "fk_OTP_PersonHasRole1" FOREIGN KEY ("person_has_role_id") REFERENCES "person_has_roles"("person_has_role_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "person_audits" ADD CONSTRAINT "fk_PersonAudit_Person2" FOREIGN KEY ("person_id") REFERENCES "persons"("person_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "person_audits" ADD CONSTRAINT "fk_PersonAudit_PersonHasRole1" FOREIGN KEY ("audited_by") REFERENCES "person_has_roles"("person_has_role_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "person_has_roles" ADD CONSTRAINT "fk_PersonHasRole_Person1" FOREIGN KEY ("person_id") REFERENCES "persons"("person_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "person_has_roles" ADD CONSTRAINT "fk_PersonHasRole_Role1" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "person_has_roles" ADD CONSTRAINT "fk_PersonHasRole_PersonHasRole1" FOREIGN KEY ("created_by") REFERENCES "person_has_roles"("person_has_role_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "person_has_role_audits" ADD CONSTRAINT "fk_PersonHasRoleAudit_PersonHasRole1" FOREIGN KEY ("person_has_role_id") REFERENCES "person_has_roles"("person_has_role_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "person_has_role_audits" ADD CONSTRAINT "fk_PersonHasRoleAudit_PersonHasRole2" FOREIGN KEY ("audited_by") REFERENCES "person_has_roles"("person_has_role_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "fk_Role_Person1" FOREIGN KEY ("created_by") REFERENCES "persons"("person_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role_audits" ADD CONSTRAINT "fk_RoleAudit_Role1" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role_audits" ADD CONSTRAINT "fk_RoleAudit_Person1" FOREIGN KEY ("audited_by") REFERENCES "persons"("person_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stripe_transactions" ADD CONSTRAINT "fk_StripeTransaction_SupportedCurrency1" FOREIGN KEY ("initial_currency") REFERENCES "supported_currencies"("supported_currency_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stripe_transactions" ADD CONSTRAINT "fk_StripeTransaction_PersonHasRole1" FOREIGN KEY ("created_by") REFERENCES "person_has_roles"("person_has_role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stripe_transactions" ADD CONSTRAINT "fk_StripeTransaction_LocalCustomer1" FOREIGN KEY ("local_customer_id") REFERENCES "local_customers"("local_customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stripe_transactions" ADD CONSTRAINT "fk_StripeTransaction_ReceiverPayoutInfo1" FOREIGN KEY ("receiver_payout_info_id") REFERENCES "receiver_payout_info"("receiver_payout_info_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stripe_transactions" ADD CONSTRAINT "fk_StripeTransaction_BankPayoutInfo1" FOREIGN KEY ("bank_payout_info_id") REFERENCES "bank_payout_info"("bank_payout_info_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supported_currencies" ADD CONSTRAINT "fk_SupportedCurrency_PersonHasRole1" FOREIGN KEY ("created_by") REFERENCES "person_has_roles"("person_has_role_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supported_currency_audits" ADD CONSTRAINT "fk_SupportedCurrencyAudit_SupportedCurrency1" FOREIGN KEY ("supported_currency_id") REFERENCES "supported_currencies"("supported_currency_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supported_currency_audits" ADD CONSTRAINT "fk_SupportedCurrency_PersonHasRole10" FOREIGN KEY ("audited_by") REFERENCES "person_has_roles"("person_has_role_id") ON DELETE CASCADE ON UPDATE NO ACTION;
