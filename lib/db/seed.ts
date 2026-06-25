import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

async function main() {
  await prisma.users.upsert({
    where: { email: "admin@mail.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@mail.com",
      password: await bcrypt.hash("admin123", 10),
    },
  });

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
