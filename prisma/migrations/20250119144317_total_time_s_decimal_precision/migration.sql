/*
  Warnings:

  - You are about to alter the column `total_time_s` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(65,3)`.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "started" SET DEFAULT (now() at time zone 'utc'),
ALTER COLUMN "total_time_s" SET DATA TYPE DECIMAL(65,3);
