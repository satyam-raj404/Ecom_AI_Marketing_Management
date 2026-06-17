import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Copy, ExternalLink, Pencil, Check, X, Plus, Trash2,
  Upload, Download, RefreshCw, Link2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

const db = supabase as any;

// ── Constants ───────────────────────────────────────────

const TABS = [
  { key: "social",    label: "Social Handles",   emoji: "📱" },
  { key: "pitchdeck", label: "Pitch Deck",        emoji: "📊" },
  { key: "prompts",   label: "Context & Prompts", emoji: "🧠" },
  { key: "brand",     label: "Brand Assets",      emoji: "🎨" },
];

const BRAND_COLORS = [
  { role: "Primary",          name: "Marigold Saffron", hex: "#E8703C" },
  { role: "Primary Dark",     name: "Deep Marigold",    hex: "#C85520" },
  { role: "Primary Light",    name: "Soft Marigold",    hex: "#F49067" },
  { role: "Secondary",        name: "Ledger Ink",       hex: "#0F3B2E" },
  { role: "Secondary Light",  name: "Forest Teal",      hex: "#1E6B52" },
  { role: "Accent",           name: "Mustard Gold",     hex: "#F4B740" },
  { role: "Background",       name: "Cream Paper",      hex: "#FDF8F0" },
  { role: "Surface",          name: "Soft Khadi",       hex: "#F4ECD9" },
  { role: "Text Primary",     name: "Ink Black",        hex: "#1A1814" },
  { role: "Text Secondary",   name: "Soft Charcoal",    hex: "#5C5449" },
  { role: "Border",           name: "Faded Line",       hex: "#E5D9C2" },
  { role: "Success",          name: "Growth Green",     hex: "#2D8659" },
  { role: "Warning",          name: "Amber Alert",      hex: "#D98F1E" },
  { role: "Danger",           name: "Risk Red",         hex: "#C44536" },
];

const FONTS = [
  { role: "Display / Headlines", name: "Fraunces",       weights: "500, 600, 700" },
  { role: "Body / UI",           name: "DM Sans",        weights: "400, 500, 600" },
  { role: "Hindi Support",       name: "Hind",           weights: "400, 500, 600" },
  { role: "Numbers / Data",      name: "JetBrains Mono", weights: "500" },
  { role: "Handwritten Accent",  name: "Caveat",         weights: "400, 600" },
];

const DEFAULT_SOCIAL = {
  social_handles: [
    { platform: "LinkedIn",   emoji: "💼", handle: "", url: "" },
    { platform: "Instagram",  emoji: "📸", handle: "", url: "" },
    { platform: "Facebook",   emoji: "👥", handle: "", url: "" },
    { platform: "X (Twitter)", emoji: "𝕏", handle: "", url: "" },
    { platform: "YouTube",    emoji: "▶️", handle: "", url: "" },
    { platform: "Website",    emoji: "🌐", handle: "ecomai.in", url: "https://ecomai.in" },
  ],
  team_emails: [
    { name: "Amitav",  role: "Founding Engineer",           email: "amitav@ecomai.in" },
    { name: "Ketan",   role: "Co-Founder (Tech/Strategy)",  email: "" },
    { name: "Satyam",  role: "Co-Founder (Brand/GTM)",      email: "" },
  ],
  whatsapp_groups: [
    { name: "", description: "", link: "" },
  ],
};

const DEFAULT_PITCH = { embed_url: "", notes: "" };

const DEFAULT_BRAND = {
  status_messages: [
    "🚀 EcomBharat AI launch ho gaya! India's first AI-powered ordering + credit system for wholesalers. Free demo book karo → [link]",
    "💡 Aapka retailer credit limit cross kar gaya? EcomBharat AI ko 8 minute lagta hai pakadne mein. 23 din nahi. Pehle hafte mein hi ₹80K bachaya!",
    "🇮🇳 12 crore wholesalers. Less than 5% digital. Hum change kar rahe hain ye. EcomBharat AI — aapka apna branded app + AI brain.",
    "📊 Tally batata hai kya hua. EcomBharat AI batata hai kya hone wala hai. Fark samjhe? Demo book karo.",
    "⚡ Apna khud ka branded ordering app. 30 minute mein live. Bina ek bhi rupya coding pe. EcomBharat AI ke saath.",
  ],
};

