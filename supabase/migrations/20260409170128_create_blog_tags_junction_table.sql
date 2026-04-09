CREATE TABLE IF NOT EXISTS blog_tags (
  blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_id, tag_id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
