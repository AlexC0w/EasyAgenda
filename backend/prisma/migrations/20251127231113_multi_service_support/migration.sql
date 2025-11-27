-- DropForeignKey
ALTER TABLE `Cita` DROP FOREIGN KEY `Cita_servicio_id_fkey`;

-- AlterTable
ALTER TABLE `Barbero` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `BusinessSetting` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Cita` ADD COLUMN `duracionTotal` INTEGER NOT NULL DEFAULT 0,
    MODIFY `servicio_id` INTEGER NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Servicio` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `User` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- CreateTable
CREATE TABLE `CitaServicio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `citaId` INTEGER NOT NULL,
    `servicioId` INTEGER NOT NULL,

    UNIQUE INDEX `CitaServicio_citaId_servicioId_key`(`citaId`, `servicioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cita` ADD CONSTRAINT `Cita_servicio_id_fkey` FOREIGN KEY (`servicio_id`) REFERENCES `Servicio`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CitaServicio` ADD CONSTRAINT `CitaServicio_citaId_fkey` FOREIGN KEY (`citaId`) REFERENCES `Cita`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CitaServicio` ADD CONSTRAINT `CitaServicio_servicioId_fkey` FOREIGN KEY (`servicioId`) REFERENCES `Servicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
