CREATE TABLE IF NOT EXISTS "votes" (
	"user_id" uuid NOT NULL,
	"card_id" uuid NOT NULL,
	"votes" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "votes_user_id_card_id_pk" PRIMARY KEY("user_id","card_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
