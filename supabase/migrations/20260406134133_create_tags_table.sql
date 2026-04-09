CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name varchar(30) UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
