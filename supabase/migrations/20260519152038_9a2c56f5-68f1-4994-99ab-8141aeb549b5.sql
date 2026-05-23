
-- Platform OAuth connections
CREATE TABLE public.platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected',
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  platform_user_id TEXT,
  platform_username TEXT,
  connected_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform)
);
ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own platform connections" ON public.platform_connections
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Google Sheets connection
CREATE TABLE public.sheet_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sheet_url TEXT,
  sheet_id TEXT,
  sheet_name TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.sheet_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own sheet connections" ON public.sheet_connections
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Content runs log
CREATE TABLE public.content_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  current_step TEXT,
  step_progress JSONB DEFAULT '{}'::jsonb,
  linkedin_post TEXT,
  instagram_post TEXT,
  facebook_post TEXT,
  x_post TEXT,
  image_prompt TEXT,
  linkedin_image_path TEXT,
  instagram_image_path TEXT,
  facebook_image_path TEXT,
  x_image_path TEXT,
  linkedin_posted BOOLEAN DEFAULT FALSE,
  instagram_posted BOOLEAN DEFAULT FALSE,
  facebook_posted BOOLEAN DEFAULT FALSE,
  x_posted BOOLEAN DEFAULT FALSE,
  linkedin_post_url TEXT,
  instagram_post_url TEXT,
  facebook_post_url TEXT,
  x_post_url TEXT
);
ALTER TABLE public.content_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own content runs" ON public.content_runs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User settings
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anthropic_key TEXT,
  image_model_key TEXT,
  image_model_provider TEXT DEFAULT 'openai',
  auto_run_enabled BOOLEAN DEFAULT FALSE,
  auto_run_time TEXT DEFAULT '09:00',
  ai_model TEXT DEFAULT 'claude-opus-4-5',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Realtime for pipeline updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.content_runs;

-- Storage bucket for generated images
INSERT INTO storage.buckets (id, name, public)
  VALUES ('post-images', 'post-images', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read post-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');
CREATE POLICY "Users upload own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Users update own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'post-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Users delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'post-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
