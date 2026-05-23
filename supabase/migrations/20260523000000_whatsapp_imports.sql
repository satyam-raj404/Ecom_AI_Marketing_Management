-- WhatsApp group export imports log
CREATE TABLE public.whatsapp_imports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name    TEXT,
  file_name     TEXT,
  contacts_found INTEGER DEFAULT 0,
  contacts_added INTEGER DEFAULT 0,
  imported_by   TEXT,
  imported_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.whatsapp_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team full access" ON public.whatsapp_imports
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_whatsapp_imports_at ON public.whatsapp_imports(imported_at DESC);
