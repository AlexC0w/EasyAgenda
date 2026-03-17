-- AlterTable
ALTER TABLE `Business` ADD COLUMN `stripeCustomerId` VARCHAR(191) NULL,
    ADD COLUMN `stripeSubscriptionId` VARCHAR(191) NULL,
    ADD COLUMN `subscriptionStatus` VARCHAR(191) NULL,
    ADD COLUMN `trialEndsAt` DATETIME(3) NULL;
