/*
  Warnings:

  - You are about to drop the column `author` on the `Experience` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `Experience` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `Report` table. All the data in the column will be lost.
  - Added the required column `authorName` to the `Experience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "author",
DROP COLUMN "timestamp",
ADD COLUMN     "authorName" TEXT NOT NULL,
ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "status" SET DEFAULT 'pending',
ALTER COLUMN "comments" SET DEFAULT '[]',
ALTER COLUMN "isAnonymous" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "username",
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "answers" SET DEFAULT '[]',
ALTER COLUMN "isAnonymous" SET DEFAULT false,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "timestamp",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "perpetratorInfo" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending',
ALTER COLUMN "severity" SET DEFAULT 'medium',
ALTER COLUMN "isAnonymous" SET DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Experience_userId_idx" ON "Experience"("userId");

-- CreateIndex
CREATE INDEX "Experience_status_idx" ON "Experience"("status");

-- CreateIndex
CREATE INDEX "Question_userId_idx" ON "Question"("userId");

-- CreateIndex
CREATE INDEX "Question_status_idx" ON "Question"("status");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_severity_idx" ON "Report"("severity");

-- CreateIndex
CREATE INDEX "Report_bullyingType_idx" ON "Report"("bullyingType");
