/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `wallets` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[telegram_id,address]` on the table `wallets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `telegram_id` to the `wallets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "wallets" DROP CONSTRAINT "wallets_user_id_fkey";

-- DropIndex
DROP INDEX "users_telegram_id_key";

-- DropIndex
DROP INDEX "wallets_user_id_address_key";

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("telegram_id");

-- AlterTable
ALTER TABLE "wallets" DROP COLUMN "user_id",
ADD COLUMN     "telegram_id" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "wallets_telegram_id_address_key" ON "wallets"("telegram_id", "address");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_telegram_id_fkey" FOREIGN KEY ("telegram_id") REFERENCES "users"("telegram_id") ON DELETE RESTRICT ON UPDATE CASCADE;
