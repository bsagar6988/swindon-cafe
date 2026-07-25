import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { FOOD_ICONS } from "./foodIcons";

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
  const sundaes = await prisma.menuCategory.upsert({
    where: { id: "seed-cat-sundaes" },
    update: {},
    create: { id: "seed-cat-sundaes", name: "Sundaes", sortOrder: 3 },
  });
  const waffles = await prisma.menuCategory.upsert({
    where: { id: "seed-cat-waffles" },
    update: {},
    create: { id: "seed-cat-waffles", name: "Waffles", sortOrder: 4 },
  });
  const crepes = await prisma.menuCategory.upsert({
    where: { id: "seed-cat-crepes" },
    update: {},
    create: { id: "seed-cat-crepes", name: "Crepes", sortOrder: 5 },
  });
  const cakesAndPuddings = await prisma.menuCategory.upsert({
    where: { id: "seed-cat-cakes-puddings" },
    update: {},
    create: { id: "seed-cat-cakes-puddings", name: "Cakes & Puddings", sortOrder: 6 },
  });

  const items = [
    { id: "seed-item-1", name: "Garlic Bread", priceCents: 599, categoryId: starters.id, description: "Toasted baguette with garlic butter" },
    { id: "seed-item-2", name: "Loaded Nachos", priceCents: 899, categoryId: starters.id, description: "Corn chips, cheese, jalapeños, salsa" },
    { id: "seed-item-3", name: "Margherita Pizza", priceCents: 1399, categoryId: mains.id, description: "Tomato, mozzarella, basil" },
    { id: "seed-item-4", name: "Chicken Burger", priceCents: 1199, categoryId: mains.id, description: "Grilled chicken, lettuce, house sauce" },
    { id: "seed-item-5", name: "Veg Fried Rice", priceCents: 1099, categoryId: mains.id, description: "Wok-fried rice with seasonal vegetables" },
    { id: "seed-item-6", name: "Lemonade", priceCents: 399, categoryId: drinks.id, description: "Fresh-squeezed, lightly sweetened" },
    { id: "seed-item-7", name: "Cola", priceCents: 299, categoryId: drinks.id, description: "Chilled can" },

    // Dessert menu, inspired by a well-known Swindon dessert parlour's
    // real item names and price points (sourced from a public UK menu-price
    // listing) — descriptions and illustrations below are original.
    { id: "dessert-banana-split", name: "Classic Banana Split", priceCents: 900, categoryId: sundaes.id, description: "Split banana, three scoops, whipped cream and a cherry on top" },
    { id: "dessert-hot-fudge-sundae", name: "Hot Fudge Sundae", priceCents: 970, categoryId: sundaes.id, description: "Vanilla ice cream drenched in warm chocolate fudge sauce" },
    { id: "dessert-cookies-and-cream-sundae", name: "Cookies and Cream Sundae", priceCents: 900, categoryId: sundaes.id, description: "Vanilla ice cream loaded with crushed chocolate cookie pieces" },
    { id: "dessert-strawberry-cheesecake-sundae", name: "Strawberry Cheesecake Sundae", priceCents: 900, categoryId: sundaes.id, description: "Vanilla ice cream with strawberry sauce and cheesecake pieces" },

    { id: "dessert-brownie-waffle", name: "The Brownie Waffle", priceCents: 970, categoryId: waffles.id, description: "Warm waffle topped with a chocolate brownie chunk and ice cream" },
    { id: "dessert-banoffee-waffle", name: "Banoffee Waffle", priceCents: 845, categoryId: waffles.id, description: "Waffle with sliced banana and rich caramel sauce" },
    { id: "dessert-waffle-au-tella", name: "Waffle-au-tella", priceCents: 775, categoryId: waffles.id, description: "Waffle drizzled generously with chocolate hazelnut sauce" },
    { id: "dessert-strawberry-shortcake-waffle", name: "Strawberry Shortcake Waffle", priceCents: 845, categoryId: waffles.id, description: "Waffle topped with fresh strawberries and whipped cream" },

    { id: "dessert-crepe-au-tella", name: "Crepe-au-tella", priceCents: 715, categoryId: crepes.id, description: "Folded crepe filled with chocolate hazelnut sauce" },
    { id: "dessert-banoffee-crepe", name: "Banoffee Crepe", priceCents: 645, categoryId: crepes.id, description: "Folded crepe with banana and caramel sauce" },
    { id: "dessert-strawberries-and-cream-crepe", name: "Strawberries & Cream Crepe", priceCents: 775, categoryId: crepes.id, description: "Folded crepe with fresh strawberries and whipped cream" },

    { id: "dessert-new-york-vanilla-cheesecake", name: "New York Style Vanilla Cheesecake", priceCents: 455, categoryId: cakesAndPuddings.id, description: "A classic baked vanilla cheesecake slice on a biscuit base" },
    { id: "dessert-sticky-toffee-pudding", name: "Hot Sticky Toffee Pudding", priceCents: 585, categoryId: cakesAndPuddings.id, description: "Warm sponge pudding soaked in sticky toffee sauce" },
    { id: "dessert-chocolate-orange-brownie", name: "Chocolate Orange Brownie", priceCents: 585, categoryId: cakesAndPuddings.id, description: "Dense chocolate brownie with a hint of orange zest" },
  ].map((item) => ({ ...item, imageUrl: FOOD_ICONS[item.id] }));

  for (const item of items) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: { imageUrl: item.imageUrl },
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
