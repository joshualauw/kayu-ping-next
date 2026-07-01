/*
  Warnings:

  - You are about to drop the column `contact_id` on the `processing` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "processing" DROP CONSTRAINT "processing_contact_id_fkey";

-- AlterTable
ALTER TABLE "processing" DROP COLUMN "contact_id";
