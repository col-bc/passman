/*
  Warnings:

  - You are about to drop the column `isCompromised` on the `SecureItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SecureItem" DROP COLUMN "isCompromised",
ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false;
