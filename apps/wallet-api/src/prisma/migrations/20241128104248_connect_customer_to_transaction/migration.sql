-- DropForeignKey
ALTER TABLE "cybrid_transactions" DROP CONSTRAINT "fk_CybridTransaction_CybridAccount1";

-- AddForeignKey
ALTER TABLE "cybrid_transactions" ADD CONSTRAINT "fk_CybridTransaction_CybridAccount1" FOREIGN KEY ("initiated_by") REFERENCES "cybrid_customers"("cybrid_customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