const PROMPT_SEED = [
  {
    title: "30-Second Reel Script",
    category: "Video",
    use_for: "Recording reels for Instagram/LinkedIn",
    content: `HOOK (0-1.5s): [Stop-scroll statement]
e.g. "₹2,40,000. Gone. He didn't even know."

PROBLEM (1.5-5s): [Make them feel the pain]
e.g. "Ye hua Rajesh-ji ke saath. Ek retailer ne limit cross ki. 3 hafte pehle. Unhe pata hi nahi chala."

TWIST (5-10s): [Solution exists]
e.g. "Aaj wahi cheez EcomBharat AI ki wajah se 8 minute mein pakad li gayi."

PROOF (10-20s): [Customer win or stat]
e.g. "11:14 AM — WhatsApp alert. 11:18 AM — supply paused. 11:22 AM — retailer called. ₹80,000 bachaya."

CTA (20-30s): [Clear next step]
e.g. "Aapke business ke liye bhi ye possible hai. Link in bio — free demo book karo."`,
    sort_order: 1,
  },
  {
    title: "LinkedIn Post — Pain Story Format",
    category: "LinkedIn",
    use_for: "Long-form LinkedIn posts (1,200-1,500 chars)",
    content: `[HOOK — first line stops scroll]
e.g. "3 years ago, Sharma-ji lost ₹2.4 lakh in one afternoon."

[PROBLEM SETUP — 2-3 lines]
A retailer of 8 years crossed the credit limit. By ₹2,40,000.
Nobody noticed. Not for 3 weeks.
By the time Sharma-ji checked the books — the retailer had shut shop.

[TWIST — what changed]
That conversation became EcomBharat AI.

[PRODUCT MOMENT — show, don't tell]
Last month, Rajesh-ji got a WhatsApp alert at 11:14 AM.
A retailer had just crossed their credit limit.
By 11:22 AM, the situation was handled.
₹80,000 saved. In 8 minutes.

[INSIGHT — the lesson]
Tally records what happened.
EcomBharat AI tells you what's happening right now.

[CTA]
If you're a wholesale distributor and this sounds familiar — DM me.
I'll show you exactly how this works.

#MSMEIndia #BuiltInIndia #EcomBharatAI #StartupIndia`,
    sort_order: 2,
  },
  {
    title: "Instagram Caption — Punchy Hook Format",
    category: "Instagram",
    use_for: "Short punchy captions for reels and carousels (100-150 chars before 'more')",
    content: `[HOOK — 1 line max, 80 chars]
e.g. "₹2,40,000 gaya. Sharma-ji ko pata bhi nahi tha. 🔴"

[2-3 line setup — Hindi/Hinglish]
8 saal purana retailer. Credit limit cross ki.
3 hafte baad pata chala.
Tab tak — dukaan band ho chuki thi.

[CTA — simple]
EcomBharat AI ye 8 minute mein pakad leta.
Link in bio 👆 Free demo book karo.

[Hashtags — 25-30, mix of:]
#EcomBharatAI #MSMEIndia #BuiltInIndia #StartupIndia
#WholesaleBusiness #DigitalBharat #SmallBusiness
#AIForBusiness #IndianStartup #Bharat`,
    sort_order: 3,
  },
  {
    title: "Facebook Post — Warm Community Format",
    category: "Facebook",
    use_for: "Facebook posts targeting MSME community groups (400-700 chars, Hinglish)",
    content: `[Relatable opener in Hinglish]
e.g. "Aaj ek baat poochhni thi apne MSME wale dosto se..."

[Problem statement — 3-4 lines]
Sharma-ji ka ek purana retailer — 8 saal ka rishtedaar —
Credit limit cross kar gaya tha. ₹2.4 lakh se.
Pata chala 3 hafte baad.
Tab tak... dukaan band ho chuki thi.

[Empathy line]
Ye kahani nahi hai. Ye reality hai hazaron wholesalers ki.

[Solution — soft sell]
Isliye banaya EcomBharat AI — jo aapke har retailer ko monitor kare, 24x7.

[CTA — community friendly]
Aapke saath aisa hua hai kabhi? Comment mein batao 👇

#EcomBharatAI #MSMEIndia`,
    sort_order: 4,
  },
  {
    title: "Apollo Cold Email — Day 0 (Pain Hook)",
    category: "Email",
    use_for: "First cold outreach email in 4-email sequence",
    content: `Subject: Quick question about [Company]'s credit tracking

Hi [First Name],

Quick question — when a retailer crosses their credit limit at [Company], how fast do you know?

Most FMCG wholesalers I speak to find out 2-3 weeks later. By which time, the damage is done.

We built EcomBharat AI specifically for this problem — real-time credit alerts, automated reminders, and a branded ordering app for your retailers.

Would a 15-minute call make sense? I can show you exactly how Rajesh Agarwal (FMCG distributor, Indore) saved ₹80K in bad debt in his first week.

[Calendar link]

Best,
[Your name]`,
    sort_order: 5,
  },
  {
    title: "Apollo Cold Email — Day 3 (Social Proof)",
    category: "Email",
    use_for: "Follow-up email Day 3 in outreach sequence",
    content: `Subject: How Rajesh-ji saved ₹80,000 in 8 minutes

Hi [First Name],

Rajesh Agarwal, FMCG wholesaler in Indore, used EcomBharat AI for the first time.

Day 1:
11:14 AM — WhatsApp alert: retailer crossed credit limit
11:18 AM — Paused next supply
11:22 AM — Called retailer to renegotiate
Result: ₹80,000 bad debt prevented in 8 minutes

Without the system: he would have found this 23 days later.

[Company] has [X] retailers. Even one default prevented pays for the platform for years.

Happy to show you how → [Calendar link]

[Your name]`,
    sort_order: 6,
  },
  {
    title: "Apollo Cold Email — Day 7 (Value Prop)",
    category: "Email",
    use_for: "Day 7 follow-up — leads who haven't responded",
    content: `Subject: What makes EcomBharat AI different

Hi [First Name],

Most software for wholesalers answers: "What happened?"
EcomBharat AI answers: "What is about to go wrong?"

Here's what you get:
→ Branded ordering app for your retailers (30-min setup)
→ Real-time credit limit alerts on WhatsApp
→ AI that predicts defaults 21 days before they happen
→ Dead stock alerts before cash is locked
→ AICA — your AI business advisor in Hindi

All for ₹500-1,500/month. Less than one bad debt write-off.

15 minutes? → [Calendar link]

[Your name]`,
    sort_order: 7,
  },
  {
    title: "Apollo Cold Email — Day 14 (Breakup)",
    category: "Email",
    use_for: "Final email Day 14 in sequence — closing the loop",
    content: `Subject: Closing the loop

Hi [First Name],

I've reached out a few times and haven't heard back — I'll assume the timing isn't right.

I'll close the loop here, but if anything changes at [Company] — especially around credit management or giving retailers a digital ordering experience — I'd love to reconnect.

Wishing [Company] a strong season ahead.

[Your name]
EcomBharat AI`,
    sort_order: 8,
  },
  {
    title: "WhatsApp Post-Demo Follow-Up",
    category: "WhatsApp",
    use_for: "Message to send within 1 hour after a demo call",
    content: `Hi [Name] ji! 🙏

Thank you for your time today — it was great understanding [Business Name]'s operations.

As discussed:
✅ Branded ordering app for your retailers
✅ Real-time credit alerts (WhatsApp)
✅ AI that catches bad debt before it happens

*Free pilot: 30 days, zero cost, full setup included.*

To get started, I just need:
1. Your business name & logo
2. 3-5 retailer contacts to onboard
3. A 20-min setup call (I handle everything)

Interested? Just reply with "YES" and I'll get things moving 🚀

— [Your name]
EcomBharat AI`,
    sort_order: 9,
  },
  {
    title: "ICP Lead Qualifier — AI Agent Prompt",
    category: "AI Agent",
    use_for: "Feed into Claude/GPT to score inbound leads automatically",
    content: `You are a lead qualifier for EcomBharat AI — an AI-powered operating system for Indian FMCG wholesalers.

Score the following lead on a scale of 0-10 based on these criteria:
- FMCG wholesale industry: +3 points
- Revenue ₹2-15 Cr: +2 points
- Pain signal present (credit/inventory/chaos mentioned): +2 points
- Decision-maker is the contact: +1 point
- Tier 1-2 city (Indore/Jaipur/Ahmedabad/Mumbai/Delhi/Pune): +1 point
- Uses Tally/basic software: +1 point

HOT LEAD (7+ points) → Route to founder for demo call
WARM LEAD (4-6) → Add to nurture sequence
COLD (<4) → Add to long-term list

Lead info:
[PASTE LEAD DETAILS HERE]

Output:
1. Score (x/10)
2. Tier (HOT/WARM/COLD)
3. Key pain signals identified
4. Recommended next action`,
    sort_order: 10,
  },
  {
    title: "AICA Daily Briefing Prompt",
    category: "AI Agent",
    use_for: "Morning business briefing sent via AICA to wholesaler",
    content: `You are AICA (AI CA Assistant) — the digital Munim-ji for [Wholesaler Name]'s business.

Generate a warm, concise morning briefing in Hinglish (Hindi + English mix). Be like a trusted younger colleague who deeply respects their 30 years of experience.

Include:
1. Good morning greeting with wholesaler's name
2. Today's order count (pending, confirmed, to dispatch)
3. Retailers who need attention (credit risk, overdue payment)
4. Top priority action for today
5. One positive business insight (best-selling product, top retailer, etc.)

Data:
[PASTE CURRENT BUSINESS DATA HERE]

Tone: Warm, respectful, practical. NOT corporate. Use "ji", "bhaisaab" naturally.
Length: Under 150 words.`,
    sort_order: 11,
  },
  {
    title: "Content Research Agent Prompt",
    category: "AI Agent",
    use_for: "Daily content research cron agent (runs at 6 AM IST via n8n)",
    content: `You are a content research agent for EcomBharat AI — an AI operating system for Indian FMCG wholesalers.

Research and return 5 content topic ideas for today based on:
1. Current MSME news / GST updates in India
2. Trending wholesale/distribution pain points
3. Seasonal context (current month/festival)
4. Competitor activity (Khatabook, Vyapar, Dukaan)
5. Viral content formats in Indian B2B space

For each idea provide:
- Headline hook (max 80 chars)
- Platform fit (LinkedIn / Instagram / Facebook / all)
- Content type (Reel / Carousel / Text post)
- Core message in 1 sentence
- Urgency rating (1-5)

Output as JSON array. Always frame content from the wholesaler's perspective, not the startup's.`,
    sort_order: 12,
  },
];

