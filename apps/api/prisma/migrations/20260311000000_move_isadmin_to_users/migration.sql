-- Step 1: Drop existing FK on players.userid (handles any constraint name from .NET Core import)
DO $do$
DECLARE
  fk_name TEXT;
BEGIN
  SELECT conname INTO fk_name
  FROM pg_constraint
  WHERE conrelid = 'players'::regclass
    AND contype = 'f'
    AND conkey @> ARRAY(
      SELECT attnum FROM pg_attribute
      WHERE attrelid = 'players'::regclass AND attname = 'userid'
    )
    AND ARRAY(
      SELECT attnum FROM pg_attribute
      WHERE attrelid = 'players'::regclass AND attname = 'userid'
    ) @> conkey;
  IF fk_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE players DROP CONSTRAINT ' || quote_ident(fk_name);
  END IF;
END $do$;

-- Step 2: Add isadmin column to users table (if not exists)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isadmin" BOOLEAN NOT NULL DEFAULT false;

-- Step 3: Make userid nullable in players table
ALTER TABLE "players" ALTER COLUMN "userid" DROP NOT NULL;

-- Step 4: Drop isadmin column from players table (if exists)
ALTER TABLE "players" DROP COLUMN IF EXISTS "isadmin";

-- Step 5: Re-create the foreign key with SetNull behavior (if not exists)
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_players_users_userid'
      AND conrelid = 'players'::regclass
  ) THEN
    ALTER TABLE "players" ADD CONSTRAINT "fk_players_users_userid"
      FOREIGN KEY ("userid") REFERENCES "users" ("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $do$;
