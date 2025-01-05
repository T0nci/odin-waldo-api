-- CreateTable
CREATE TABLE "Map" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "url" VARCHAR(255) NOT NULL,

    CONSTRAINT "Map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "map_id" INTEGER NOT NULL,
    "started" TIMESTAMP(3) NOT NULL DEFAULT (now() at time zone 'utc'),
    "finished" BOOLEAN NOT NULL DEFAULT false,
    "total_time_s" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "map_id" INTEGER NOT NULL,
    "url" VARCHAR(255) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guess" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "char_id" INTEGER NOT NULL,

    CONSTRAINT "Guess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_token_key" ON "User"("token");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "Map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "Map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guess" ADD CONSTRAINT "Guess_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guess" ADD CONSTRAINT "Guess_char_id_fkey" FOREIGN KEY ("char_id") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
