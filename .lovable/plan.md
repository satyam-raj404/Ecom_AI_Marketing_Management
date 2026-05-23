# Team HQ — Implementation Plan

A shared workspace bolted onto the existing Content Studio. Single workspace model (any logged-in user sees everything), mobile-first, manual KPI entry.

This is a **large build**. To keep it shippable and reviewable, I'll deliver in **3 phases**. You approve this plan once, then I ship each phase end-to-end.

---

## Phase 1 — Foundation + Dashboard + Weekly Update (the core loop)

This is what you actually use every Monday. Without this, nothing else matters.

**Database** (one migration, all 9 tables):
- `weekly_kpis`, `customer_feedback`, `monthly_targets`
- `pipeline_leads`, `whatsapp_messages`
- `team_notes`, `team_ideas`, `reddit_opportunities`, `calendar_events`
- Shared-workspace RLS: `auth.role() = 'authenticated'` on all tables (any logged-in team member full access)

**Sidebar restructure**:
- Existing Content Studio items unchanged
- Visual `━━ TEAM HQ ━━` separator
- 8 new nav items with emoji icons
- Mobile bottom-nav bar (5 most-used: Dashboard, Weekly Update, Leads, Notes, Ideas)

**`/team` — Dashboard** (read-only):
- Header with "Updated X days ago by {name}" + "Update KPIs Now" button
- Hero card (marigold bg) — Demos Booked progress with days-remaining
- 2×4 KPI grid (8 cards) reading from latest `weekly_kpis` row + `monthly_targets`
- Team Activity 3-column (Amitav / Dipali / Satyam tasks from latest week)
- Friendly empty state if no week filled yet

**`/weekly-update` — Input form**:
- 6 sections (Content / Followers / Leads / R&D / Team Focus / Targets)
- Thumbnail upload → reuses existing `post-images` bucket under `weekly/` prefix
- Customer quotes inserted into `customer_feedback`
- Monthly targets locked behind 🔒 click-to-unlock
- localStorage draft auto-save (debounced) — survives refresh
- Upserts on `week_of` so re-saving same week updates the row
- Big marigold "Save & Update Dashboard" button → toast

---

## Phase 2 — Lead Hunter + Marketing + Reddit + Calendar

**`/leads` — Lead Hunter** (3 tabs + Kanban):
- ICP reminder card pinned top
- Tab 1 — LinkedIn Scraper: filter config (saved in `user_settings` or new `lead_filters` row), extension install CTA (extension itself = future work, UI ready), Manual Add Lead form
- Tab 2 — WhatsApp Broadcast: compliance warning, connection card (QR placeholder — real WhatsApp Web requires user device, we'll wire the UI + `whatsapp-send-bulk` edge function skeleton with 30-60s delay logic), 4 editable templates with `{first_name}`/`{company}`/`{city}` tokens, contact selector, live send counter
- Tab 3 — Mandi Visits: simple log form
- Bottom: 5-column Kanban (NEW → CONTACTED → DEMO → PILOT → PAID) with drag-to-move on desktop, dropdown on mobile

**`/marketing` — 4 platform strategy cards** (LinkedIn / IG / FB / X) — static content from your prior prompt, editable inline.

**`/reddit` — Reddit Outreach**:
- Keyword + subreddit config
- Opportunities feed from `reddit_opportunities`
- "Suggest reply" button per row → `reddit-suggest-reply` edge function (Claude via Lovable AI)
- `reddit-scan` edge function + pg_cron every 4h

**`/calendar`**:
- Google Calendar integration using existing `sheet_connections` Google tokens (same OAuth, add `calendar` scope)
- List view + quick-add buttons (Demo / Pilot Check-in / Team Sync)
- `google-calendar-create` edge function

---

## Phase 3 — Notes + Ideas + Pilots + Bonuses

**`/notes` — Notes & Wins**: simple list, "is_win" toggle creates Wins Wall section at top.

**`/ideas` — Idea Bank**: drop ideas, upvote (one per user via `voted_by` array), sort by votes, status pills.

**`/pilots` — Pilot Health**: traffic-light derived from `pipeline_leads` where stage='pilot' + `last_contacted` age.

**Bonuses**:
1. **Monday Standup popup** — checks `localStorage` last-shown date + IST 9am window; shows last week summary + "What's your focus?" 3-textarea modal that writes to current week's `*_tasks` arrays
2. **"What Would Sharma-ji Think?"** — floating button on /weekly-update content fields; calls Claude (Lovable AI Gateway, no extra key) with sharp-eyed wholesaler persona
3. **Pilot Health Page** — covered above

---

## Technical Details

**Stack reuse**: All new code uses existing patterns — `supabase` client from `@/integrations/supabase/client`, sonner toasts, tailwind tokens (`marigold` / `ledger` / `cream` / `khadi` / `mustard`), shadcn primitives. No new design system.

**AI**: All Claude calls go through Lovable AI Gateway (`LOVABLE_API_KEY` already set) → `google/gemini-2.5-flash` for cheap critique, no user-supplied keys needed for Team HQ AI features.

**WhatsApp reality check**: True WhatsApp Web automation needs a device-paired session (Baileys/whatsapp-web.js on a server with persistent storage). Edge functions are stateless — they can't hold a WA session. I'll build the **UI + queue + rate-limit logic + a stub edge function** that's ready to plug into either (a) WhatsApp Business Cloud API (template messages only, requires Meta approval) or (b) a self-hosted Baileys bridge you run separately. I'll flag this clearly in the UI rather than fake it.

**LinkedIn extension**: Same honesty — the extension is a separate Chrome MV3 project. I'll build the **receiving edge function** (`linkedin-import-leads`) and the in-app install/empty-state UX; the actual extension zip is a follow-up if you want it.

**Mobile-first**: Every page laid out single-column at <768px; sidebar collapses to bottom nav on mobile.

**File structure additions**:
```text
src/pages/team/
  DashboardPage.tsx
  WeeklyUpdatePage.tsx
  MarketingPage.tsx
  RedditPage.tsx
  LeadsPage.tsx
  CalendarPage.tsx
  NotesPage.tsx
  IdeasPage.tsx
  PilotsPage.tsx
src/components/team/  (KpiCard, HeroMetric, KanbanBoard, etc.)
src/hooks/  (useWeeklyKpis, useLeads, useNotes, useIdeas, ...)
supabase/functions/
  google-calendar-create/
  reddit-scan/
  reddit-suggest-reply/
  whatsapp-send-bulk/
  linkedin-import-leads/
  sharma-ji-critique/   (bonus)
```

---

## What I need from you

1. **Approve this plan** → I start Phase 1 immediately (DB migration first, then UI).
2. After Phase 1 ships and you've poked at it, say "go phase 2" and I continue.
3. Two honesty flags to acknowledge:
   - **WhatsApp**: UI + stub now; real sending needs either Meta Business API approval *or* a separate Baileys server. Tell me which path later.
   - **LinkedIn scraper**: receiving endpoint + UI now; Chrome extension is a separate follow-up build.

Ready to go on Phase 1?
