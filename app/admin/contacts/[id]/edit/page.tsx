import { notFound } from "next/navigation";

import ContactUpdateForm from "@/components/admin/contacts/update-form";
import { prisma } from "@/lib/db/prisma";

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

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      email: true,
      address: true,
      type: true,
      notes: true,
    },
  });

  if (!contact) {
    notFound();
  }

  return <ContactUpdateForm contact={contact} />;
}
