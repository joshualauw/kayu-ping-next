"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactType } from "@/generated/prisma/enums";
import { formatDate } from "@/lib/utils";

interface ContactDetailCardProps {
  contact: {
    id: number;
    name: string;
    phoneNumber: string | null;
    email: string | null;
    address: string | null;
    type: ContactType;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export default function ContactDetailCard({ contact }: ContactDetailCardProps) {
  const router = useRouter();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{contact.name}</CardTitle>
        <CardDescription>Detail of the contact</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Type</span>
            <p className="text-sm font-medium whitespace-pre-wrap">{contact.type || "-"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Phone Number</span>
            <p className="text-sm font-medium">{contact.phoneNumber || "-"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Email Address</span>
            <p className="text-sm font-medium">{contact.email || "-"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Address</span>
            <p className="text-sm font-medium whitespace-pre-wrap">{contact.address || "-"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Notes</span>
            <p className="text-sm font-medium whitespace-pre-wrap">{contact.notes || "-"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Created At</span>
            <p className="text-sm font-medium">{formatDate(contact.createdAt)}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Updated At</span>
            <p className="text-sm font-medium">{formatDate(contact.updatedAt)}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/contacts")} className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Back to List
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/contacts/${contact.id}/edit`}>
              <Pencil className="mr-2 size-4" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
