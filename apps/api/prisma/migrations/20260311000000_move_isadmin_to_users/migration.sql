-- Step 1: Drop the existing foreign key constraint on players.userid
ALTER TABLE "players" DROP CONSTRAINT "fk_players_users_userid";

-- Step 2: Add isadmin column to users table with default false
ALTER TABLE "users" ADD COLUMN "isadmin" BOOLEAN NOT NULL DEFAULT false;

-- Step 3: Make userid nullable in players table
ALTER TABLE "players" ALTER COLUMN "userid" DROP NOT NULL;

-- Step 4: Drop isadmin column from players table
ALTER TABLE "players" DROP COLUMN "isadmin";

-- Step 5: Re-create the foreign key with SetNull behavior
ALTER TABLE "players" ADD CONSTRAINT "fk_players_users_userid" 
  FOREIGN KEY ("userid") REFERENCES "users" ("id") 
  ON DELETE SET NULL ON UPDATE NO ACTION;
