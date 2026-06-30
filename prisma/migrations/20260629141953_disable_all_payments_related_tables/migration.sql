/*
  Warnings:

  - You are about to drop the column `isPaid` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `isPaid` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the `fees` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment_allocations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "payment_allocations" DROP CONSTRAINT "payment_allocations_payment_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_contact_id_fkey";

-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "isPaid";

-- AlterTable
ALTER TABLE "sales" DROP COLUMN "isPaid";

-- DropTable
DROP TABLE "fees";

-- DropTable
DROP TABLE "payment_allocations";

-- DropTable
DROP TABLE "payments";

-- DropEnum
DROP TYPE "payment_methods";

-- DropEnum
DROP TYPE "payment_types";
