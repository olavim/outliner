-- Deploy outliner:init to pg

BEGIN;

CREATE SCHEMA outliner AUTHORIZATION outliner;
GRANT USAGE ON SCHEMA outliner TO outliner_rw;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

COMMIT;
