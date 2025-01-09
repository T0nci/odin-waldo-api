/*
  Warnings:

  - You are about to drop the column `location` on the `Character` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Character" DROP COLUMN "location",
ADD COLUMN     "end" INTEGER[],
ADD COLUMN     "start" INTEGER[];

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "started" SET DEFAULT (now() at time zone 'utc');
