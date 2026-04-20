CALL insert_blog(
  p_title => 'test2',
  p_description => 'test2',
  p_slug => 's3-presigned-url-vs-cloudfront-signed-url',
  p_author => 'test2',
  p_publish_date => '2026-04-14'::DATE,
  p_tags => ARRAY['AWS', 'CDK']
);

REFRESH MATERIALIZED VIEW blogs_with_tags;