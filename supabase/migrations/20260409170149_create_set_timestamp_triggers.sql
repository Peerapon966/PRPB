CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SET search_path = pg_catalog, public;

CREATE TRIGGER set_tags_updated_timestamp
BEFORE UPDATE ON tags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_blogs_updated_timestamp
BEFORE UPDATE ON blogs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_blog_tags_updated_timestamp
BEFORE UPDATE ON blog_tags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
