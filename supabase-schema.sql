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

-- Auth MVP
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    citext NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_username_format CHECK (username::text ~ '^[a-z0-9_]{3,24}$')
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles public read" ON profiles;
CREATE POLICY "profiles public read" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles owner update" ON profiles;
CREATE POLICY "profiles owner update" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_username text;
BEGIN
  requested_username := lower(trim(coalesce(new.raw_user_meta_data->>'username', '')));

  IF requested_username !~ '^[a-z0-9_]{3,24}$' THEN
    requested_username := 'user_' || replace(substr(new.id::text, 1, 8), '-', '');
  END IF;

  INSERT INTO public.profiles (id, username)
  VALUES (new.id, requested_username)
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DO $$
BEGIN
  IF to_regclass('public.pet_likes') IS NOT NULL THEN
    ALTER TABLE public.pet_likes
      ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;

    CREATE UNIQUE INDEX IF NOT EXISTS pet_likes_pet_user_unique
      ON public.pet_likes (pet_id, user_id)
      WHERE user_id IS NOT NULL;
  END IF;
END;
$$;

ALTER TABLE docs
  ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS doc_likes (
  doc_id      uuid NOT NULL REFERENCES docs(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (doc_id, user_id)
);

ALTER TABLE doc_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "doc_likes owner read" ON doc_likes;
CREATE POLICY "doc_likes owner read" ON doc_likes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "doc_likes owner insert" ON doc_likes;
CREATE POLICY "doc_likes owner insert" ON doc_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "doc_likes owner delete" ON doc_likes;
CREATE POLICY "doc_likes owner delete" ON doc_likes
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION adjust_doc_likes(p_doc_id uuid, p_delta integer)
RETURNS void AS $$
BEGIN
  UPDATE docs
  SET likes_count = greatest(0, coalesce(likes_count, 0) + p_delta)
  WHERE id = p_doc_id;
END;
$$ LANGUAGE plpgsql;
