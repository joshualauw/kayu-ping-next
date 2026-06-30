/*
  Warnings:

  - You are about to drop the `purchase_fees` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "purchase_fees" DROP CONSTRAINT "purchase_fees_purchase_id_fkey";

-- DropTable
DROP TABLE "purchase_fees";

-- CreateTable
CREATE TABLE "fees" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reference_type" "ReferenceType" NOT NULL,
    "reference_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fees_pkey" PRIMARY KEY ("id")
);
