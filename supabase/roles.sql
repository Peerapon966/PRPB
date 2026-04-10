-- Create prpb_user role with no login/pass yet, just enough to satisfy RLS
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'prpb_user') THEN
    CREATE ROLE "prpb_user";
    
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO prpb_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO prpb_user; 
  END IF;
END
$$;
