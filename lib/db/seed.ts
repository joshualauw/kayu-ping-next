import { ContactType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

async function main() {
  // Seed users
  await prisma.users.upsert({
    where: { email: "admin@mail.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@mail.com",
      password: await bcrypt.hash("admin123", 10),
    },
  });

  // Seed woods
  await prisma.wood.upsert({
    where: { code: "BKR" },
    update: {},
    create: {
      name: "Bengkirai",
      code: "BKR",
    },
  });
  await prisma.wood.upsert({
    where: { code: "MRT" },
    update: {},
    create: {
      name: "Meranti",
      code: "MRT",
    },
  });
  await prisma.wood.upsert({
    where: { code: "KR" },
    update: {},
    create: {
      name: "Kruing",
      code: "KR",
    },
  });

  // Seed contacts
  await prisma.contact.upsert({
    where: { email: "supplier@mail.com" },
    update: {},
    create: {
      name: "Supplier",
      email: "supplier@mail.com",
      phoneNumber: "08123456787",
      address: "Supplier Address",
      notes: "Supplier Notes",
      type: ContactType.SUPPLIER,
    },
  });
  await prisma.contact.upsert({
    where: { email: "customer@mail.com" },
    update: {},
    create: {
      name: "Customer",
      email: "customer@mail.com",
      phoneNumber: "08123456789",
      address: "Customer Address",
      notes: "Customer Notes",
      type: ContactType.CUSTOMER,
    },
  });
  await prisma.contact.upsert({
    where: { email: "trucker@mail.com" },
    update: {},
    create: {
      name: "Trucker",
      email: "trucker@mail.com",
      phoneNumber: "0828123456788",
      address: "Trucker Address",
      notes: "Trucker Notes",
      type: ContactType.TRUCKER,
    },
  });

  console.log("🌱 Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
