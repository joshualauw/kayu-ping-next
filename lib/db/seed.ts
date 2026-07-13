import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { ContactType, LocationType, Measurement } from "@/generated/prisma/client";

async function main() {
  // 1. Seed admin user
  await prisma.users.upsert({
    where: { email: "admin@mail.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@mail.com",
      password: await bcrypt.hash("admin123", 10),
    },
  });

  // 2. Seed contacts
  const contacts = [
    {
      name: "John Doe",
      email: "john@example.com",
      phoneNumber: "081234567890",
      type: ContactType.CUSTOMER,
      address: "123 Customer St",
      notes: "Default customer seed",
    },
    {
      name: "Wood Supplier Co",
      email: "supplier@example.com",
      phoneNumber: "081234567891",
      type: ContactType.SUPPLIER,
      address: "456 Supplier Rd",
      notes: "Default supplier seed",
    },
    {
      name: "Logistic Transporter",
      email: "trucker@example.com",
      phoneNumber: "081234567892",
      type: ContactType.TRUCKER,
      address: "789 Logistics Way",
      notes: "Default trucker seed",
    },
    {
      name: "General Contact",
      email: "general@example.com",
      phoneNumber: "081234567893",
      type: ContactType.OTHERS,
      address: "101 Mixed St",
      notes: "Default other seed",
    },
  ];

  for (const contact of contacts) {
    await prisma.contact.upsert({
      where: { email: contact.email },
      update: {},
      create: contact,
    });
  }

  // 3. Seed locations
  const locations = [
    {
      name: "Main Warehouse",
      type: LocationType.WAREHOUSE,
      address: "Warehouse Block A",
    },
    {
      name: "Tanjung Perak Port",
      type: LocationType.PORT,
      address: "Port Pier 3",
    },
    {
      name: "Sawmill Alpha",
      type: LocationType.MILL,
      address: "Timber Zone",
    },
  ];

  for (const location of locations) {
    const existing = await prisma.location.findFirst({
      where: { name: location.name },
    });
    if (!existing) {
      await prisma.location.create({
        data: location,
      });
    }
  }

  // 4. Seed woods
  const woods = [
    { name: "Meranti", code: "MRN" },
    { name: "Teak", code: "TEK" },
    { name: "Mahogany", code: "MHG" },
    { name: "Pine", code: "PIN" },
  ];

  for (const wood of woods) {
    await prisma.wood.upsert({
      where: { code: wood.code },
      update: {},
      create: wood,
    });
  }

  // 5. Seed materials
  const materials = [
    { name: "Round Log", measurement: Measurement.CYLINDER, code: "LOG" },
    { name: "Sawn Timber", measurement: Measurement.CUBE, code: "PCS" },
  ];

  for (const material of materials) {
    const existing = await prisma.material.findFirst({
      where: { code: material.code },
    });
    if (!existing) {
      await prisma.material.create({
        data: material,
      });
    }
  }

  // 6. Seed Grades
  const grades = [
    { name: "KW Super", code: "KWS" },
    { name: "RW Super", code: "RWS" },
  ];

  for (const grade of grades) {
    const existing = await prisma.grade.findFirst({
      where: { code: grade.code },
    });
    if (!existing) {
      await prisma.grade.create({
        data: grade,
      });
    }
  }

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
