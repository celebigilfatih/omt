-- AlterTable
ALTER TABLE "team_applications" ADD COLUMN     "ageGroupTeamCounts" JSONB;

-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "ageGroupTeamCounts" JSONB;
