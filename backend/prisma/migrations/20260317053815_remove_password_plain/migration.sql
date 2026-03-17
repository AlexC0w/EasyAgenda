/*
  Warnings:

  - You are about to drop the column `passwordPlain` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Business` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `User` DROP COLUMN `passwordPlain`;
