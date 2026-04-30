-- Run this in Supabase SQL editor

CREATE TABLE docs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  slug         text NOT NULL,
  category     text NOT NULL,
  content      text NOT NULL,
  source_url   text,
  order_index  integer DEFAULT 0,
  published    boolean DEFAULT false,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  UNIQUE(category, slug)
);

-- Row Level Security
ALTER TABLE docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read" ON docs
  FOR SELECT USING (published = true);

CREATE POLICY "admin all" ON docs
  FOR ALL USING (auth.role() = 'authenticated');

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER docs_updated_at
  BEFORE UPDATE ON docs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
