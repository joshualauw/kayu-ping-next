-- CreateEnum
CREATE TYPE "GradingType" AS ENUM ('BEFORE', 'AFTER');

-- AlterTable
ALTER TABLE "inventories" ADD COLUMN     "grade" TEXT;

-- AlterTable
ALTER TABLE "stock_mutations" ADD COLUMN     "grade" TEXT;

-- CreateTable
CREATE TABLE "gradings" (
    "id" SERIAL NOT NULL,
    "tid" TEXT NOT NULL,
    "grading_date" TIMESTAMPTZ(6) NOT NULL,
    "location_id" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "gradings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grading_items" (
    "id" SERIAL NOT NULL,
    "grading_id" INTEGER NOT NULL,
    "wood_variant_id" INTEGER NOT NULL,
    "type" "GradingType" NOT NULL,
    "grade" TEXT,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "grading_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gradings_tid_key" ON "gradings"("tid");

-- AddForeignKey
ALTER TABLE "gradings" ADD CONSTRAINT "gradings_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_items" ADD CONSTRAINT "grading_items_grading_id_fkey" FOREIGN KEY ("grading_id") REFERENCES "gradings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_items" ADD CONSTRAINT "grading_items_wood_variant_id_fkey" FOREIGN KEY ("wood_variant_id") REFERENCES "wood_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
