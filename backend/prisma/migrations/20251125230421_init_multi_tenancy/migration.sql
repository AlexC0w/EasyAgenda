/*
  Warnings:

  - A unique constraint covering the columns `[businessId,key]` on the table `BusinessSetting` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `BusinessSetting_key_key` ON `BusinessSetting`;

-- AlterTable
ALTER TABLE `Barbero` ADD COLUMN `businessId` INTEGER NOT NULL DEFAULT 1,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `BusinessSetting` ADD COLUMN `businessId` INTEGER NOT NULL DEFAULT 1,
    MODIFY `value` VARCHAR(191) NOT NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Cita` ADD COLUMN `businessId` INTEGER NOT NULL DEFAULT 1,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Servicio` ADD COLUMN `businessId` INTEGER NOT NULL DEFAULT 1,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `businessId` INTEGER NOT NULL DEFAULT 1,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- CreateTable
CREATE TABLE `Business` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Business_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Barbero_businessId_idx` ON `Barbero`(`businessId`);

-- CreateIndex
CREATE UNIQUE INDEX `BusinessSetting_businessId_key_key` ON `BusinessSetting`(`businessId`, `key`);

-- CreateIndex
CREATE INDEX `Cita_businessId_idx` ON `Cita`(`businessId`);

-- CreateIndex
CREATE INDEX `Servicio_businessId_idx` ON `Servicio`(`businessId`);

-- CreateIndex
CREATE INDEX `User_businessId_idx` ON `User`(`businessId`);

-- AddForeignKey
ALTER TABLE `Barbero` ADD CONSTRAINT `Barbero_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Servicio` ADD CONSTRAINT `Servicio_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cita` ADD CONSTRAINT `Cita_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BusinessSetting` ADD CONSTRAINT `BusinessSetting_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
