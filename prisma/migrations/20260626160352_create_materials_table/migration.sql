-- CreateEnum
CREATE TYPE "Measurement" AS ENUM ('CYLINDER', 'CUBE');

-- CreateTable
CREATE TABLE "materials" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "measurement" "Measurement" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);
