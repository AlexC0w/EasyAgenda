-- CreateTable
CREATE TABLE `Barbero` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `horario_inicio` VARCHAR(191) NOT NULL,
    `horario_fin` VARCHAR(191) NOT NULL,
    `dias_laborales` VARCHAR(191) NOT NULL DEFAULT '[]',
    `duracion_cita` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Servicio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `duracion` INTEGER NOT NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cita` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `barbero_id` INTEGER NOT NULL,
    `servicio_id` INTEGER NOT NULL,
    `cliente` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `hora` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'confirmada',
    `recordatorioEnviado` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Cita_barbero_id_fecha_idx`(`barbero_id`, `fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cita` ADD CONSTRAINT `Cita_barbero_id_fkey` FOREIGN KEY (`barbero_id`) REFERENCES `Barbero`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cita` ADD CONSTRAINT `Cita_servicio_id_fkey` FOREIGN KEY (`servicio_id`) REFERENCES `Servicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
