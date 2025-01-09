-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "location" INTEGER[];

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "started" SET DEFAULT (now() at time zone 'utc');
