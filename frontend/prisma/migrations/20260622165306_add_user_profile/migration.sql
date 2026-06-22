-- CreateTable
CREATE TABLE `user_profile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `strasse` VARCHAR(191) NULL,
    `nr` VARCHAR(191) NULL,
    `plz` VARCHAR(191) NULL,
    `stadt` VARCHAR(191) NULL,
    `land` VARCHAR(191) NULL,

    UNIQUE INDEX `user_profile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
