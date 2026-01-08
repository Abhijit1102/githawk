/*
  Warnings:

  - You are about to drop the `respository` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "respository" DROP CONSTRAINT "respository_userId_fkey";

-- DropTable
DROP TABLE "respository";

-- CreateTable
CREATE TABLE "repository" (
    "id" TEXT NOT NULL,
    "githubId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "prNumber" INTEGER NOT NULL,
    "prTitle" TEXT NOT NULL,
    "prUrl" TEXT NOT NULL,
    "review" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "repository_githubId_key" ON "repository"("githubId");

-- CreateIndex
CREATE INDEX "repository_userId_idx" ON "repository"("userId");

-- CreateIndex
CREATE INDEX "review_repositoryId_idx" ON "review"("repositoryId");

-- AddForeignKey
ALTER TABLE "repository" ADD CONSTRAINT "repository_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
