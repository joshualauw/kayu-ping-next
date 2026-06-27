/*
  Warnings:

  - Changed the type of `type` on the `contacts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `locations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `measurement` on the `materials` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "contact_types" AS ENUM ('CUSTOMER', 'SUPPLIER', 'TRUCKER', 'OTHERS');

-- CreateEnum
CREATE TYPE "location_types" AS ENUM ('WAREHOUSE', 'PORT', 'MILL', 'OTHERS');

-- CreateEnum
CREATE TYPE "measurements" AS ENUM ('CYLINDER', 'CUBE');

-- AlterTable
ALTER TABLE "contacts" DROP COLUMN "type",
ADD COLUMN     "type" "contact_types" NOT NULL;

-- AlterTable
ALTER TABLE "locations" DROP COLUMN "type",
ADD COLUMN     "type" "location_types" NOT NULL;

-- AlterTable
ALTER TABLE "materials" DROP COLUMN "measurement",
ADD COLUMN     "measurement" "measurements" NOT NULL;

-- DropEnum
DROP TYPE "ContactType";

-- DropEnum
DROP TYPE "LocationType";

-- DropEnum
DROP TYPE "Measurement";
