/*
  Warnings:

  - You are about to drop the `purchase_details` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "purchase_details" DROP CONSTRAINT "purchase_details_purchase_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_details" DROP CONSTRAINT "purchase_details_wood_variant_id_fkey";

-- DropTable
DROP TABLE "purchase_details";

-- CreateTable
CREATE TABLE "purchase_items" (
    "id" SERIAL NOT NULL,
    "purchase_id" INTEGER NOT NULL,
    "wood_variant_id" INTEGER NOT NULL,
    "price_per_cubic" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_wood_variant_id_fkey" FOREIGN KEY ("wood_variant_id") REFERENCES "wood_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
