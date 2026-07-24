-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pushToken" TEXT;

-- CreateTable
CREATE TABLE "RestaurantSettings" (
    "id" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RestaurantSettings_pkey" PRIMARY KEY ("id")
);
