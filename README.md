# EcomBharat AI — Content Studio

AI-powered content automation and team operations platform for EcomBharat. Manages social media pipelines, lead tracking, team notes, ideas, and WhatsApp lead imports.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│  React + Vite + Tailwind (Frontend)             │
│  Deployed on Vercel                             │
│                                                 │
│  /team        → Team Dashboard                  │
│  /marketing   → Marketing Plan (4 platforms)    │
│  /notes       → Notes & Wins                    │
│  /calendar    → Month calendar                  │
│  /ideas       → Idea Bank + voting              │
│  /whatsapp    → WhatsApp Lead Importer          │
│  /leads       → Lead Hunter (Kanban)            │
│  /automation  → Content pipeline runner         │
│  /connectors  → OAuth platform connections      │
└─────────────┬───────────────────────────────────┘
              │ HTTPS
              ▼
┌─────────────────────────────────────────────────┐
│  FastAPI (Backend)                              │
│  Deployed on Render (free)                      │
│                                                 │
│  POST /api/whatsapp/parse   → parse .txt export │
│  POST /api/whatsapp/import  → push to pipeline  │
│  GET  /api/whatsapp/imports → import history    │
│  GET  /health               → uptime check      │
└─────────────┬───────────────────────────────────┘
              │ supabase-py (service role)
              ▼
┌─────────────────────────────────────────────────┐
│  Supabase (Database + Auth + Storage)           │
│  Project: sapyrmoxahpncrxmdgyc                  │
│                                                 │
│  Tables: pipeline_leads, team_notes, team_ideas │
│          calendar_events, whatsapp_imports      │
│          content_runs, weekly_kpis, and more    │
└─────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS |
| UI | Lucide icons, Sonner toasts, TanStack Query |
| Backend | FastAPI, Uvicorn, Python 3.12 |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Frontend Deploy | Vercel |
| Backend Deploy | Render (free tier) |

---

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.12+
- Supabase project

### 1. Clone

```bash
git clone https://github.com/satyam-raj404/Ecom_AI_Marketing_Management.git
cd Ecom_AI_Marketing_Management
```

### 2. Frontend setup

```bash
npm install
```

Create `.env` at project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-ref
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
# → http://localhost:5173
```

### 3. Backend setup

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CORS_ORIGIN=http://localhost:5173
```

```bash
# Run from project root (not inside backend/)
uvicorn backend.main:app --reload --port 8000
# → http://localhost:8000
# → Swagger UI: http://localhost:8000/docs
```

### 4. Supabase migrations

Run all `.sql` files in order in Supabase SQL Editor:

```
supabase/migrations/20260519…  → platform_connections, content_runs, user_settings
supabase/migrations/20260520…  → pipeline_leads, team_notes, team_ideas, calendar_events
supabase/migrations/20260522…  → metadata column
supabase/migrations/20260523…  → whatsapp_imports  ← run this last
```

Or via CLI:
```bash
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push
```

---

## Environment Variables

### Frontend (Vercel)

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ref ID |
| `VITE_API_URL` | FastAPI backend URL (Render URL after deploy) |

### Backend (Render)

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — bypasses RLS (keep secret) |
| `CORS_ORIGIN` | Comma-separated allowed origins e.g. `http://localhost:5173,https://yourapp.vercel.app` |

---

## Deployment

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import `Ecom_AI_Marketing_Management` from GitHub
3. Framework: **Vite** (auto-detected)
4. Add environment variables (see table above)
5. Click **Deploy**

`vercel.json` handles SPA routing rewrites and asset caching automatically.

---

### Backend → Render

#### Step 1 — Create Web Service

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect GitHub → select `Ecom_AI_Marketing_Management`
3. Render reads `render.yaml` automatically — no manual config needed

#### Step 2 — Set Environment Variables

In Render dashboard → your service → **Environment**:

| Key | Value |
|---|---|
| `SUPABASE_URL` | `https://sapyrmoxahpncrxmdgyc.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Get from Supabase → Project Settings → API → service_role |
| `CORS_ORIGIN` | `http://localhost:5173,https://your-vercel-app.vercel.app` |

#### Step 3 — Deploy

Click **Create Web Service**. First deploy takes ~3 minutes.

Your API URL: `https://ecombharat-api.onrender.com`

#### Step 4 — Update Frontend

Add the Render URL to Vercel env vars:
```
VITE_API_URL=https://ecombharat-api.onrender.com
```

Redeploy Vercel (or it auto-deploys on env var change).

#### Step 5 — Prevent Cold Starts (free tier sleeps after 15 min)

1. Go to [uptimerobot.com](https://uptimerobot.com) → free account
2. **New Monitor** → HTTP(s)
3. URL: `https://ecombharat-api.onrender.com/health`
4. Interval: **14 minutes**

This keeps the service warm 24/7 at zero cost.

---

### Supabase — Run whatsapp_imports Migration

After deploying, run this in **Supabase SQL Editor** if not done locally:

```sql
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
```

---

## Project Structure

```
├── src/
│   ├── components/layout/AppLayout.tsx   # Sidebar + mobile nav
│   ├── pages/
│   │   ├── team/
│   │   │   ├── MarketingPage.tsx         # 4 platform strategy cards + calendar
│   │   │   ├── NotesPage.tsx             # Notes & Wins tabs
│   │   │   ├── CalendarPage.tsx          # Month grid calendar
│   │   │   ├── IdeasPage.tsx             # Idea bank + voting
│   │   │   ├── WhatsAppPage.tsx          # WhatsApp lead importer
│   │   │   ├── LeadsPage.tsx             # Lead Hunter Kanban
│   │   │   └── DashboardPage.tsx         # Team dashboard
│   │   └── AutomationPage.tsx            # Content pipeline
│   ├── services/WhatsAppParser.ts        # Client-side .txt parser (fallback)
│   └── integrations/supabase/            # Supabase client + types
│
├── backend/
│   ├── main.py                           # FastAPI app + CORS
│   ├── config.py                         # Pydantic settings
│   ├── routers/whatsapp.py               # WhatsApp API routes
│   ├── services/
│   │   ├── wa_parser.py                  # Python .txt parser
│   │   └── supabase_client.py            # Supabase service-role client
│   ├── requirements.txt
│   ├── Procfile
│   └── runtime.txt                       # Python 3.12
│
├── supabase/migrations/                  # All DB schema files
├── vercel.json                           # Frontend deploy config
├── render.yaml                           # Backend deploy config
└── .gitignore                            # Excludes .env, node_modules, dist
```

---

## Test — End to End Checklist

| Check | How |
|---|---|
| Frontend builds | `npm run build` → should complete in <5s |
| Auth works | Visit `/auth`, sign up, redirects to `/team` |
| Notes save | `/notes` → add note → appears in list |
| Ideas vote | `/ideas` → submit idea → upvote → count increases |
| Calendar event | `/calendar` → add demo event → appears in month grid |
| Marketing cards | `/marketing` → click card header → expands/collapses |
| WhatsApp parse | `/whatsapp` → upload `.txt` export → contacts table appears |
| WhatsApp import | Select contacts → "Add to Lead Pipeline" → check `/leads` |
| API health | `GET https://ecombharat-api.onrender.com/health` → `{"status":"ok"}` |

---

## Team

- **Amitav** — Founder / Product
- **Dipali** — Marketing
- **Satyam** — Engineering

---

*EcomBharat — Your business brain, always on.*
