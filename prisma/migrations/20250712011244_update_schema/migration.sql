-- AlterEnum
ALTER TYPE "ProposalStatus" ADD VALUE 'PROPOSAL_CREATED';

-- AlterTable
ALTER TABLE "treatment_proposals" ALTER COLUMN "status" SET DEFAULT 'PROPOSAL_CREATED';
