-- AlterTable
ALTER TABLE "User" ALTER COLUMN "started" SET DEFAULT (now() at time zone 'utc'),
ALTER COLUMN "total_time_s" SET DATA TYPE DECIMAL(65,30);
