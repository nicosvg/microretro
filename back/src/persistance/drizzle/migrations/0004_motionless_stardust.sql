ALTER TABLE "board" RENAME COLUMN "status" TO "step";--> statement-breakpoint
ALTER TABLE "board" ALTER COLUMN "step" SET DEFAULT 'write';