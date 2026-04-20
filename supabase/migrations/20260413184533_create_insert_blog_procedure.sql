CREATE OR REPLACE PROCEDURE insert_blog(
  p_title VARCHAR(255),
  p_description TEXT,
  p_slug VARCHAR(255),
  p_author VARCHAR(100),
  p_publish_date DATE,
  p_tags VARCHAR(20)[]
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_blog_id INT;
BEGIN
  INSERT INTO public.blogs (title, description, slug, author, publish_date)
  VALUES (p_title, p_description, p_slug, p_author, p_publish_date)
  ON CONFLICT (slug)
  DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    author = EXCLUDED.author,
    publish_date = EXCLUDED.publish_date
  RETURNING id INTO v_blog_id;

  DELETE FROM public.blog_tags 
  WHERE blog_id = v_blog_id;

  INSERT INTO public.blog_tags (blog_id, tag_id)
  SELECT 
    v_blog_id, 
    t.id
  FROM unnest(p_tags) AS tag_name
  LEFT JOIN tags t ON t.name = tag_name
  ON CONFLICT (blog_id, tag_id) DO NOTHING;
END;
$$;