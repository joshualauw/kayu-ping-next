import { prisma } from "@/lib/db/prisma";
import { Contact } from "@/generated/prisma/client";
import { ContactWhereInput } from "@/generated/prisma/models";
import { TableQuery, TableResponse } from "@/lib/schemas/table-query";
import { CreateContactSchema } from "@/lib/schemas/contacts/create-contact";
import { getOrderBySort } from "@/lib/helpers/api";

export type ContactListItem = Omit<Contact, "address" | "notes">;
export type ContactForSelect = Pick<Contact, "id" | "name" | "type">;

class ContactService {
  async getAllContacts(params: TableQuery): Promise<TableResponse<ContactListItem>> {
    const { page, size, search, sortBy, sortOrder } = params;
    const where: ContactWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const allowedSortFields = ["name", "type", "phoneNumber", "email", "createdAt", "updatedAt"];
    const orderBy = getOrderBySort(sortBy, sortOrder, allowedSortFields);

    const [count, items] = await Promise.all([
      prisma.contact.count({ where }),
      prisma.contact.findMany({
        where,
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          email: true,
          type: true,
          createdAt: true,
          updatedAt: true,
        },
        skip: page * size,
        take: size,
        orderBy,
      }),
    ]);

    return { items, count };
  }

  async getContactsForSelect(): Promise<ContactForSelect[]> {
    return prisma.contact.findMany({
      select: {
        id: true,
        name: true,
        type: true,
      },
    });
  }

  async getContactById(id: number): Promise<Contact | null> {
    return prisma.contact.findUnique({
      where: { id },
    });
  }

  async checkPhoneExists(phoneNumber: string, excludeId?: number): Promise<boolean> {
    if (excludeId !== undefined) {
      const existing = await prisma.contact.findFirst({
        where: {
          phoneNumber,
          NOT: { id: excludeId },
        },
      });
      return !!existing;
    } else {
      const existing = await prisma.contact.findUnique({
        where: { phoneNumber },
      });
      return !!existing;
    }
  }

  async checkEmailExists(email: string, excludeId?: number): Promise<boolean> {
    if (excludeId !== undefined) {
      const existing = await prisma.contact.findFirst({
        where: {
          email,
          NOT: { id: excludeId },
        },
      });
      return !!existing;
    } else {
      const existing = await prisma.contact.findUnique({
        where: { email },
      });
      return !!existing;
    }
  }

  async createContact(data: CreateContactSchema): Promise<Contact> {
    if (data.phoneNumber) {
      const phoneExist = await this.checkPhoneExists(data.phoneNumber);
      if (phoneExist) throw new Error("Phone number already exists");
    }

    if (data.email) {
      const emailExist = await this.checkEmailExists(data.email);
      if (emailExist) throw new Error("Email address already exists");
    }

    return prisma.contact.create({
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
        email: data.email,
        address: data.address,
        type: data.type,
        notes: data.notes,
      },
    });
  }

  async updateContact(id: number, data: CreateContactSchema): Promise<Contact> {
    if (data.phoneNumber) {
      const phoneExist = await this.checkPhoneExists(data.phoneNumber, id);
      if (phoneExist) throw new Error("Phone number already exists");
    }

    if (data.email) {
      const emailExist = await this.checkEmailExists(data.email, id);
      if (emailExist) throw new Error("Email address already exists");
    }

    return prisma.contact.update({
      where: { id },
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
        email: data.email,
        address: data.address,
        type: data.type,
        notes: data.notes,
      },
    });
  }

  async deleteContact(id: number): Promise<Contact> {
    return prisma.contact.delete({
      where: { id },
    });
  }
}

export default new ContactService();
