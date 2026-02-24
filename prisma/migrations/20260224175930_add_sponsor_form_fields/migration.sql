-- AlterTable
ALTER TABLE "sponsors" ADD COLUMN     "briefing_ai_usage" TEXT,
ADD COLUMN     "briefing_areas" TEXT,
ADD COLUMN     "briefing_systems" TEXT,
ADD COLUMN     "form_completed_at" TIMESTAMP(3),
ADD COLUMN     "form_responses" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "form_started_at" TIMESTAMP(3),
ADD COLUMN     "form_status" TEXT NOT NULL DEFAULT 'pending';
