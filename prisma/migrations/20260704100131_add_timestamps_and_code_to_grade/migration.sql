/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `grades` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `grades` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "grades" ADD COLUMN     "code" VARCHAR(255) NOT NULL,
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "grades_code_key" ON "grades"("code");
