-- AlterTable
ALTER TABLE `Barbero` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Business` ADD COLUMN `giro` VARCHAR(191) NOT NULL DEFAULT 'Barbería';

-- AlterTable
ALTER TABLE `BusinessSetting` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Cita` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Servicio` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `User` ALTER COLUMN `updatedAt` DROP DEFAULT;
