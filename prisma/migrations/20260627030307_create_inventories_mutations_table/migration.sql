-- CreateEnum
CREATE TYPE "MutationType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "ReferenceType" AS ENUM ('PURCHASE', 'SALES', 'ADJUSTMENT', 'PROCESSING', 'MOVEMENT');

-- CreateTable
CREATE TABLE "inventories" (
    "id" SERIAL NOT NULL,
    "wood_variant_id" INTEGER NOT NULL,
    "location_id" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_mutations" (
    "id" SERIAL NOT NULL,
    "mutation_date" TIMESTAMP(3) NOT NULL,
    "wood_variant_id" INTEGER NOT NULL,
    "location_id" INTEGER NOT NULL,
    "type" "MutationType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "referenceType" "ReferenceType" NOT NULL,
    "referenceId" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_mutations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_wood_variant_id_fkey" FOREIGN KEY ("wood_variant_id") REFERENCES "wood_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_mutations" ADD CONSTRAINT "stock_mutations_wood_variant_id_fkey" FOREIGN KEY ("wood_variant_id") REFERENCES "wood_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_mutations" ADD CONSTRAINT "stock_mutations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_details" ADD CONSTRAINT "purchase_details_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_details" ADD CONSTRAINT "purchase_details_wood_variant_id_fkey" FOREIGN KEY ("wood_variant_id") REFERENCES "wood_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
