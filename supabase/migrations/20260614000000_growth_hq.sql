-- Growth HQ tables (prefix ghq_ to avoid conflicts)

CREATE TABLE public.ghq_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age_range TEXT DEFAULT '',
  business TEXT DEFAULT '',
  geography TEXT DEFAULT 'Other',
  tech TEXT DEFAULT '',
  language TEXT DEFAULT '',
  pain TEXT DEFAULT '',
  trigger TEXT DEFAULT '',
  where_to_find TEXT DEFAULT '',
  hook TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ghq_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  geography TEXT DEFAULT 'Other',
  type TEXT DEFAULT 'Other',
  link TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  priority TEXT DEFAULT 'Medium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ghq_psych_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link TEXT DEFAULT '',
  niche TEXT DEFAULT '',
  trick_used TEXT DEFAULT '',
  takeaway TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ghq_content_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  ecg_type TEXT NOT NULL DEFAULT 'EVERGREEN',
  persona TEXT DEFAULT '',
  format TEXT DEFAULT 'Post',
  funnel_stage TEXT DEFAULT 'Top',
  status TEXT DEFAULT 'Idea',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ghq_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  what_they_do TEXT DEFAULT '',
  content_angle TEXT DEFAULT '',
  ads_link TEXT DEFAULT '',
  weakness TEXT DEFAULT '',
  counter TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ghq_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day TEXT NOT NULL DEFAULT '',
  platform TEXT DEFAULT '',
  ecg_type TEXT DEFAULT 'EVERGREEN',
  content TEXT DEFAULT '',
  format TEXT DEFAULT 'Post',
  status TEXT DEFAULT 'Planned',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ghq_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task TEXT NOT NULL,
  tool TEXT DEFAULT '',
  cost TEXT DEFAULT '',
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'To Do',
  owner TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ghq_scorecard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric TEXT NOT NULL,
  w1 TEXT DEFAULT '',
  w2 TEXT DEFAULT '',
  w3 TEXT DEFAULT '',
  w4 TEXT DEFAULT '',
  target TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ghq_scorecard_wins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  win_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.ghq_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghq_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghq_psych_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghq_content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghq_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghq_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghq_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghq_scorecard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghq_scorecard_wins ENABLE ROW LEVEL SECURITY;

-- Shared workspace policies
CREATE POLICY "Team full access" ON public.ghq_personas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team full access" ON public.ghq_resources FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team full access" ON public.ghq_psych_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team full access" ON public.ghq_content_ideas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team full access" ON public.ghq_competitors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team full access" ON public.ghq_calendar FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team full access" ON public.ghq_automations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team full access" ON public.ghq_scorecard FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Team full access" ON public.ghq_scorecard_wins FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Helpful indexes
CREATE INDEX idx_ghq_personas_created ON public.ghq_personas(created_at DESC);
CREATE INDEX idx_ghq_content_ideas_ecg ON public.ghq_content_ideas(ecg_type, status);
CREATE INDEX idx_ghq_automations_priority ON public.ghq_automations(priority);
CREATE INDEX idx_ghq_scorecard_order ON public.ghq_scorecard(sort_order);
CREATE INDEX idx_ghq_calendar_order ON public.ghq_calendar(sort_order);
