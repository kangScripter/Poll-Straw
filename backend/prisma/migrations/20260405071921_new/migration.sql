/*
  Warnings:

  - A unique constraint covering the columns `[pollId,optionId,userId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Vote_pollId_ipAddress_key";

-- DropIndex
DROP INDEX "Vote_pollId_userId_key";

-- CreateIndex
CREATE INDEX "Vote_pollId_ipAddress_idx" ON "Vote"("pollId", "ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_pollId_optionId_userId_key" ON "Vote"("pollId", "optionId", "userId");
