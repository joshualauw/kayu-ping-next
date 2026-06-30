/*
  Warnings:

  - Added the required column `supplier_id` to the `purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_id` to the `sales` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "supplier_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "customer_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
