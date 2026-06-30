import { notFound } from "next/navigation";
import SaleUpdateForm from "@/components/admin/sales/update-form";
import saleService from "@/lib/services/sale-service";

interface EditSalePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSalePage({ params }: EditSalePageProps) {
  const { id } = await params;
  const saleId = Number(id);

  if (!Number.isInteger(saleId) || saleId <= 0) {
    notFound();
  }

  const sale = await saleService.getSaleById(saleId);

  if (!sale) {
    notFound();
  }

  return <SaleUpdateForm sale={sale} />;
}
