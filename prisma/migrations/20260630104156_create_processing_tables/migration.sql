-- CreateEnum
CREATE TYPE "ProcessingType" AS ENUM ('INPUT', 'OUTPUT');

-- CreateTable
CREATE TABLE "processing" (
    "id" SERIAL NOT NULL,
    "tid" TEXT NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "processing_date" TIMESTAMPTZ(6) NOT NULL,
    "location_id" INTEGER NOT NULL,
    "notes" TEXT,
    "total_input_volume" DOUBLE PRECISION NOT NULL,
    "total_output_volume" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "processing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processing_items" (
    "id" SERIAL NOT NULL,
    "processing_id" INTEGER NOT NULL,
    "wood_variant_id" INTEGER NOT NULL,
    "type" "ProcessingType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "processing_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "processing_tid_key" ON "processing"("tid");

-- AddForeignKey
ALTER TABLE "processing" ADD CONSTRAINT "processing_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processing" ADD CONSTRAINT "processing_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processing_items" ADD CONSTRAINT "processing_items_processing_id_fkey" FOREIGN KEY ("processing_id") REFERENCES "processing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processing_items" ADD CONSTRAINT "processing_items_wood_variant_id_fkey" FOREIGN KEY ("wood_variant_id") REFERENCES "wood_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
