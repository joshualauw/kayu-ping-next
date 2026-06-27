-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('UNPAID', 'PAID');

-- CreateTable
CREATE TABLE "wood_variants" (
    "id" SERIAL NOT NULL,
    "wood_id" INTEGER NOT NULL,
    "material_id" INTEGER NOT NULL,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "diameter_small" DOUBLE PRECISION,
    "diameter_large" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wood_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" SERIAL NOT NULL,
    "tid" TEXT NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "location_id" INTEGER NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "paymentStatus" "payment_status" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_details" (
    "id" SERIAL NOT NULL,
    "purchase_id" INTEGER NOT NULL,
    "wood_variant_id" INTEGER NOT NULL,
    "price_per_cubic" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "purchases_tid_key" ON "purchases"("tid");

-- AddForeignKey
ALTER TABLE "wood_variants" ADD CONSTRAINT "wood_variants_wood_id_fkey" FOREIGN KEY ("wood_id") REFERENCES "woods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wood_variants" ADD CONSTRAINT "wood_variants_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
