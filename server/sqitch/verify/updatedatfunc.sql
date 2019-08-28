-- Verify outliner:updatedatfunc on pg

BEGIN;

SELECT has_function_privilege('outliner.refresh_updated_at()', 'execute');

ROLLBACK;
