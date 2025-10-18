-- Safe migration to add profile fields and username
-- 1) Add new columns (without dropping existing `name` yet)
-- 2) Add username as nullable
-- 3) Backfill username from name or email local-part
-- 4) Resolve duplicates by appending a short id fragment
-- 5) Make username NOT NULL and add unique index

BEGIN;

-- Add profile columns
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" TEXT DEFAULT '';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "firstName" VARCHAR(30);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastName" VARCHAR(30);

-- Add username as nullable first
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" VARCHAR(30);

-- Backfill username: prefer existing name if present, otherwise local-part of email
UPDATE "users"
SET "username" = COALESCE(NULLIF("name", ''), split_part("email", '@', 1))
WHERE "username" IS NULL;

-- Handle potential duplicates by appending a short id fragment for rows with duplicate usernames
-- This makes usernames unique deterministically without human input
WITH dup AS (
  SELECT "username"
  FROM "users"
  GROUP BY "username"
  HAVING COUNT(*) > 1
)
UPDATE "users"
SET "username" = "username" || '_' || substring("id" from 1 for 6)
WHERE "username" IN (SELECT "username" FROM dup);

-- Ensure no NULLs remain (fail early if any)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "users" WHERE "username" IS NULL) THEN
    RAISE EXCEPTION 'username backfill failed: NULL usernames remain';
  END IF;
END$$;

-- Make username required and unique
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");

COMMIT;
