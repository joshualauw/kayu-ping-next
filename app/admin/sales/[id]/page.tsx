import { notFound } from "next/navigation";
import SaleDetailCard from "@/components/admin/sales/detail-card";
import saleService from "@/lib/services/sale-service";

interface SaleDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SaleDetailPage({ params }: SaleDetailPageProps) {
  const { id } = await params;
  const saleId = Number(id);

  if (!Number.isInteger(saleId) || saleId <= 0) {
    notFound();
  }

  const sale = await saleService.getSaleById(saleId);

  if (!sale) {
    notFound();
  }

  return <SaleDetailCard sale={sale} />;
}