const PROMPT_CATEGORIES = ["All", "Video", "LinkedIn", "Instagram", "Facebook", "Email", "WhatsApp", "AI Agent"];

// ── Helpers ─────────────────────────────────────────────

function copyToClipboard(text: string, label = "Copied!") {
  navigator.clipboard.writeText(text).then(() => toast.success(label));
}

// Generic hook for loading/saving a section in ghq_context_data
function useContextSection<T>(section: string, defaultData: T) {
  const [data, setData] = useState<T>(defaultData);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: row } = await db
      .from("ghq_context_data")
      .select("data")
      .eq("section", section)
      .maybeSingle();
    if (row?.data) setData(row.data as T);
    setLoading(false);
  }, [section]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (newData: T) => {
    await db.from("ghq_context_data").upsert(
      { section, data: newData, updated_at: new Date().toISOString() },
      { onConflict: "section" }
    );
    setData(newData);
  }, [section]);

  return { data, setData, loading, save, reload: load };
}

// ── Tab 1: Social Handles ───────────────────────────────

type SocialHandle  = { platform: string; emoji: string; handle: string; url: string };
type TeamEmail     = { name: string; role: string; email: string };
type WhatsAppGroup = { name: string; description: string; link: string };
type SocialData    = { social_handles: SocialHandle[]; team_emails: TeamEmail[]; whatsapp_groups: WhatsAppGroup[] };

