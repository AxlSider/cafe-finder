-- CreateTable
CREATE TABLE `Cafe` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `region` ENUM('LUZON', 'SWITZERLAND') NOT NULL,
    `locality` VARCHAR(191) NOT NULL,
    `address` TEXT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `rating` DOUBLE NULL,
    `reviewCount` INTEGER NULL,
    `priceLevel` ENUM('BUDGET', 'MODERATE', 'EXPENSIVE') NULL,
    `phone` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `photoUrl` TEXT NULL,
    `photoAlt` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `source` ENUM('CURATED', 'EXTERNAL', 'USER') NOT NULL DEFAULT 'CURATED',
    `sourceName` VARCHAR(191) NULL,
    `sourceRef` VARCHAR(191) NULL,
    `ratingSource` VARCHAR(191) NULL,
    `photoAttribution` TEXT NULL,
    `googlePlaceId` VARCHAR(191) NULL,
    `googlePhotoName` TEXT NULL,
    `externalPlaceId` VARCHAR(191) NULL,
    `lastSyncedAt` DATETIME(3) NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `featuredRank` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cafe_slug_key`(`slug`),
    INDEX `Cafe_region_idx`(`region`),
    INDEX `Cafe_latitude_longitude_idx`(`latitude`, `longitude`),
    INDEX `Cafe_featured_featuredRank_idx`(`featured`, `featuredRank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CafeHour` (
    `id` VARCHAR(191) NOT NULL,
    `cafeId` VARCHAR(191) NOT NULL,
    `weekday` INTEGER NOT NULL,
    `opensMin` INTEGER NOT NULL,
    `closesMin` INTEGER NOT NULL,

    INDEX `CafeHour_cafeId_idx`(`cafeId`),
    UNIQUE INDEX `CafeHour_cafeId_weekday_opensMin_key`(`cafeId`, `weekday`, `opensMin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Amenity` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Amenity_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CafeAmenity` (
    `cafeId` VARCHAR(191) NOT NULL,
    `amenityId` VARCHAR(191) NOT NULL,

    INDEX `CafeAmenity_amenityId_idx`(`amenityId`),
    PRIMARY KEY (`cafeId`, `amenityId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Tag_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CafeTag` (
    `cafeId` VARCHAR(191) NOT NULL,
    `tagId` VARCHAR(191) NOT NULL,

    INDEX `CafeTag_tagId_idx`(`tagId`),
    PRIMARY KEY (`cafeId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Drink` (
    `id` VARCHAR(191) NOT NULL,
    `cafeId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` ENUM('ESPRESSO', 'COFFEE', 'LATTE', 'COLD_COFFEE', 'MATCHA', 'TEA', 'CHOCOLATE', 'NON_COFFEE') NOT NULL,
    `price` DOUBLE NULL,
    `currency` VARCHAR(191) NULL,
    `hotAvailable` BOOLEAN NOT NULL DEFAULT true,
    `icedAvailable` BOOLEAN NOT NULL DEFAULT false,
    `sweet` BOOLEAN NOT NULL DEFAULT false,
    `bitter` BOOLEAN NOT NULL DEFAULT false,
    `strong` BOOLEAN NOT NULL DEFAULT false,
    `light` BOOLEAN NOT NULL DEFAULT false,
    `milkBased` BOOLEAN NOT NULL DEFAULT false,
    `source` ENUM('CURATED', 'EXTERNAL', 'USER') NOT NULL DEFAULT 'CURATED',

    INDEX `Drink_cafeId_idx`(`cafeId`),
    INDEX `Drink_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DrinkType` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` ENUM('ESPRESSO', 'COFFEE', 'LATTE', 'COLD_COFFEE', 'MATCHA', 'TEA', 'CHOCOLATE', 'NON_COFFEE') NOT NULL,
    `description` TEXT NOT NULL,
    `hotAvailable` BOOLEAN NOT NULL DEFAULT true,
    `icedAvailable` BOOLEAN NOT NULL DEFAULT false,
    `sweet` BOOLEAN NOT NULL DEFAULT false,
    `bitter` BOOLEAN NOT NULL DEFAULT false,
    `strong` BOOLEAN NOT NULL DEFAULT false,
    `light` BOOLEAN NOT NULL DEFAULT false,
    `milkBased` BOOLEAN NOT NULL DEFAULT false,
    `hasCaffeine` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DrinkType_slug_key`(`slug`),
    INDEX `DrinkType_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `suspended` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Session_tokenHash_key`(`tokenHash`),
    INDEX `Session_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CoffeePreference` (
    `userId` VARCHAR(191) NOT NULL,
    `sweet` BOOLEAN NOT NULL DEFAULT false,
    `bitter` BOOLEAN NOT NULL DEFAULT false,
    `strong` BOOLEAN NOT NULL DEFAULT false,
    `light` BOOLEAN NOT NULL DEFAULT false,
    `milkBased` BOOLEAN NOT NULL DEFAULT false,
    `black` BOOLEAN NOT NULL DEFAULT false,
    `iced` BOOLEAN NOT NULL DEFAULT false,
    `hot` BOOLEAN NOT NULL DEFAULT false,
    `matcha` BOOLEAN NOT NULL DEFAULT false,
    `tea` BOOLEAN NOT NULL DEFAULT false,
    `chocolate` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FavoriteCafe` (
    `userId` VARCHAR(191) NOT NULL,
    `cafeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FavoriteCafe_cafeId_idx`(`cafeId`),
    PRIMARY KEY (`userId`, `cafeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FavoriteDrink` (
    `userId` VARCHAR(191) NOT NULL,
    `drinkId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FavoriteDrink_drinkId_idx`(`drinkId`),
    PRIMARY KEY (`userId`, `drinkId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `id` VARCHAR(191) NOT NULL,
    `cafeId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `kind` ENUM('WRONG_LOCATION', 'WRONG_HOURS', 'CLOSED', 'DUPLICATE', 'WRONG_MENU', 'WRONG_INFO', 'WRONG_PHOTO') NOT NULL,
    `details` TEXT NULL,
    `status` ENUM('OPEN', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolvedAt` DATETIME(3) NULL,

    INDEX `Report_cafeId_idx`(`cafeId`),
    INDEX `Report_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnalyticsEvent` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `properties` JSON NULL,
    `region` ENUM('LUZON', 'SWITZERLAND') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AnalyticsEvent_name_idx`(`name`),
    INDEX `AnalyticsEvent_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CafeHour` ADD CONSTRAINT `CafeHour_cafeId_fkey` FOREIGN KEY (`cafeId`) REFERENCES `Cafe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CafeAmenity` ADD CONSTRAINT `CafeAmenity_cafeId_fkey` FOREIGN KEY (`cafeId`) REFERENCES `Cafe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CafeAmenity` ADD CONSTRAINT `CafeAmenity_amenityId_fkey` FOREIGN KEY (`amenityId`) REFERENCES `Amenity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CafeTag` ADD CONSTRAINT `CafeTag_cafeId_fkey` FOREIGN KEY (`cafeId`) REFERENCES `Cafe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CafeTag` ADD CONSTRAINT `CafeTag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Drink` ADD CONSTRAINT `Drink_cafeId_fkey` FOREIGN KEY (`cafeId`) REFERENCES `Cafe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CoffeePreference` ADD CONSTRAINT `CoffeePreference_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriteCafe` ADD CONSTRAINT `FavoriteCafe_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriteCafe` ADD CONSTRAINT `FavoriteCafe_cafeId_fkey` FOREIGN KEY (`cafeId`) REFERENCES `Cafe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriteDrink` ADD CONSTRAINT `FavoriteDrink_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriteDrink` ADD CONSTRAINT `FavoriteDrink_drinkId_fkey` FOREIGN KEY (`drinkId`) REFERENCES `Drink`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_cafeId_fkey` FOREIGN KEY (`cafeId`) REFERENCES `Cafe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

