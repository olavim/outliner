-- Deploy outliner:outline to pg

BEGIN;

CREATE TABLE outliner.outline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE outliner.outline OWNER TO outliner;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE outliner.outline TO outliner_rw;

CREATE TRIGGER refresh_outline_updated_at BEFORE UPDATE
  ON outliner.outline FOR EACH ROW EXECUTE PROCEDURE
  outliner.refresh_updated_at();

COMMIT;
