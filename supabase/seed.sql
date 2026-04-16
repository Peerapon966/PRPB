INSERT INTO public.tags
  (name)
VALUES
  ('AWS'),
  ('CDK'),
  ('CloudFront'),
  ('S3'),
  ('VPC');

WITH blog_data AS (
  SELECT * FROM (VALUES
    (
      'S3 Presigned URL VS CloudFront Signed URL',
      'อธิบายเครื่องมือ 2 อย่างจาก 2 service ที่ชื่อคล้ายจนแทบนึกว่าเป็นญาติกัน',
      's3-presigned-url-vs-cloudfront-signed-url',
      'Peerapon Boonkaweenapanon',
      '2025-04-15'::DATE,
      ARRAY['AWS', 'S3', 'CloudFront']
    ),
    (
      'เรารันคำสั่ง cdk bootstrap ไปทำไม',
      'เรารันคำสั่ง cdk bootstrap ไปทำไม รันแล้วเกิดอะไรขึ้น ไม่รันได้มั้ย',
      'what-happens-when-we-bootstrap-cdk',
      'Peerapon Boonkaweenapanon',
      '2025-03-31'::DATE,
      ARRAY['AWS', 'CDK']
    ),
    (
      'resource ที่อยู่ใน private subnet สามารถ resolve DNS หากันได้ยังไง',
      'resource ใน private subnet ที่เชื่อมต่อ internet ไม่ได้ สามารถเข้าถึง DNS resolve ได้ยังไง',
      'how-private-resources-resolve-dns',
      'Peerapon Boonkaweenapanon',
      '2025-03-13'::DATE,
      ARRAY['AWS', 'VPC']
    )
  ) AS t(title, description, slug, author, publish_date, tags)
),
inserted_blogs AS (
  INSERT INTO public.blogs (title, description, slug, author, publish_date)
  SELECT title, description, slug, author, publish_date FROM blog_data
    
  RETURNING id, slug
)

INSERT INTO public.blog_tags (blog_id, tag_id)
SELECT
  ib.id,
  t.id
FROM inserted_blogs ib
JOIN (
  SELECT 
    title,
    description,
    slug,
    author,
    publish_date,
    unnest(tags) AS tag
  FROM blog_data
) bd ON ib.slug = bd.slug
JOIN tags t ON t.name = bd.tag;

REFRESH MATERIALIZED VIEW blogs_with_tags;
