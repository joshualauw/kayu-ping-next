import { notFound } from "next/navigation";

import ContactUpdateForm from "@/components/admin/contacts/update-form";
import contactService from "@/lib/services/contact-service";

interface EditContactPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditContactPage({ params }: EditContactPageProps) {
  const { id } = await params;
  const contactId = Number(id);

  if (!Number.isInteger(contactId) || contactId <= 0) {
    notFound();
  }

  const contact = await contactService.getContactById(contactId);

  if (!contact) {
    notFound();
  }

  return <ContactUpdateForm contact={contact} />;
}
