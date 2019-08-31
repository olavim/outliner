-- Revert outliner:init from pg

BEGIN;

DROP SCHEMA outliner;

COMMIT;
