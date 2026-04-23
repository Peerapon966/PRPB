-- Create prpb_user role with no login/pass yet, just enough to satisfy RLS
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'prpb_user') THEN
    CREATE ROLE "prpb_user";

    GRANT USAGE ON SCHEMA public TO "prpb_user";

    -- Grant access to existing objects
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "prpb_user";
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO "prpb_user";
    GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO "prpb_user";

    -- Grant access to future objects
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "prpb_user";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO "prpb_user";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON ROUTINES TO "prpb_user";
  END IF;
END
$$;
