ALTER TABLE "cards" DROP CONSTRAINT "cards_board_id_board_id_fk";
--> statement-breakpoint
ALTER TABLE "groups" DROP CONSTRAINT "groups_board_id_board_id_fk";
--> statement-breakpoint
ALTER TABLE "members" DROP CONSTRAINT "members_board_id_board_id_fk";
--> statement-breakpoint
ALTER TABLE "votes" DROP CONSTRAINT "votes_card_id_cards_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cards" ADD CONSTRAINT "cards_board_id_board_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."board"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_board_id_board_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."board"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "members" ADD CONSTRAINT "members_board_id_board_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."board"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
