INSERT INTO public.tags
  (name)
VALUES
  ('AWS'),
  ('CDK'),
  ('CloudFront'),
  ('S3'),
  ('VPC');

WITH inserted_blog AS (
  INSERT INTO public.blogs (title, description, slug, author, tags, publish_date)
  VALUES
    (
      'S3 Presigned Post Request ขั้นกว่าของ S3 Presigned URL',
      'รู้จักกับ S3 Presigned URL ชุบแป้งทอด (S3 Presigned Post Request) พร้อมเหตุผลว่าทำไมการใช้ Post Request ถึงช่วยให้เราควบคุมการอัปโหลดไฟล์ได้ละเอียดกว่าเดิม',
      's3-presigned-post-request',
      'Peerapon Boonkaweenapanon',
      ARRAY['AWS', 'S3'],
      '2026-04-15'
    ),
    (
      'S3 Presigned URL VS CloudFront Signed URL',
      'อธิบายเครื่องมือ 2 อย่างจาก 2 service ที่ชื่อคล้ายจนแทบนึกว่าเป็นญาติกัน',
      's3-presigned-url-vs-cloudfront-signed-url',
      'Peerapon Boonkaweenapanon',
      ARRAY['AWS', 'S3', 'CloudFront'],
      '2025-04-15'
    ),
    (
      'เรารันคำสั่ง cdk bootstrap ไปทำไม',
      'เรารันคำสั่ง cdk bootstrap ไปทำไม รันแล้วเกิดอะไรขึ้น ไม่รันได้มั้ย',
      'what-happens-when-we-bootstrap-cdk',
      'Peerapon Boonkaweenapanon',
      ARRAY['AWS', 'CDK'],
      '2025-03-31'
    ),
    (
      'resource ที่อยู่ใน private subnet สามารถ resolve DNS หากันได้ยังไง',
      'resource ใน private subnet ที่เชื่อมต่อ internet ไม่ได้ สามารถเข้าถึง DNS resolve ได้ยังไง',
      'how-private-resources-resolve-dns',
      'Peerapon Boonkaweenapanon',
      ARRAY['AWS', 'VPC'],
      '2025-03-13'
    )
  RETURNING id, tags
)

INSERT INTO public.blog_tags (blog_id, tag_id)
SELECT
    ib.id,
    t.id
FROM inserted_blog ib
CROSS JOIN unnest(ib.tags) AS tag_name
JOIN tags t ON t.name = tag_name;
