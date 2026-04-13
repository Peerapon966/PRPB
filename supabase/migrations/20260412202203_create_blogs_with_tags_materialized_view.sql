CREATE MATERIALIZED VIEW blogs_with_tags AS
SELECT
  b.title,
  b.description,
  b.slug,
  b.author,
  b.publish_date,
  ARRAY_AGG(t.name) AS tags
FROM blogs b
JOIN blog_tags bt ON b.id = bt.blog_id
JOIN tags t ON bt.tag_id = t.id
GROUP BY
  b.title,
  b.description,
  b.slug,
  b.author,
  b.publish_date
ORDER BY b.publish_date DESC;

CREATE UNIQUE INDEX idx_blog_slug ON blogs_with_tags (slug);