/*
  Warnings:

  - You are about to drop the column `grade` on the `grading_items` table. All the data in the column will be lost.
  - You are about to drop the column `grade` on the `inventories` table. All the data in the column will be lost.
  - You are about to drop the column `grade` on the `stock_mutations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "grading_items" DROP COLUMN "grade",
ADD COLUMN     "grade_id" INTEGER;

-- AlterTable
ALTER TABLE "inventories" DROP COLUMN "grade",
ADD COLUMN     "grade_id" INTEGER;

-- AlterTable
ALTER TABLE "stock_mutations" DROP COLUMN "grade",
ADD COLUMN     "grade_id" INTEGER;

-- CreateTable
CREATE TABLE "grades" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_mutations" ADD CONSTRAINT "stock_mutations_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_items" ADD CONSTRAINT "grading_items_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE SET NULL ON UPDATE CASCADE;
