CREATE TABLE IF NOT EXISTS blogs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  slug VARCHAR(255) UNIQUE,
  author VARCHAR(100),
  publish_date DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
