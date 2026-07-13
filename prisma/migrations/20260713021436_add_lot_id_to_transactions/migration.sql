/*
  Warnings:

  - Added the required column `lot_id` to the `adjustment_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lot_id` to the `grading_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lot_id` to the `inventories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lot_id` to the `movement_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lot_id` to the `processing_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lot_id` to the `purchase_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lot_id` to the `sale_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lot_id` to the `stock_mutations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "adjustment_items" ADD COLUMN     "lot_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "grading_items" ADD COLUMN     "lot_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "inventories" ADD COLUMN     "lot_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "movement_items" ADD COLUMN     "lot_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "processing_items" ADD COLUMN     "lot_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "purchase_items" ADD COLUMN     "lot_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "sale_items" ADD COLUMN     "lot_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "stock_mutations" ADD COLUMN     "lot_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "lots" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lots_code_key" ON "lots"("code");

-- AddForeignKey
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_mutations" ADD CONSTRAINT "stock_mutations_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processing_items" ADD CONSTRAINT "processing_items_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movement_items" ADD CONSTRAINT "movement_items_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_items" ADD CONSTRAINT "grading_items_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adjustment_items" ADD CONSTRAINT "adjustment_items_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
