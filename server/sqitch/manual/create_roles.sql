-- Create outliner and outliner_rw roles for outliner schemas

BEGIN;

DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'outliner') THEN
      CREATE ROLE outliner NOLOGIN;
   END IF;
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'outliner_rw') THEN
		CREATE ROLE outliner_rw LOGIN PASSWORD 'outliner';
   END IF;
END
$do$;

COMMIT;
