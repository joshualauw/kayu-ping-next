/*
  Warnings:

  - Changed the type of `reference_type` on the `fees` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `grading_items` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `processing_items` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `stock_mutations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `reference_type` on the `stock_mutations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "processing_types" AS ENUM ('INPUT', 'OUTPUT');

-- CreateEnum
CREATE TYPE "grading_types" AS ENUM ('BEFORE', 'AFTER');

-- CreateEnum
CREATE TYPE "adjustment_types" AS ENUM ('ADD', 'SUBTRACT');

-- CreateEnum
CREATE TYPE "adjustment_reasons" AS ENUM ('LOST', 'FOUND', 'DAMAGE', 'OTHERS');

-- CreateEnum
CREATE TYPE "mutation_types" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "reference_types" AS ENUM ('PURCHASE', 'SALES', 'ADJUSTMENT', 'PROCESSING', 'MOVEMENT', 'GRADING');

-- AlterTable
ALTER TABLE "fees" DROP COLUMN "reference_type",
ADD COLUMN     "reference_type" "reference_types" NOT NULL;

-- AlterTable
ALTER TABLE "grading_items" DROP COLUMN "type",
ADD COLUMN     "type" "grading_types" NOT NULL;

-- AlterTable
ALTER TABLE "processing_items" DROP COLUMN "type",
ADD COLUMN     "type" "processing_types" NOT NULL;

-- AlterTable
ALTER TABLE "stock_mutations" DROP COLUMN "type",
ADD COLUMN     "type" "mutation_types" NOT NULL,
DROP COLUMN "reference_type",
ADD COLUMN     "reference_type" "reference_types" NOT NULL;

-- DropEnum
DROP TYPE "GradingType";

-- DropEnum
DROP TYPE "MutationType";

-- DropEnum
DROP TYPE "ProcessingType";

-- DropEnum
DROP TYPE "ReferenceType";

-- CreateTable
CREATE TABLE "adjustments" (
    "id" SERIAL NOT NULL,
    "tid" TEXT NOT NULL,
    "adjustment_date" TIMESTAMPTZ(6) NOT NULL,
    "location_id" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adjustment_items" (
    "id" SERIAL NOT NULL,
    "adjustment_id" INTEGER NOT NULL,
    "grade_id" INTEGER,
    "wood_variant_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" "adjustment_types" NOT NULL,
    "reason" "adjustment_reasons" NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "adjustment_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "adjustments_tid_key" ON "adjustments"("tid");

-- AddForeignKey
ALTER TABLE "adjustments" ADD CONSTRAINT "adjustments_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adjustment_items" ADD CONSTRAINT "adjustment_items_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adjustment_items" ADD CONSTRAINT "adjustment_items_adjustment_id_fkey" FOREIGN KEY ("adjustment_id") REFERENCES "adjustments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adjustment_items" ADD CONSTRAINT "adjustment_items_wood_variant_id_fkey" FOREIGN KEY ("wood_variant_id") REFERENCES "wood_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
