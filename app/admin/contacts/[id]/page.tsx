import { notFound } from "next/navigation";

import ContactDetailCard from "@/components/admin/contacts/detail-card";
import contactService from "@/lib/services/contact-service";

interface ContactDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { id } = await params;
  const contactId = Number(id);

  if (!Number.isInteger(contactId) || contactId <= 0) {
    notFound();
  }

  const contact = await contactService.getContactById(contactId);

  if (!contact) {
    notFound();
  }

  return <ContactDetailCard contact={contact} />;
}
