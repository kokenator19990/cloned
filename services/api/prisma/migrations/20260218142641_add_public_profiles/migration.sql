/*
  Warnings:

  - A unique constraint covering the columns `[shareCode]` on the table `PersonaProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PersonaProfile" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shareCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PersonaProfile_shareCode_key" ON "PersonaProfile"("shareCode");
