-- Revert outliner:outline from pg

BEGIN;

DROP TABLE IF EXISTS outliner.outline;

COMMIT;
