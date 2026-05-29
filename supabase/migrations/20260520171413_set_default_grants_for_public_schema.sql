-- These grants are required due to Supabase new data API access policy
-- See https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically for more details

-- Existing tables
grant select on all tables in schema public to anon;

grant select, insert, update, delete
on all tables in schema public
to authenticated;

grant select, insert, update, delete
on all tables in schema public
to service_role;

-- Future tables
alter default privileges in schema public
grant select on tables to anon;

alter default privileges in schema public
grant select, insert, update, delete
on tables to authenticated;

alter default privileges in schema public
grant select, insert, update, delete
on tables to service_role;