/*
  Warnings:

  - Made the column `reference_id` on table `stock_mutations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "stock_mutations" ALTER COLUMN "reference_id" SET NOT NULL;
