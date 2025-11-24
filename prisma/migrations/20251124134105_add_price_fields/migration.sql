/*
  Warnings:

  - Added the required column `athletePrice` to the `team_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parentPrice` to the `team_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `athletePrice` to the `teams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parentPrice` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "team_applications" ADD COLUMN     "athletePrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "parentPrice" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "athletePrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "parentPrice" DOUBLE PRECISION NOT NULL;
