-- Deploy outliner:updatedatfunc to pg

BEGIN;

CREATE OR REPLACE FUNCTION outliner.refresh_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$ language 'plpgsql';

COMMIT;
