import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      name: "Casey Customer",
      email: "customer@example.com",
      passwordHash,
      role: "CUSTOMER",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Riley Restaurant",
      email: "admin@example.com",
      passwordHash,
      role: "RESTAURANT_ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "rider@example.com" },
    update: {},
    create: {
      name: "Dana Delivery",
      email: "rider@example.com",
      passwordHash,
      role: "DELIVERY_RIDER",
    },
  });

  await prisma.address.upsert({
    where: { id: "seed-address-1" },
    update: {},
    create: {
      id: "seed-address-1",
      label: "Home",
      line1: "123 Main St",
      city: "Springfield",
      state: "IL",
      postalCode: "62701",
      lat: 39.7817,
      lng: -89.6501,
      customerId: customer.id,
    },
  });

  const starters = await prisma.menuCategory.upsert({
    where: { id: "seed-cat-starters" },
    update: {},
    create: { id: "seed-cat-starters", name: "Starters", sortOrder: 0 },
  });
  const mains = await prisma.menuCategory.upsert({
    where: { id: "seed-cat-mains" },
    update: {},
    create: { id: "seed-cat-mains", name: "Mains", sortOrder: 1 },
  });
  const drinks = await prisma.menuCategory.upsert({
    where: { id: "seed-cat-drinks" },
    update: {},
    create: { id: "seed-cat-drinks", name: "Drinks", sortOrder: 2 },
  });

  const items = [
    { id: "seed-item-1", name: "Garlic Bread", priceCents: 599, categoryId: starters.id, description: "Toasted baguette with garlic butter" },
    { id: "seed-item-2", name: "Loaded Nachos", priceCents: 899, categoryId: starters.id, description: "Corn chips, cheese, jalapeños, salsa" },
    { id: "seed-item-3", name: "Margherita Pizza", priceCents: 1399, categoryId: mains.id, description: "Tomato, mozzarella, basil" },
    { id: "seed-item-4", name: "Chicken Burger", priceCents: 1199, categoryId: mains.id, description: "Grilled chicken, lettuce, house sauce" },
    { id: "seed-item-5", name: "Veg Fried Rice", priceCents: 1099, categoryId: mains.id, description: "Wok-fried rice with seasonal vegetables" },
    { id: "seed-item-6", name: "Lemonade", priceCents: 399, categoryId: drinks.id, description: "Fresh-squeezed, lightly sweetened" },
    { id: "seed-item-7", name: "Cola", priceCents: 299, categoryId: drinks.id, description: "Chilled can" },
  ];

  for (const item of items) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  console.log("Seed complete. Test accounts (password: password123):");
  console.log("  customer@example.com / RESTAURANT_ADMIN admin@example.com / DELIVERY_RIDER rider@example.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
