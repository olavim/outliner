-- Revert outliner:updatedatfunc from pg

BEGIN;

DROP FUNCTION outliner.refresh_updated_at();

COMMIT;
