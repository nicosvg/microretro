CREATE TABLE IF NOT EXISTS "emoji_selections" (
	"user_id" uuid NOT NULL,
	"card_id" uuid NOT NULL,
	"emoji" varchar(10) NOT NULL,
	CONSTRAINT "emoji_selections_user_id_card_id_pk" PRIMARY KEY("user_id","card_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "emoji_selections" ADD CONSTRAINT "emoji_selections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "emoji_selections" ADD CONSTRAINT "emoji_selections_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
