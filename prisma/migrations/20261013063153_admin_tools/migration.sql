-- AlterTable
ALTER TABLE `Cart` ADD COLUMN `remindedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `discountNote` TEXT NULL,
    ADD COLUMN `giftWrapped` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `source` VARCHAR(191) NOT NULL DEFAULT 'WEB',
    MODIFY `paymentMethod` ENUM('RAZORPAY', 'COD', 'OFFLINE') NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `permissions` JSON NULL,
    MODIFY `role` ENUM('CUSTOMER', 'ADMIN', 'STAFF') NOT NULL DEFAULT 'CUSTOMER';

-- CreateTable
CREATE TABLE `OrderNote` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `authorName` VARCHAR(191) NOT NULL,
    `text` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrderNote_orderId_createdAt_idx`(`orderId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AutoDiscount` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('PERCENT', 'FLAT', 'BUY_X_GET_Y', 'FREE_SHIPPING') NOT NULL,
    `value` INTEGER NOT NULL DEFAULT 0,
    `buyQty` INTEGER NOT NULL DEFAULT 0,
    `getQty` INTEGER NOT NULL DEFAULT 0,
    `minQty` INTEGER NOT NULL DEFAULT 0,
    `minAmount` INTEGER NOT NULL DEFAULT 0,
    `scope` JSON NULL,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderNote` ADD CONSTRAINT `OrderNote_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
