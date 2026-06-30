/*
  Warnings:

  - You are about to drop the column `contact_id` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `purchases` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_contact_id_fkey";

-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "contact_id",
DROP COLUMN "paymentStatus";
