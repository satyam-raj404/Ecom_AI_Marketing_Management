# 🛠️ CLAUDE CODE PROMPT — EcomBharat AI "Growth HQ" Team App

Copy everything below into Claude Code:

---

```
Build a simple, fast, internal web app called "EcomBharat AI — Growth HQ".

PURPOSE: My 3-person team (Satyam, Amitav, Dipali) + an intern will use this 
daily to plan content, store marketing research, build customer personas, 
track competitors, view our plans, and track what to automate. It is a 
shared internal tool — NOT customer-facing.

CRITICAL CONSTRAINTS:
- Keep it DEAD SIMPLE. We are non-technical and busy. 3 clicks max to anything.
- Single shared workspace. No login/roles needed — we trust each other. 
  (Optional: one simple shared password gate.)
- Must work on mobile (we use it from phones at mandi visits).
- Data persists (use the storage approach below). Never lose a note.
- Fast to load. Minimal dependencies.

TECH STACK:
- React + TypeScript + Vite + TailwindCSS
- For data: use Supabase (free tier) with simple tables, OR if simpler, 
  use a single Supabase or local JSON-backed store. Prefer Supabase so all 
  team members see the same data in real-time.
- No heavy libraries. Native components where possible.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BRAND DESIGN (use exactly)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--marigold: #E8703C  (primary buttons, active)
--ink: #0F3B2E       (sidebar, headers)
--mustard: #F4B740   (highlights)
--cream: #FDF8F0     (page background)
--khadi: #F4ECD9     (cards)
--text: #1A1814
--green: #2D8659     (success/done)
--red: #C44536       (alerts)
Fonts: system fonts only (Georgia for headings, system-ui for body).
Sidebar always #0F3B2E with cream text. Never pure white — use cream.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APP STRUCTURE — LEFT SIDEBAR + MAIN AREA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sidebar nav (with emoji icons):
  🎨 Content Studio   (default landing — has sub-tabs)
  📣 Marketing Plan
  🌪️ Funnel
  ⚙️ Automation
  📊 Scorecard

Top of sidebar: "EcomBharat AI" logo text + "Growth HQ" tagline in mustard.
Bottom: small "v1.0" + today's date.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 1: CONTENT STUDIO (/studio) — THE CORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This page has 5 SUB-TABS across the top (pill-style tabs):
[ Personas | Where To Find | Psychology Toolkit | ECG Categories | Competitors ]

--- SUB-TAB 1: PERSONAS ---
A persona creation + management tab.
- [+ New Persona] button (marigold)
- Clicking opens an inline form (NOT a modal) with fields:
    • Persona Name (e.g. "Sharma-ji")
    • Age range
    • Business type & size
    • Geography (dropdown: Odisha / Bengaluru / Jharkhand / Delhi / Other)
    • Tech they use today
    • Language
    • Biggest pain
    • Emotional trigger
    • Where to find them
    • Best hook for them
    • [Save Persona]
- Saved personas show as cards in a grid. Each card shows name + 
  geography badge + biggest pain. Click card to expand/edit.
- Pre-seed it with 3 personas: Sharma-ji (core FMCG wholesaler), 
  Pradhan-ji (Odisha grocery distributor), Reddy-garu (Bengaluru 
  provisions wholesaler). Use the data I'll describe — fill realistic 
  values for an Indian wholesale ICP.

--- SUB-TAB 2: WHERE TO FIND ---
A notes/resource tab — "Where can this persona be found?"
- Simple list. [+ Add Resource] button.
- Each entry: Channel/Place name, Geography, Type (dropdown: WhatsApp Group / 
  Facebook Group / Association / Mandi / Reddit / LinkedIn / YouTube / Event / 
  Other), Link (URL), Notes (textarea), Priority (High/Med/Low).
- Display as a sortable/filterable table. Filter by Geography and Priority.
- This is where the team pastes links they find during research.
- Pre-seed with: Cuttack Chamber of Commerce, Bengaluru APMC Yeshwanthpur, 
  Ranchi Chamber, "Wholesale Business India" FB group, r/IndianStartups, 
  Odia/Kannada business FB groups. (Leave links blank for team to fill.)

--- SUB-TAB 3: PSYCHOLOGY TOOLKIT ---
A database of viral hooks/tricks + a notes & resources area (Excel-like).
- TWO sections on this tab:
  SECTION A — "Hooks Database" (read-reference table):
    Pre-loaded with 18 psychology tricks. Columns: # | Trick | What It Does | 
    EcomBharat Example | Where To Use. (I'll provide the 18 — fill them in.)
    This section is reference — team reads it while writing scripts.
  SECTION B — "Team Research Notes" (editable, Excel-like):
    [+ Add Note] button. Each row: Creator/Video Link (URL), Niche, 
    What Hook/Trick They Used, Our Takeaway. 
    Team pastes links to viral videos + notes on why they worked.
    Editable inline like a spreadsheet. Auto-saves.

--- SUB-TAB 4: ECG CATEGORIES ---
Three columns side by side (Kanban-style), one per ECG type:
  [ EVERGREEN (green) | CONTROVERSY/MOMENT (amber) | GROWTH (marigold) ]
- Each column header shows the % target (Evergreen 50%, Controversy 20%, Growth 30%).
- [+ Add Idea] button under each column.
- Each idea card shows: Idea title, Persona tag, Format (Reel/Carousel/Video/
  Post), Funnel stage (Top/Mid/Bottom), Status (Idea/Scripted/Posted).
- Cards can be moved between status states (Idea → Scripted → Posted) via a 
  simple dropdown on the card (no need for fancy drag-drop, but allow it if easy).
- Pre-seed with ~30 content ideas spread across the 3 categories. (I'll 
  describe them — generate realistic EcomBharat content ideas.)

--- SUB-TAB 5: COMPETITORS ---
A competitor tracking page.
- [+ Add Competitor] button.
- Each competitor card/row: Name, What They Do, Their Content Angle, 
  Their Ads (URL field — link to their Meta Ad Library page or ad screenshots), 
  Their Weakness, Our Counter-Angle, Notes.
- Pre-seed with: Tally, Vyapar, Khatabook, OkCredit, Dukaan, Udaan, BharatPe.
- Add a helper link at top: "Check competitor ads → Meta Ad Library" 
  linking to facebook.com/ads/library.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 2: MARKETING PLAN (/marketing)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A clean read-view of our organic marketing plan (mostly static reference 
the team views). Organize as collapsible sections (use native <details>):

Section 1 — "The Mission": Build pre-launch demand wave. Target 100-200 
  pilot pre-registrations from Odisha, Bengaluru, Jharkhand. Budget <₹10K/mo.

Section 2 — "ECG Content Rule": Evergreen 50% / Controversy 20% / Growth 30%. 
  (Explain each with examples.)

Section 3 — "Platform Playbook" (table): Instagram (main, 5-7x/wk, reels), 
  Facebook (4x/wk, groups), LinkedIn (founder build-in-public, 4-5x/wk), 
  X (1-2x/day threads), WhatsApp (nurture). Include best posting times IST.

Section 4 — "Content Calendar" (editable table): Day, Platform, ECG Type, 
  Content idea, Format, Status. Pre-fill a 4-week starter calendar. 
  Team can edit/check off as posted. Auto-saves.

Section 5 — "Creator DNA": The fill-in-the-blank brand positioning statement.

Make Section 4 (calendar) the only editable one; rest are reference text.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 3: FUNNEL (/funnel)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A visual funnel showing what we offer at each stage. 
Display as 5 stacked horizontal bands (wide at top, narrow at bottom), 
each a different brand color:
  TOP — Awareness (reach): reels, memes, evergreen → "Follow/Save"
  MID — Education (trust): carousels, case studies, build-in-public → "Comment DEMO"
  BOTTOM — Capture (waitlist): Bad Debt Calculator + pilot pre-registration → "Join first 100"
  NURTURE — WhatsApp tips, community → "Reply to book demo"
  CONVERT — onboarding (at launch) → "Start pilot"
Each band shows: Goal, What We Offer, Content Type, Platform, CTA.
Below the funnel: a callout box — "Principle: Sell BEFORE you build. 
Validate with waitlist sign-ups before building heavy materials."
This page is reference (read-only is fine).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 4: AUTOMATION (/automation)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A tracker table for what needs to be automated.
Columns: What To Automate | Tool (free-first) | Cost | Priority | 
  Status (To Do / In Progress / Done) | Owner | Notes.
- Editable inline. Status as a colored dropdown (To Do=grey, 
  In Progress=amber, Done=green). Auto-saves.
- [+ Add Automation] button.
- Pre-seed with ~11 rows: content research, post scheduling (Buffer), 
  reel script gen (Claude), image gen (Gemini), AI avatars (HeyGen), 
  DM auto-reply (ManyChat), lead capture (Google Form→Sheet), WhatsApp 
  contact extraction, weekly report (Claude), nurture sequence (n8n), 
  competitor ad monitoring (Meta Ad Library). All status "To Do".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 5: SCORECARD (/scorecard)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A simple weekly metrics tracker.
- Table: Metric | Week 1 | Week 2 | Week 3 | Week 4 | Month Target.
- Rows pre-seeded: Reels posted, Carousels posted, Stories posted, 
  Best reel reach, New IG followers, DMs received, Waitlist sign-ups, 
  Calculator downloads, Demo conversations, FB groups joined, Field contacts.
- Editable cells (the week columns). Auto-saves. Target column pre-filled.
- Below: "What Worked This Month" — 3 text boxes for the team to note 
  the best-performing content/tactics. "Double down on winners."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATA & PERSISTENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use Supabase with these simple tables (all open access for our small team):
  personas (id, name, age_range, business, geography, tech, language, 
    pain, trigger, where_to_find, hook, created_at)
  resources (id, name, geography, type, link, notes, priority, created_at)
  psychology_notes (id, link, niche, trick_used, takeaway, created_at)
  content_ideas (id, title, ecg_type, persona, format, funnel_stage, 
    status, created_at)
  competitors (id, name, what_they_do, content_angle, ads_link, 
    weakness, counter, notes, created_at)
  calendar (id, day, platform, ecg_type, content, format, status)
  automations (id, task, tool, cost, priority, status, owner, notes)
  scorecard (id, metric, w1, w2, w3, w4, target)
  scorecard_wins (id, week_of, note)
Enable RLS but with a permissive "authenticated or anon can do all" policy 
since this is a tiny trusted internal team. If adding a password gate, use 
a single shared password checked client-side + Supabase anon key.

The 18 psychology hooks (hardcode as reference data in the Psychology 
Toolkit Section A): pain one-std-dev-away, twist the knife, audience of 
one ("you"), pain-solution gap, sprint to trust in 10-30s, visual proof, 
common ground, point of difference, structured list, infectious energy, 
open loop/the hunt, re-hook constantly, trans-rhythm sentence variation, 
don't-sound-like-a-hook casual, fear shown not stated, sell speed not info, 
surprise/overdeliver, recap+CTA close. For each, generate a one-line 
"what it does" + an EcomBharat-specific example.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE STRUCTURE (SOLID, one job per file)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
src/
  App.tsx                      (router only)
  components/layout/Sidebar.tsx
  pages/
    StudioPage.tsx             (holds the 5 sub-tabs)
    MarketingPage.tsx
    FunnelPage.tsx
    AutomationPage.tsx
    ScorecardPage.tsx
  components/studio/
    PersonasTab.tsx
    WhereToFindTab.tsx
    PsychologyTab.tsx
    EcgBoardTab.tsx
    CompetitorsTab.tsx
  components/shared/
    EditableTable.tsx          (reuse for all spreadsheet-like tables)
    Card.tsx
    AddButton.tsx
  lib/supabase.ts              (client + all queries)
  constants/brand.ts           (colors)
  constants/seedData.ts        (pre-seed personas, ideas, hooks, etc.)
Reuse EditableTable everywhere — don't build 5 different table UIs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Plan the whole app first, then build. Use minimal code/tokens.
- Every input auto-saves (debounced) — never a "Save" button for tables.
- Empty states are friendly: "No personas yet. Create your first! 🎯"
- Mobile-first. Sidebar collapses to a bottom bar on mobile.
- Every function: one-line comment, under 25 lines.
- Aim for under 20 files total.
```

---

## ✅ After Claude Code builds it

1. It will ask you to connect Supabase — click connect, it auto-creates tables.
2. Share the deployed URL with Satyam, Amitav, Dipali, and the intern.
3. Everyone bookmarks it. Use it daily:
   - **Satyam** → adds content ideas to ECG board, writes from Psychology Toolkit
   - **Intern** → pastes research links in "Where To Find" + "Psychology Notes"
   - **Whole team** → updates Scorecard every Friday, tracks Automation status

The Excel workbook (delivered alongside) is your **offline master plan** — the app is the **living daily tool**. Use both: plan in Excel, execute in the app.
