/*
  Warnings:

  - You are about to drop the column `is_paid` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `issued_date` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `paid_date` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `referenceId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `referenceType` on the `payments` table. All the data in the column will be lost.
  - You are about to alter the column `quantity` on the `purchase_items` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the `payment_items` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `method` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_date` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "payment_items" DROP CONSTRAINT "payment_items_payment_id_fkey";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "is_paid",
DROP COLUMN "issued_date",
DROP COLUMN "paid_date",
DROP COLUMN "referenceId",
DROP COLUMN "referenceType",
ADD COLUMN     "method" "payment_methods" NOT NULL,
ADD COLUMN     "payment_date" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "purchase_items" ALTER COLUMN "quantity" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "payment_items";

-- DropEnum
DROP TYPE "payment_status";

-- CreateTable
CREATE TABLE "purchase_fees" (
    "id" SERIAL NOT NULL,
    "purchase_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" SERIAL NOT NULL,
    "payment_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "referenceType" "ReferenceType" NOT NULL,
    "referenceId" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "purchase_fees" ADD CONSTRAINT "purchase_fees_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
