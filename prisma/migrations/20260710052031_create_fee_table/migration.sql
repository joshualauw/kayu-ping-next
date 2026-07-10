/*
  Warnings:

  - You are about to drop the column `totalPrice` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `totalVolume` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `totalVolume` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `referenceId` on the `stock_mutations` table. All the data in the column will be lost.
  - You are about to drop the column `referenceType` on the `stock_mutations` table. All the data in the column will be lost.
  - Added the required column `total_price` to the `purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_volume` to the `purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_price` to the `sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_volume` to the `sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference_type` to the `stock_mutations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "totalPrice",
DROP COLUMN "totalVolume",
ADD COLUMN     "total_price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "total_volume" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "sales" DROP COLUMN "totalPrice",
DROP COLUMN "totalVolume",
ADD COLUMN     "total_price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "total_volume" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "stock_mutations" DROP COLUMN "referenceId",
DROP COLUMN "referenceType",
ADD COLUMN     "reference_id" INTEGER,
ADD COLUMN     "reference_type" "ReferenceType" NOT NULL;

-- CreateTable
CREATE TABLE "fees" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "reference_id" INTEGER NOT NULL,
    "reference_type" "ReferenceType" NOT NULL,

    CONSTRAINT "fees_pkey" PRIMARY KEY ("id")
);