function SocialHandlesTab() {
  const { isAdmin } = useProfile();
  const { data, setData, loading, save } = useContextSection<SocialData>("social", DEFAULT_SOCIAL);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const saveAll = async () => {
    setBusy(true);
    await save(data);
    toast.success("Social handles saved");
    setEditing(false);
    setBusy(false);
  };

  const updateHandle = (i: number, field: keyof SocialHandle, val: string) =>
    setData(d => ({ ...d, social_handles: d.social_handles.map((h, j) => j === i ? { ...h, [field]: val } : h) }));

  const updateEmail = (i: number, field: keyof TeamEmail, val: string) =>
    setData(d => ({ ...d, team_emails: d.team_emails.map((e, j) => j === i ? { ...e, [field]: val } : e) }));

  const updateGroup = (i: number, field: keyof WhatsAppGroup, val: string) =>
    setData(d => ({ ...d, whatsapp_groups: d.whatsapp_groups.map((g, j) => j === i ? { ...g, [field]: val } : g) }));

  const addGroup = () =>
    setData(d => ({ ...d, whatsapp_groups: [...d.whatsapp_groups, { name: "", description: "", link: "" }] }));

  const removeGroup = (i: number) =>
    setData(d => ({ ...d, whatsapp_groups: d.whatsapp_groups.filter((_, j) => j !== i) }));

  if (loading) return <div className="text-ledger/60">Loading…</div>;

  return (
    <div className="space-y-6">
      {/* Admin controls */}
      {isAdmin && (
        <div className="flex gap-2 justify-end">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="btn-secondary text-sm"><X size={14} /> Cancel</button>
              <button onClick={saveAll} disabled={busy} className="btn-primary text-sm"><Check size={14} /> Save All</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm"><Pencil size={14} /> Edit</button>
          )}
        </div>
      )}

      {/* Social Media Handles */}
      <div className="card">
        <h2 className="text-lg font-semibold text-ledger mb-4">Social Media Handles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.social_handles.map((h, i) => (
            <div key={h.platform} className="flex items-center gap-3 p-3 rounded-xl bg-cream border border-faded">
              <span className="text-2xl w-8 text-center flex-shrink-0">{h.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-ledger/50 font-medium uppercase tracking-wider mb-0.5">{h.platform}</div>
                {editing ? (
                  <div className="space-y-1.5">
                    <input className="input py-1 text-sm" value={h.handle} onChange={e => updateHandle(i, "handle", e.target.value)} placeholder="@handle" />
                    <input className="input py-1 text-sm" value={h.url} onChange={e => updateHandle(i, "url", e.target.value)} placeholder="https://..." />
                  </div>
                ) : (
                  <div className="text-sm font-medium text-ledger truncate">{h.handle || <span className="text-ledger/30 italic">Not set</span>}</div>
                )}
              </div>
              {!editing && (h.url || h.handle) && (
                <div className="flex gap-1 flex-shrink-0">
                  {h.handle && <button onClick={() => copyToClipboard(h.handle, "Handle copied!")} className="p-1.5 rounded hover:bg-ledger/10 text-ledger/40 hover:text-ledger"><Copy size={13} /></button>}
                  {h.url && <a href={h.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-ledger/10 text-ledger/40 hover:text-marigold"><ExternalLink size={13} /></a>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Team Emails */}
      <div className="card">
        <h2 className="text-lg font-semibold text-ledger mb-4">Team Emails</h2>
        <div className="space-y-2">
          {data.team_emails.map((e, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border border-faded ${i % 2 === 0 ? "bg-cream" : "bg-white"}`}>
              <div className="w-8 h-8 rounded-full bg-marigold/20 text-marigold text-sm font-semibold flex items-center justify-center flex-shrink-0">
                {e.name[0] ?? "?"}
              </div>
              <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-2">
                {editing ? (
                  <>
                    <input className="input py-1 text-sm" value={e.name} onChange={ev => updateEmail(i, "name", ev.target.value)} placeholder="Name" />
                    <input className="input py-1 text-sm" value={e.role} onChange={ev => updateEmail(i, "role", ev.target.value)} placeholder="Role" />
                    <input className="input py-1 text-sm" value={e.email} onChange={ev => updateEmail(i, "email", ev.target.value)} placeholder="email@..." />
                  </>
                ) : (
                  <>
                    <span className="text-sm font-semibold text-ledger">{e.name}</span>
                    <span className="text-xs text-ledger/60">{e.role}</span>
                    <span className="text-sm text-ledger/80 truncate">{e.email || <span className="italic text-ledger/30">Not set</span>}</span>
                  </>
                )}
              </div>
              {!editing && e.email && (
                <button onClick={() => copyToClipboard(e.email, "Email copied!")} className="p-1.5 rounded hover:bg-ledger/10 text-ledger/40 hover:text-ledger flex-shrink-0">
                  <Copy size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp Groups */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ledger">WhatsApp Groups</h2>
          {editing && (
            <button onClick={addGroup} className="flex items-center gap-1 text-sm text-marigold">
              <Plus size={14} /> Add Group
            </button>
          )}
        </div>
        {data.whatsapp_groups.length === 0 ? (
          <p className="text-sm text-ledger/40 italic">No groups added yet.</p>
        ) : (
          <div className="space-y-3">
            {data.whatsapp_groups.map((g, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                <span className="text-2xl flex-shrink-0">💬</span>
                <div className="flex-1 min-w-0">
                  {editing ? (
                    <div className="space-y-1.5">
                      <input className="input py-1 text-sm" value={g.name} onChange={e => updateGroup(i, "name", e.target.value)} placeholder="Group name" />
                      <input className="input py-1 text-sm" value={g.description} onChange={e => updateGroup(i, "description", e.target.value)} placeholder="Description" />
                      <input className="input py-1 text-sm" value={g.link} onChange={e => updateGroup(i, "link", e.target.value)} placeholder="https://chat.whatsapp.com/..." />
                    </div>
                  ) : (
                    <>
                      <div className="text-sm font-semibold text-ledger">{g.name || <span className="italic text-ledger/30">Unnamed</span>}</div>
                      {g.description && <div className="text-xs text-ledger/60 mt-0.5">{g.description}</div>}
                    </>
                  )}
                </div>
                {!editing && g.link && (
                  <a href={g.link} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-green-100 text-green-600 flex-shrink-0">
                    <ExternalLink size={14} />
                  </a>
                )}
                {editing && (
                  <button onClick={() => removeGroup(i)} className="p-1.5 text-ledger/30 hover:text-red-500 flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab 2: Pitch Deck ───────────────────────────────────

type PitchData = { embed_url: string; notes: string };

function PitchDeckTab() {
  const { isAdmin } = useProfile();
  const { data, setData, loading, save } = useContextSection<PitchData>("pitchdeck", DEFAULT_PITCH);
  const [editingUrl, setEditingUrl] = useState(false);
  const [draftUrl, setDraftUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const saveUrl = async () => {
    setBusy(true);
    const updated = { ...data, embed_url: draftUrl.trim(), notes: data.notes };
    await save(updated);
    toast.success("Pitch deck URL saved");
    setEditingUrl(false);
    setBusy(false);
  };

  const saveNotes = async (notes: string) => {
    await save({ ...data, notes });
  };

  if (loading) return <div className="text-ledger/60">Loading…</div>;

  const hasUrl = !!data.embed_url;

  return (
    <div className="space-y-6">
      {/* URL bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-ledger">Pitch Deck</h2>
          <div className="flex gap-2">
            {data.embed_url && (
              <a href={data.embed_url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
                <ExternalLink size={14} /> Open
              </a>
            )}
            {isAdmin && !editingUrl && (
              <button onClick={() => { setDraftUrl(data.embed_url); setEditingUrl(true); }} className="btn-secondary text-sm">
                <Link2 size={14} /> {hasUrl ? "Change URL" : "Set URL"}
              </button>
            )}
          </div>
        </div>

        {editingUrl && (
          <div className="mb-4 space-y-2">
            <p className="text-xs text-ledger/60">Paste a Google Slides "Publish to web" embed URL, Canva link, or any iframe-compatible URL.</p>
            <div className="flex gap-2">
              <input
                className="input flex-1 text-sm"
                value={draftUrl}
                onChange={e => setDraftUrl(e.target.value)}
                placeholder="https://docs.google.com/presentation/d/.../embed?..."
              />
              <button onClick={saveUrl} disabled={busy} className="btn-primary text-sm"><Check size={14} /></button>
              <button onClick={() => setEditingUrl(false)} className="btn-secondary text-sm"><X size={14} /></button>
            </div>
          </div>
        )}

        {hasUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-faded bg-ledger/5" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={data.embed_url}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              title="Pitch Deck"
            />
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-ledger/20 py-16 text-center">
            <p className="text-ledger/40 text-sm">No pitch deck URL set yet.</p>
            {isAdmin && (
              <p className="text-xs text-ledger/30 mt-1">Click "Set URL" to add a Google Slides or Canva link.</p>
            )}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="card">
        <h3 className="text-base font-semibold text-ledger mb-2">Deck Notes</h3>
        <textarea
          className="input w-full resize-none"
          rows={4}
          value={data.notes}
          onChange={e => setData(d => ({ ...d, notes: e.target.value }))}
          onBlur={e => saveNotes(e.target.value)}
          placeholder="Talking points, investor names, version notes…"
        />
        <p className="text-xs text-ledger/40 mt-1">Auto-saves on blur</p>
      </div>
    </div>
  );
}

// ── Tab 3: Context & Prompts ────────────────────────────

type PromptTemplate = {
  id: string;
  title: string;
  category: string;
  use_for: string;
  content: string;
  is_builtin: boolean;
  sort_order: number;
};

function PromptsTab() {
  const { isAdmin } = useProfile();
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", category: "General", use_for: "", content: "" });
  const [addBusy, setAddBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await db.from("ghq_prompt_templates").select("*").order("sort_order").order("created_at");
    if (!data || data.length === 0) {
      // Seed built-in prompts
      await db.from("ghq_prompt_templates").insert(
        PROMPT_SEED.map(p => ({ ...p, is_builtin: true }))
      );
      const { data: seeded } = await db.from("ghq_prompt_templates").select("*").order("sort_order");
      setPrompts(seeded ?? []);
    } else {
      setPrompts(data);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addPrompt = async () => {
    if (!addForm.title.trim() || !addForm.content.trim()) { toast.error("Title and content required"); return; }
    setAddBusy(true);
    await db.from("ghq_prompt_templates").insert({ ...addForm, is_builtin: false, sort_order: 999 });
    toast.success("Template added");
    setAddForm({ title: "", category: "General", use_for: "", content: "" });
    setShowAdd(false);
    load();
    setAddBusy(false);
  };

  const deletePrompt = async (id: string) => {
    await db.from("ghq_prompt_templates").delete().eq("id", id);
    toast.success("Deleted");
    setPrompts(p => p.filter(x => x.id !== id));
  };

  const filtered = filterCat === "All" ? prompts : prompts.filter(p => p.category === filterCat);

  if (loading) return <div className="text-ledger/60">Loading…</div>;

  return (
    <div className="space-y-4">
      {/* Filter + Add */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {PROMPT_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                filterCat === cat
                  ? "bg-ledger text-cream"
                  : "bg-cream text-ledger/60 border border-ledger/15 hover:bg-khadi"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {isAdmin && (
          <button onClick={() => setShowAdd(s => !s)} className="btn-primary text-sm">
            <Plus size={14} /> Add Template
          </button>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card border-2 border-marigold/30 space-y-3">
          <h3 className="font-semibold text-ledger">New Prompt Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="label">Title</label><input className="input" value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={addForm.category} onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))}>
                {PROMPT_CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                <option>General</option>
              </select>
            </div>
          </div>
          <div><label className="label">Use for</label><input className="input" value={addForm.use_for} onChange={e => setAddForm(f => ({ ...f, use_for: e.target.value }))} placeholder="When to use this template…" /></div>
          <div><label className="label">Content</label><textarea className="input resize-none" rows={6} value={addForm.content} onChange={e => setAddForm(f => ({ ...f, content: e.target.value }))} placeholder="The prompt or template text…" /></div>
          <div className="flex gap-2">
            <button onClick={addPrompt} disabled={addBusy} className="btn-primary text-sm"><Check size={14} /> Save</button>
            <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm"><X size={14} /> Cancel</button>
          </div>
        </div>
      )}

      {/* Prompt cards */}
      {filtered.length === 0 ? (
        <p className="text-center text-ledger/40 py-12">No templates in this category.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <div key={p.id} className="card">
              <div
                className="flex items-start justify-between gap-3 cursor-pointer"
                onClick={() => setExpanded(e => e === p.id ? null : p.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-ledger">{p.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      p.is_builtin
                        ? "bg-ledger/10 text-ledger/60"
                        : "bg-marigold/15 text-marigold"
                    }`}>
                      {p.category}
                    </span>
                    {!p.is_builtin && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Custom</span>
                    )}
                  </div>
                  {p.use_for && (
                    <p className="text-xs text-ledger/50 mt-1">Use for: {p.use_for}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); copyToClipboard(p.content, "Template copied!"); }}
                    className="p-1.5 rounded hover:bg-ledger/5 text-ledger/40 hover:text-ledger"
                  >
                    <Copy size={14} />
                  </button>
                  {isAdmin && !p.is_builtin && (
                    <button
                      onClick={e => { e.stopPropagation(); deletePrompt(p.id); }}
                      className="p-1.5 rounded hover:bg-red-50 text-ledger/30 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {expanded === p.id && (
                <div className="mt-4 relative">
                  <pre className="text-sm text-ledger/80 whitespace-pre-wrap bg-cream rounded-lg p-4 font-mono border border-faded overflow-x-auto leading-relaxed">
                    {p.content}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(p.content, "Copied!")}
                    className="absolute top-3 right-3 flex items-center gap-1 text-xs px-2 py-1 rounded bg-white border border-faded text-ledger/60 hover:text-ledger hover:border-ledger/30"
                  >
                    <Copy size={11} /> Copy
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab 4: Brand Assets ─────────────────────────────────

type BrandData = { status_messages: string[] };

type StorageFile = { name: string; id: string; created_at: string };

function BrandAssetsTab() {
  const { isAdmin } = useProfile();
  const { data, setData, loading, save } = useContextSection<BrandData>("brand", DEFAULT_BRAND);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingMessages, setEditingMessages] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const loadFiles = async () => {
    setFilesLoading(true);
    const { data: list } = await supabase.storage.from("brand-assets").list("", { sortBy: { column: "created_at", order: "desc" } });
    setFiles((list as StorageFile[]) ?? []);
    setFilesLoading(false);
  };

  useEffect(() => { loadFiles(); }, []);

  const uploadFile = async (file: File) => {
    setUploading(true);
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("brand-assets").upload(path, file, { upsert: false });
    if (error) { toast.error(error.message); }
    else { toast.success(`${file.name} uploaded`); loadFiles(); }
    setUploading(false);
  };

  const downloadFile = (filename: string) => {
    const { data: { publicUrl } } = supabase.storage.from("brand-assets").getPublicUrl(filename);
    const a = document.createElement("a");
    a.href = publicUrl;
    a.download = filename;
    a.click();
  };

  const deleteFile = async (filename: string) => {
    const { error } = await supabase.storage.from("brand-assets").remove([filename]);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); loadFiles(); }
  };

  const getPublicUrl = (filename: string) =>
    supabase.storage.from("brand-assets").getPublicUrl(filename).data.publicUrl;

  const isImage = (name: string) => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(name);

  const saveMessages = async () => {
    await save(data);
    toast.success("Messages saved");
    setEditingMessages(false);
  };

  const updateMessage = (i: number, val: string) =>
    setData(d => ({ ...d, status_messages: d.status_messages.map((m, j) => j === i ? val : m) }));

  const addMessage = () =>
    setData(d => ({ ...d, status_messages: [...d.status_messages, ""] }));

  const removeMessage = (i: number) =>
    setData(d => ({ ...d, status_messages: d.status_messages.filter((_, j) => j !== i) }));

  const copyHex = (hex: string) => {
    copyToClipboard(hex, `${hex} copied!`);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  if (loading) return <div className="text-ledger/60">Loading…</div>;

  return (
    <div className="space-y-6">
      {/* Color Palette */}
      <div className="card">
        <h2 className="text-lg font-semibold text-ledger mb-4">Brand Color Palette</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {BRAND_COLORS.map(c => (
            <button
              key={c.hex}
              onClick={() => copyHex(c.hex)}
              className="group text-left rounded-xl overflow-hidden border border-faded hover:shadow-md transition"
            >
              <div className="h-12 w-full" style={{ backgroundColor: c.hex }} />
              <div className="p-2 bg-white">
                <div className="text-xs font-semibold text-ledger truncate">{c.name}</div>
                <div className="text-[10px] text-ledger/50 mt-0.5">{c.role}</div>
                <div className="text-[10px] font-mono text-ledger/60 flex items-center gap-1 mt-0.5">
                  {copiedHex === c.hex ? <span className="text-green-600">✓ Copied</span> : c.hex}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="card">
        <h2 className="text-lg font-semibold text-ledger mb-4">Typography</h2>
        <div className="space-y-2">
          {FONTS.map(f => (
            <div key={f.name} className="flex items-center justify-between py-2 border-b border-faded last:border-0">
              <div>
                <span className="text-sm font-semibold text-ledger">{f.name}</span>
                <span className="text-xs text-ledger/50 ml-2">· {f.weights}</span>
              </div>
              <span className="text-xs text-ledger/40 bg-cream px-2 py-0.5 rounded">{f.role}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-ledger/40 mt-3">
          Google Fonts: Fraunces · DM Sans · Hind · JetBrains Mono · Caveat
        </p>
      </div>

      {/* Files — Logos & Banners */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ledger">Logos & Banners</h2>
          {isAdmin && (
            <label className={`btn-primary text-sm cursor-pointer ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
              <Upload size={14} /> {uploading ? "Uploading…" : "Upload File"}
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf,.zip,.ai,.svg,.psd,.fig"
                onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0])}
              />
            </label>
          )}
        </div>
        {filesLoading ? (
          <div className="text-ledger/60 text-sm">Loading files…</div>
        ) : files.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-ledger/20 py-12 text-center">
            <p className="text-ledger/40 text-sm">No files uploaded yet.</p>
            {isAdmin && <p className="text-xs text-ledger/30 mt-1">Upload logos, banners, WhatsApp DPs, etc.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {files.map(f => (
              <div key={f.name} className="rounded-xl border border-faded bg-cream overflow-hidden group">
                {isImage(f.name) ? (
                  <div className="aspect-square bg-ledger/5 overflow-hidden">
                    <img src={getPublicUrl(f.name)} alt={f.name} className="w-full h-full object-contain p-2" />
                  </div>
                ) : (
                  <div className="aspect-square bg-ledger/5 flex items-center justify-center text-3xl">📄</div>
                )}
                <div className="p-2">
                  <p className="text-xs text-ledger font-medium truncate" title={f.name}>{f.name}</p>
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => downloadFile(f.name)} className="flex-1 text-xs py-1 rounded bg-ledger text-cream hover:bg-ledger/80 flex items-center justify-center gap-1">
                      <Download size={10} /> Save
                    </button>
                    {isAdmin && (
                      <button onClick={() => deleteFile(f.name)} className="p-1 rounded text-ledger/40 hover:text-red-500 hover:bg-red-50">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!filesLoading && (
          <button onClick={loadFiles} className="mt-3 flex items-center gap-1 text-xs text-ledger/40 hover:text-ledger">
            <RefreshCw size={11} /> Refresh
          </button>
        )}
      </div>

      {/* WhatsApp Status Messages */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ledger">WhatsApp Status Messages</h2>
          {isAdmin && (
            <div className="flex gap-2">
              {editingMessages ? (
                <>
                  <button onClick={() => setEditingMessages(false)} className="btn-secondary text-sm"><X size={14} /></button>
                  <button onClick={saveMessages} className="btn-primary text-sm"><Check size={14} /> Save</button>
                </>
              ) : (
                <button onClick={() => setEditingMessages(true)} className="btn-secondary text-sm"><Pencil size={14} /> Edit</button>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-ledger/60 mb-4">Ready-to-use WhatsApp status texts. Click to copy.</p>
        <div className="space-y-3">
          {data.status_messages.map((msg, i) => (
            <div key={i} className="rounded-xl bg-green-50 border border-green-100 p-3">
              {editingMessages ? (
                <div className="flex gap-2">
                  <textarea
                    className="input flex-1 resize-none text-sm"
                    rows={3}
                    value={msg}
                    onChange={e => updateMessage(i, e.target.value)}
                  />
                  <button onClick={() => removeMessage(i)} className="p-1.5 text-ledger/30 hover:text-red-500 self-start">
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <p className="flex-1 text-sm text-ledger/80 leading-relaxed">{msg}</p>
                  <button
                    onClick={() => copyToClipboard(msg, "Status copied!")}
                    className="p-1.5 rounded hover:bg-green-100 text-green-600 flex-shrink-0 self-start"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
          {editingMessages && (
            <button onClick={addMessage} className="flex items-center gap-1 text-sm text-marigold">
              <Plus size={14} /> Add Message
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────

export default function EcomAIContextPage() {
  const [tab, setTab] = useState("social");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl text-ledger">📋 ECOM AI Context</h1>
        <p className="text-sm text-ledger/60">
          Central hub — social handles, pitch deck, prompt library, and brand assets.
        </p>
      </header>

      {/* Tab pills */}
      <div className="flex flex-wrap gap-2 border-b border-ledger/10 pb-3">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === t.key
                ? "bg-ledger text-cream"
                : "bg-cream text-ledger/70 hover:bg-khadi border border-ledger/15"
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <div>
        {tab === "social"    && <SocialHandlesTab />}
        {tab === "pitchdeck" && <PitchDeckTab />}
        {tab === "prompts"   && <PromptsTab />}
        {tab === "brand"     && <BrandAssetsTab />}
      </div>
    </div>
  );
}
