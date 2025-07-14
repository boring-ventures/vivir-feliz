-- AlterEnum
ALTER TYPE "ProposalStatus" ADD VALUE 'NEW_PROPOSAL';

-- AlterTable
ALTER TABLE "treatment_proposals" ALTER COLUMN "status" SET DEFAULT 'NEW_PROPOSAL';
