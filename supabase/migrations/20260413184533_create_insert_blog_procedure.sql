CREATE OR REPLACE PROCEDURE insert_blog(
  title VARCHAR(255),
  description TEXT,
  slug VARCHAR(255),
  author VARCHAR(100),
  publish_date DATE,
  tags VARCHAR(20)[]
)
LANGUAGE SQL
BEGIN ATOMIC
  WITH inserted_blog AS (
    INSERT INTO public.blogs (title, description, slug, author, publish_date)
    VALUES (title, description, slug, author, publish_date)

    RETURNING id
  )

  INSERT INTO public.blog_tags (blog_id, tag_id)
  SELECT 
    ib.id, 
    t.id
  FROM inserted_blog ib
  CROSS JOIN unnest(tags) AS tag_name
  LEFT JOIN tags t ON t.name = tag_name;
END;