-- AlterTable
ALTER TABLE "movement_items" ADD COLUMN     "grade_id" INTEGER;

-- AlterTable
ALTER TABLE "processing_items" ADD COLUMN     "grade_id" INTEGER;

-- AlterTable
ALTER TABLE "purchase_items" ADD COLUMN     "grade_id" INTEGER;

-- AlterTable
ALTER TABLE "sale_items" ADD COLUMN     "grade_id" INTEGER;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processing_items" ADD CONSTRAINT "processing_items_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movement_items" ADD CONSTRAINT "movement_items_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE SET NULL ON UPDATE CASCADE;
