-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- Seed a default restaurant row and backfill every existing row onto it, so
-- this migration is safe to run against the live, already-populated database
-- (today there is only ever one restaurant's worth of data).
INSERT INTO "Restaurant" ("id", "name", "address", "isOpen")
VALUES ('seed-restaurant-swindon-eats', 'Swindon Eats', '14 Havelock Square, Swindon, Wiltshire, SN1 1HG, United Kingdom', true);

-- AlterTable: MenuCategory (nullable first so the backfill can run, then locked to NOT NULL)
ALTER TABLE "MenuCategory" ADD COLUMN "restaurantId" TEXT;
UPDATE "MenuCategory" SET "restaurantId" = 'seed-restaurant-swindon-eats';
ALTER TABLE "MenuCategory" ALTER COLUMN "restaurantId" SET NOT NULL;

-- AlterTable: Order (same nullable-then-backfill-then-NOT NULL approach)
ALTER TABLE "Order" ADD COLUMN "restaurantId" TEXT;
UPDATE "Order" SET "restaurantId" = 'seed-restaurant-swindon-eats';
ALTER TABLE "Order" ALTER COLUMN "restaurantId" SET NOT NULL;

-- AlterTable: User (stays nullable — only RESTAURANT_ADMIN/RESTAURANT_STAFF get one)
ALTER TABLE "User" ADD COLUMN "restaurantId" TEXT;
UPDATE "User" SET "restaurantId" = 'seed-restaurant-swindon-eats' WHERE "role" IN ('RESTAURANT_ADMIN', 'RESTAURANT_STAFF');

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuCategory" ADD CONSTRAINT "MenuCategory_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropTable
DROP TABLE "RestaurantSettings";
