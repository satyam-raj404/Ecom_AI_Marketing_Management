
-- Weekly KPI snapshots
CREATE TABLE public.weekly_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_of DATE NOT NULL UNIQUE,
  filled_by TEXT,
  filled_at TIMESTAMPTZ DEFAULT NOW(),
  top_reel_url TEXT,
  top_reel_platform TEXT,
  top_reel_views INTEGER DEFAULT 0,
  top_reel_thumbnail TEXT,
  best_content_type TEXT,
  best_content_reason TEXT,
  top_post_url TEXT,
  top_post_platform TEXT,
  top_post_engagement INTEGER DEFAULT 0,
  linkedin_followers INTEGER DEFAULT 0,
  instagram_followers INTEGER DEFAULT 0,
  facebook_followers INTEGER DEFAULT 0,
  x_followers INTEGER DEFAULT 0,
  new_leads INTEGER DEFAULT 0,
  demos_completed INTEGER DEFAULT 0,
  pilots_started INTEGER DEFAULT 0,
  rd_tasks_completed INTEGER DEFAULT 0,
  rd_tasks_pending INTEGER DEFAULT 0,
  rd_top_items TEXT[] DEFAULT '{}',
  amitav_tasks TEXT[] DEFAULT '{}',
  dipali_tasks TEXT[] DEFAULT '{}',
  satyam_tasks TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.customer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  quote TEXT NOT NULL,
  sentiment TEXT DEFAULT 'positive',
  source TEXT,
  added_by TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.monthly_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_year TEXT NOT NULL UNIQUE,
  demos_target INTEGER DEFAULT 50,
  leads_target INTEGER DEFAULT 150,
  emails_target INTEGER DEFAULT 2000,
  rd_tasks_target INTEGER DEFAULT 12,
  hero_metric TEXT DEFAULT 'demos',
  follower_targets JSONB DEFAULT '{"linkedin":500,"instagram":1000,"facebook":500,"x":300}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.pipeline_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  city TEXT,
  source TEXT,
  stage TEXT DEFAULT 'new',
  owner TEXT,
  notes TEXT,
  last_contacted TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.pipeline_leads(id) ON DELETE SET NULL,
  template_used TEXT,
  message_text TEXT,
  sent_by TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'sent',
  reply_text TEXT
);

CREATE TABLE public.team_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT,
  is_win BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.team_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  type TEXT,
  votes INTEGER DEFAULT 0,
  voted_by TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.reddit_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subreddit TEXT NOT NULL,
  post_title TEXT,
  post_url TEXT UNIQUE,
  author TEXT,
  keywords TEXT[] DEFAULT '{}',
  suggested_reply TEXT,
  status TEXT DEFAULT 'new',
  found_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_event_id TEXT UNIQUE,
  title TEXT NOT NULL,
  type TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  attendees TEXT[] DEFAULT '{}',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all
ALTER TABLE public.weekly_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reddit_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Shared workspace: any authenticated user full access
CREATE POLICY "Team full access" ON public.weekly_kpis FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team full access" ON public.customer_feedback FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team full access" ON public.monthly_targets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team full access" ON public.pipeline_leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team full access" ON public.whatsapp_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team full access" ON public.team_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team full access" ON public.team_ideas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team full access" ON public.reddit_opportunities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team full access" ON public.calendar_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE TRIGGER weekly_kpis_touch BEFORE UPDATE ON public.weekly_kpis
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER pipeline_leads_touch BEFORE UPDATE ON public.pipeline_leads
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER monthly_targets_touch BEFORE UPDATE ON public.monthly_targets
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Helpful indexes
CREATE INDEX idx_weekly_kpis_week ON public.weekly_kpis(week_of DESC);
CREATE INDEX idx_customer_feedback_added ON public.customer_feedback(added_at DESC);
CREATE INDEX idx_pipeline_leads_stage ON public.pipeline_leads(stage);
CREATE INDEX idx_team_notes_created ON public.team_notes(created_at DESC);
CREATE INDEX idx_team_ideas_votes ON public.team_ideas(votes DESC);
