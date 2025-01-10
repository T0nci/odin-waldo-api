/*
  Warnings:

  - You are about to drop the column `finished` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_token_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "finished",
DROP COLUMN "token",
ALTER COLUMN "started" SET DEFAULT (now() at time zone 'utc');
