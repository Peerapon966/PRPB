CREATE TABLE IF NOT EXISTS blogs (
  id SERIAL PRIMARY KEY,
  title varchar(255),
  description TEXT,
  slug varchar(255) UNIQUE,
  author VARCHAR(100),
  tags VARCHAR(20)[],
  publish_date DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
