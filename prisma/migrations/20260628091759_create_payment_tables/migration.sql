/*
  Warnings:

  - The values [UNPAID,PAID] on the enum `payment_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "payment_types" AS ENUM ('INCOMING', 'OUTGOING');

-- CreateEnum
CREATE TYPE "payment_methods" AS ENUM ('CASH', 'BANK', 'DEBIT_CARD', 'CREDIT_CARD', 'CHECK', 'OTHERS');

-- AlterEnum
BEGIN;
CREATE TYPE "payment_status_new" AS ENUM ('PENDING', 'SUCCESS', 'REFUNDED');
ALTER TYPE "payment_status" RENAME TO "payment_status_old";
ALTER TYPE "payment_status_new" RENAME TO "payment_status";
DROP TYPE "public"."payment_status_old";
COMMIT;

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "issued_date" TIMESTAMPTZ(6) NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "payment_types" NOT NULL,
    "referenceType" "ReferenceType" NOT NULL,
    "referenceId" INTEGER,
    "notes" TEXT,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "paid_date" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_items" (
    "id" SERIAL NOT NULL,
    "payment_date" TIMESTAMPTZ(6) NOT NULL,
    "payment_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" "payment_methods" NOT NULL,
    "status" "payment_status" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_items" ADD CONSTRAINT "payment_items_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
