import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Copy, ExternalLink, Pencil, Check, X, Plus, Trash2,
  Upload, Download, RefreshCw, Link2, Smartphone, Mail,
  MessageCircle, FileText, Brain, Palette, LayoutDashboard,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

const db = supabase as any;

// ── Constants ────────────────────────────────────────────

const TABS = [
  { key: "social",    label: "Social Handles",   icon: Smartphone,     desc: "Handles, team emails, WA groups" },
  { key: "pitchdeck", label: "Pitch Deck",        icon: LayoutDashboard, desc: "Investor deck + notes" },
  { key: "prompts",   label: "Context & Prompts", icon: Brain,          desc: "Template library" },
  { key: "brand",     label: "Brand Assets",      icon: Palette,        desc: "Colors, fonts, files" },
];

const PLATFORM_STYLE: Record<string, { bg: string; border: string; text: string }> = {
  LinkedIn:    { bg: "bg-blue-50",   border: "border-l-blue-400",   text: "text-blue-700" },
  Instagram:   { bg: "bg-pink-50",   border: "border-l-pink-400",   text: "text-pink-700" },
  Facebook:    { bg: "bg-indigo-50", border: "border-l-indigo-400", text: "text-indigo-700" },
  "X (Twitter)":{ bg:"bg-slate-50", border: "border-l-slate-400",  text: "text-slate-700" },
  YouTube:     { bg: "bg-red-50",    border: "border-l-red-400",    text: "text-red-700" },
  Website:     { bg: "bg-emerald-50",border: "border-l-emerald-400",text: "text-emerald-700" },
};

const CAT_COLOR: Record<string, string> = {
  Video:     "bg-red-100 text-red-700",
  LinkedIn:  "bg-blue-100 text-blue-700",
  Instagram: "bg-pink-100 text-pink-700",
  Facebook:  "bg-indigo-100 text-indigo-700",
  Email:     "bg-amber-100 text-amber-700",
  WhatsApp:  "bg-emerald-100 text-emerald-700",
  "AI Agent":"bg-violet-100 text-violet-700",
  General:   "bg-slate-100 text-slate-600",
};

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
  { role: "Display / Headlines", name: "Fraunces",       weights: "500, 600, 700", sample: "EcomBharat AI" },
  { role: "Body / UI",           name: "DM Sans",        weights: "400, 500, 600", sample: "Wholesale distributor dashboard" },
  { role: "Hindi Support",       name: "Hind",           weights: "400, 500, 600", sample: "आपका व्यापार, हमारी AI" },
  { role: "Numbers / Data",      name: "JetBrains Mono", weights: "500",           sample: "₹2,40,000 → ₹0 bad debt" },
  { role: "Handwritten Accent",  name: "Caveat",         weights: "400, 600",      sample: "Made in Bharat" },
];

const DEFAULT_SOCIAL = {
  social_handles: [
    { platform: "LinkedIn",    emoji: "💼", handle: "", url: "" },
    { platform: "Instagram",   emoji: "📸", handle: "", url: "" },
    { platform: "Facebook",    emoji: "👥", handle: "", url: "" },
    { platform: "X (Twitter)", emoji: "𝕏",  handle: "", url: "" },
    { platform: "YouTube",     emoji: "▶️", handle: "", url: "" },
    { platform: "Website",     emoji: "🌐", handle: "ecomai.in", url: "https://ecomai.in" },
  ],
  team_emails: [
    { name: "Amitav", role: "Founding Engineer",          email: "amitav@ecomai.in" },
    { name: "Ketan",  role: "Co-Founder (Tech/Strategy)", email: "" },
    { name: "Satyam", role: "Co-Founder (Brand/GTM)",     email: "" },
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
  { title: "30-Second Reel Script", category: "Video", use_for: "Recording reels for Instagram/LinkedIn", content: `HOOK (0-1.5s): [Stop-scroll statement]\ne.g. "₹2,40,000. Gone. He didn't even know."\n\nPROBLEM (1.5-5s): [Make them feel the pain]\ne.g. "Ye hua Rajesh-ji ke saath. Ek retailer ne limit cross ki. 3 hafte pehle. Unhe pata hi nahi chala."\n\nTWIST (5-10s): [Solution exists]\ne.g. "Aaj wahi cheez EcomBharat AI ki wajah se 8 minute mein pakad li gayi."\n\nPROOF (10-20s): [Customer win or stat]\ne.g. "11:14 AM — WhatsApp alert. 11:18 AM — supply paused. 11:22 AM — retailer called. ₹80,000 bachaya."\n\nCTA (20-30s): [Clear next step]\ne.g. "Aapke business ke liye bhi ye possible hai. Link in bio — free demo book karo."`, sort_order: 1 },
  { title: "LinkedIn Post — Pain Story Format", category: "LinkedIn", use_for: "Long-form LinkedIn posts (1,200-1,500 chars)", content: `[HOOK — first line stops scroll]\ne.g. "3 years ago, Sharma-ji lost ₹2.4 lakh in one afternoon."\n\n[PROBLEM SETUP — 2-3 lines]\nA retailer of 8 years crossed the credit limit. By ₹2,40,000.\nNobody noticed. Not for 3 weeks.\nBy the time Sharma-ji checked the books — the retailer had shut shop.\n\n[TWIST — what changed]\nThat conversation became EcomBharat AI.\n\n[PRODUCT MOMENT — show, don't tell]\nLast month, Rajesh-ji got a WhatsApp alert at 11:14 AM.\nA retailer had just crossed their credit limit.\nBy 11:22 AM, the situation was handled.\n₹80,000 saved. In 8 minutes.\n\n[INSIGHT — the lesson]\nTally records what happened.\nEcomBharat AI tells you what's happening right now.\n\n[CTA]\nIf you're a wholesale distributor and this sounds familiar — DM me.\nI'll show you exactly how this works.\n\n#MSMEIndia #BuiltInIndia #EcomBharatAI #StartupIndia`, sort_order: 2 },
  { title: "Instagram Caption — Punchy Hook Format", category: "Instagram", use_for: "Short punchy captions for reels and carousels", content: `[HOOK — 1 line max, 80 chars]\ne.g. "₹2,40,000 gaya. Sharma-ji ko pata bhi nahi tha. 🔴"\n\n[2-3 line setup — Hindi/Hinglish]\n8 saal purana retailer. Credit limit cross ki.\n3 hafte baad pata chala.\nTab tak — dukaan band ho chuki thi.\n\n[CTA — simple]\nEcomBharat AI ye 8 minute mein pakad leta.\nLink in bio 👆 Free demo book karo.\n\n[Hashtags]\n#EcomBharatAI #MSMEIndia #BuiltInIndia #StartupIndia\n#WholesaleBusiness #DigitalBharat #SmallBusiness\n#AIForBusiness #IndianStartup #Bharat`, sort_order: 3 },
  { title: "Facebook Post — Warm Community Format", category: "Facebook", use_for: "Facebook posts targeting MSME community groups", content: `[Relatable opener in Hinglish]\ne.g. "Aaj ek baat poochhni thi apne MSME wale dosto se..."\n\n[Problem statement — 3-4 lines]\nSharma-ji ka ek purana retailer — 8 saal ka rishtedaar —\nCredit limit cross kar gaya tha. ₹2.4 lakh se.\nPata chala 3 hafte baad.\nTab tak... dukaan band ho chuki thi.\n\n[Empathy line]\nYe kahani nahi hai. Ye reality hai hazaron wholesalers ki.\n\n[Solution — soft sell]\nIsliye banaya EcomBharat AI — jo aapke har retailer ko monitor kare, 24x7.\n\n[CTA — community friendly]\nAapke saath aisa hua hai kabhi? Comment mein batao 👇\n\n#EcomBharatAI #MSMEIndia`, sort_order: 4 },
  { title: "Apollo Cold Email — Day 0 (Pain Hook)", category: "Email", use_for: "First cold outreach email in 4-email sequence", content: `Subject: Quick question about [Company]'s credit tracking\n\nHi [First Name],\n\nQuick question — when a retailer crosses their credit limit at [Company], how fast do you know?\n\nMost FMCG wholesalers I speak to find out 2-3 weeks later. By which time, the damage is done.\n\nWe built EcomBharat AI specifically for this problem — real-time credit alerts, automated reminders, and a branded ordering app for your retailers.\n\nWould a 15-minute call make sense? I can show you exactly how Rajesh Agarwal (FMCG distributor, Indore) saved ₹80K in bad debt in his first week.\n\n[Calendar link]\n\nBest,\n[Your name]`, sort_order: 5 },
  { title: "Apollo Cold Email — Day 3 (Social Proof)", category: "Email", use_for: "Follow-up email Day 3 in outreach sequence", content: `Subject: How Rajesh-ji saved ₹80,000 in 8 minutes\n\nHi [First Name],\n\nRajesh Agarwal, FMCG wholesaler in Indore, used EcomBharat AI for the first time.\n\nDay 1:\n11:14 AM — WhatsApp alert: retailer crossed credit limit\n11:18 AM — Paused next supply\n11:22 AM — Called retailer to renegotiate\nResult: ₹80,000 bad debt prevented in 8 minutes\n\nWithout the system: he would have found this 23 days later.\n\n[Company] has [X] retailers. Even one default prevented pays for the platform for years.\n\nHappy to show you how → [Calendar link]\n\n[Your name]`, sort_order: 6 },
  { title: "Apollo Cold Email — Day 7 (Value Prop)", category: "Email", use_for: "Day 7 follow-up — leads who haven't responded", content: `Subject: What makes EcomBharat AI different\n\nHi [First Name],\n\nMost software for wholesalers answers: "What happened?"\nEcomBharat AI answers: "What is about to go wrong?"\n\nHere's what you get:\n→ Branded ordering app for your retailers (30-min setup)\n→ Real-time credit limit alerts on WhatsApp\n→ AI that predicts defaults 21 days before they happen\n→ Dead stock alerts before cash is locked\n→ AICA — your AI business advisor in Hindi\n\nAll for ₹500-1,500/month. Less than one bad debt write-off.\n\n15 minutes? → [Calendar link]\n\n[Your name]`, sort_order: 7 },
  { title: "Apollo Cold Email — Day 14 (Breakup)", category: "Email", use_for: "Final email Day 14 in sequence — closing the loop", content: `Subject: Closing the loop\n\nHi [First Name],\n\nI've reached out a few times and haven't heard back — I'll assume the timing isn't right.\n\nI'll close the loop here, but if anything changes at [Company] — especially around credit management or giving retailers a digital ordering experience — I'd love to reconnect.\n\nWishing [Company] a strong season ahead.\n\n[Your name]\nEcomBharat AI`, sort_order: 8 },
  { title: "WhatsApp Post-Demo Follow-Up", category: "WhatsApp", use_for: "Message to send within 1 hour after a demo call", content: `Hi [Name] ji! 🙏\n\nThank you for your time today — it was great understanding [Business Name]'s operations.\n\nAs discussed:\n✅ Branded ordering app for your retailers\n✅ Real-time credit alerts (WhatsApp)\n✅ AI that catches bad debt before it happens\n\n*Free pilot: 30 days, zero cost, full setup included.*\n\nTo get started, I just need:\n1. Your business name & logo\n2. 3-5 retailer contacts to onboard\n3. A 20-min setup call (I handle everything)\n\nInterested? Just reply with "YES" and I'll get things moving 🚀\n\n— [Your name]\nEcomBharat AI`, sort_order: 9 },
  { title: "ICP Lead Qualifier — AI Agent Prompt", category: "AI Agent", use_for: "Feed into Claude/GPT to score inbound leads automatically", content: `You are a lead qualifier for EcomBharat AI — an AI-powered operating system for Indian FMCG wholesalers.\n\nScore the following lead on a scale of 0-10 based on these criteria:\n- FMCG wholesale industry: +3 points\n- Revenue ₹2-15 Cr: +2 points\n- Pain signal present (credit/inventory/chaos mentioned): +2 points\n- Decision-maker is the contact: +1 point\n- Tier 1-2 city (Indore/Jaipur/Ahmedabad/Mumbai/Delhi/Pune): +1 point\n- Uses Tally/basic software: +1 point\n\nHOT LEAD (7+ points) → Route to founder for demo call\nWARM LEAD (4-6) → Add to nurture sequence\nCOLD (<4) → Add to long-term list\n\nLead info:\n[PASTE LEAD DETAILS HERE]\n\nOutput:\n1. Score (x/10)\n2. Tier (HOT/WARM/COLD)\n3. Key pain signals identified\n4. Recommended next action`, sort_order: 10 },
  { title: "AICA Daily Briefing Prompt", category: "AI Agent", use_for: "Morning business briefing sent via AICA to wholesaler", content: `You are AICA (AI CA Assistant) — the digital Munim-ji for [Wholesaler Name]'s business.\n\nGenerate a warm, concise morning briefing in Hinglish (Hindi + English mix). Be like a trusted younger colleague who deeply respects their 30 years of experience.\n\nInclude:\n1. Good morning greeting with wholesaler's name\n2. Today's order count (pending, confirmed, to dispatch)\n3. Retailers who need attention (credit risk, overdue payment)\n4. Top priority action for today\n5. One positive business insight (best-selling product, top retailer, etc.)\n\nData:\n[PASTE CURRENT BUSINESS DATA HERE]\n\nTone: Warm, respectful, practical. NOT corporate. Use "ji", "bhaisaab" naturally.\nLength: Under 150 words.`, sort_order: 11 },
  { title: "Content Research Agent Prompt", category: "AI Agent", use_for: "Daily content research cron agent (runs at 6 AM IST via n8n)", content: `You are a content research agent for EcomBharat AI — an AI operating system for Indian FMCG wholesalers.\n\nResearch and return 5 content topic ideas for today based on:\n1. Current MSME news / GST updates in India\n2. Trending wholesale/distribution pain points\n3. Seasonal context (current month/festival)\n4. Competitor activity (Khatabook, Vyapar, Dukaan)\n5. Viral content formats in Indian B2B space\n\nFor each idea provide:\n- Headline hook (max 80 chars)\n- Platform fit (LinkedIn / Instagram / Facebook / all)\n- Content type (Reel / Carousel / Text post)\n- Core message in 1 sentence\n- Urgency rating (1-5)\n\nOutput as JSON array. Always frame content from the wholesaler's perspective, not the startup's.`, sort_order: 12 },
];

const PROMPT_CATEGORIES = ["All", "Video", "LinkedIn", "Instagram", "Facebook", "Email", "WhatsApp", "AI Agent"];

// ── Helpers ──────────────────────────────────────────────

function copyText(text: string, label = "Copied!") {
  navigator.clipboard.writeText(text).then(() => toast.success(label));
}

function useContextSection<T>(section: string, defaultData: T) {
  const [data, setData] = useState<T>(defaultData);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: row } = await db.from("ghq_context_data").select("data").eq("section", section).maybeSingle();
    if (row?.data) setData(row.data as T);
    setLoading(false);
  }, [section]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (newData: T) => {
    await db.from("ghq_context_data").upsert({ section, data: newData }, { onConflict: "section" });
    setData(newData);
  }, [section]);

  return { data, setData, loading, save, reload: load };
}

// ── Tab 1: Social Handles ────────────────────────────────

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
    toast.success("Saved");
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

  if (loading) return <div className="text-ledger/50 text-sm">Loading…</div>;

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex gap-2 justify-end">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="btn-secondary text-sm flex items-center gap-1"><X size={14} /> Cancel</button>
              <button onClick={saveAll} disabled={busy} className="btn-primary text-sm flex items-center gap-1"><Check size={14} /> Save All</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm flex items-center gap-1"><Pencil size={14} /> Edit</button>
          )}
        </div>
      )}

      {/* Social Handles */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Smartphone size={16} className="text-marigold" />
          <h2 className="font-semibold text-ledger">Social Media Handles</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {data.social_handles.map((h, i) => {
            const style = PLATFORM_STYLE[h.platform] ?? { bg: "bg-slate-50", border: "border-l-slate-300", text: "text-slate-700" };
            return (
              <div key={h.platform} className={`flex items-center gap-3 p-3 rounded-xl border-l-4 border border-ledger/8 ${style.bg} ${style.border}`}>
                <span className="text-xl w-7 text-center flex-shrink-0">{h.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${style.text}`}>{h.platform}</div>
                  {editing ? (
                    <div className="space-y-1.5">
                      <input className="input py-1 text-sm bg-white" value={h.handle} onChange={e => updateHandle(i, "handle", e.target.value)} placeholder="@handle" />
                      <input className="input py-1 text-sm bg-white" value={h.url} onChange={e => updateHandle(i, "url", e.target.value)} placeholder="https://..." />
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-ledger truncate">
                      {h.handle || <span className="text-ledger/30 italic text-xs">Not set</span>}
                    </div>
                  )}
                </div>
                {!editing && (h.url || h.handle) && (
                  <div className="flex gap-1 flex-shrink-0">
                    {h.handle && <button onClick={() => copyText(h.handle, "Handle copied!")} className="p-1.5 rounded-lg hover:bg-white/80 text-ledger/40 hover:text-ledger transition"><Copy size={13} /></button>}
                    {h.url && <a href={h.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-white/80 text-ledger/40 hover:text-marigold transition"><ExternalLink size={13} /></a>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Emails */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Mail size={16} className="text-marigold" />
          <h2 className="font-semibold text-ledger">Team Emails</h2>
        </div>
        <div className="rounded-2xl border border-ledger/10 bg-white overflow-hidden shadow-sm">
          {data.team_emails.map((e, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-ledger/5" : ""}`}>
              <div className="w-9 h-9 rounded-full bg-marigold/15 text-marigold text-sm font-bold flex items-center justify-center flex-shrink-0">
                {e.name[0] ?? "?"}
              </div>
              {editing ? (
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <input className="input py-1 text-sm" value={e.name} onChange={ev => updateEmail(i, "name", ev.target.value)} placeholder="Name" />
                  <input className="input py-1 text-sm" value={e.role} onChange={ev => updateEmail(i, "role", ev.target.value)} placeholder="Role" />
                  <input className="input py-1 text-sm" value={e.email} onChange={ev => updateEmail(i, "email", ev.target.value)} placeholder="email@..." />
                </div>
              ) : (
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-1">
                  <span className="text-sm font-semibold text-ledger">{e.name}</span>
                  <span className="text-xs text-ledger/50 self-center">{e.role}</span>
                  <span className="text-sm text-ledger/70 truncate self-center">{e.email || <span className="italic text-ledger/30">Not set</span>}</span>
                </div>
              )}
              {!editing && e.email && (
                <button onClick={() => copyText(e.email, "Email copied!")} className="p-1.5 rounded-lg hover:bg-cream text-ledger/30 hover:text-ledger flex-shrink-0 transition">
                  <Copy size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp Groups */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-emerald-500" />
            <h2 className="font-semibold text-ledger">WhatsApp Groups</h2>
          </div>
          {editing && (
            <button onClick={addGroup} className="flex items-center gap-1 text-sm text-marigold hover:underline">
              <Plus size={14} /> Add Group
            </button>
          )}
        </div>
        {data.whatsapp_groups.length === 0 ? (
          <p className="text-sm text-ledger/40 italic">No groups added yet.</p>
        ) : (
          <div className="space-y-2">
            {data.whatsapp_groups.map((g, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  {editing ? (
                    <div className="space-y-1.5">
                      <input className="input py-1 text-sm bg-white" value={g.name} onChange={e => updateGroup(i, "name", e.target.value)} placeholder="Group name" />
                      <input className="input py-1 text-sm bg-white" value={g.description} onChange={e => updateGroup(i, "description", e.target.value)} placeholder="Description" />
                      <input className="input py-1 text-sm bg-white" value={g.link} onChange={e => updateGroup(i, "link", e.target.value)} placeholder="https://chat.whatsapp.com/..." />
                    </div>
                  ) : (
                    <>
                      <div className="text-sm font-semibold text-ledger">{g.name || <span className="italic text-ledger/30">Unnamed group</span>}</div>
                      {g.description && <div className="text-xs text-ledger/60 mt-0.5">{g.description}</div>}
                    </>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {!editing && g.link && (
                    <a href={g.link} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition">
                      <ExternalLink size={14} />
                    </a>
                  )}
                  {editing && (
                    <button onClick={() => removeGroup(i)} className="p-1.5 text-ledger/30 hover:text-red-500 transition">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab 2: Pitch Deck ────────────────────────────────────

type PitchData = { embed_url: string; notes: string };

function PitchDeckTab() {
  const { isAdmin } = useProfile();
  const { data, setData, loading, save } = useContextSection<PitchData>("pitchdeck", DEFAULT_PITCH);
  const [editingUrl, setEditingUrl] = useState(false);
  const [draftUrl, setDraftUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const saveUrl = async () => {
    setBusy(true);
    await save({ ...data, embed_url: draftUrl.trim() });
    toast.success("Pitch deck URL saved");
    setEditingUrl(false);
    setBusy(false);
  };

  if (loading) return <div className="text-ledger/50 text-sm">Loading…</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-semibold text-ledger">Pitch Deck</h2>
          <p className="text-xs text-ledger/50 mt-0.5">Embed a Google Slides, Canva, or any shareable deck URL</p>
        </div>
        <div className="flex gap-2">
          {data.embed_url && (
            <a href={data.embed_url} target="_blank" rel="noopener noreferrer"
              className="btn-secondary text-sm flex items-center gap-1.5">
              <ExternalLink size={14} /> Open
            </a>
          )}
          {isAdmin && (
            <button onClick={() => { setDraftUrl(data.embed_url); setEditingUrl(v => !v); }}
              className="btn-secondary text-sm flex items-center gap-1.5">
              <Link2 size={14} /> {data.embed_url ? "Change URL" : "Set URL"}
            </button>
          )}
        </div>
      </div>

      {editingUrl && (
        <div className="rounded-2xl border border-marigold/30 bg-white p-4 space-y-3">
          <p className="text-xs text-ledger/60">Paste a Google Slides "Publish to web" embed URL or Canva share link.</p>
          <div className="flex gap-2">
            <input className="input flex-1 text-sm" value={draftUrl}
              onChange={e => setDraftUrl(e.target.value)}
              placeholder="https://docs.google.com/presentation/d/.../embed?..." />
            <button onClick={saveUrl} disabled={busy} className="btn-primary text-sm"><Check size={14} /></button>
            <button onClick={() => setEditingUrl(false)} className="btn-secondary text-sm"><X size={14} /></button>
          </div>
        </div>
      )}

      {data.embed_url ? (
        <div className="rounded-2xl overflow-hidden border border-ledger/10 shadow-sm" style={{ paddingBottom: "56.25%", position: "relative" }}>
          <iframe src={data.embed_url} className="absolute inset-0 w-full h-full" allowFullScreen title="Pitch Deck" />
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-ledger/15 py-20 text-center bg-cream/30">
          <LayoutDashboard size={32} className="mx-auto text-ledger/20 mb-3" />
          <p className="text-ledger/40 text-sm font-medium">No pitch deck linked yet</p>
          {isAdmin && <p className="text-xs text-ledger/30 mt-1">Click "Set URL" to embed a Google Slides or Canva deck</p>}
        </div>
      )}

      <div className="rounded-2xl border border-ledger/10 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-ledger mb-2">Deck Notes</h3>
        <textarea
          className="input w-full resize-none"
          rows={4}
          value={data.notes}
          onChange={e => setData(d => ({ ...d, notes: e.target.value }))}
          onBlur={e => save({ ...data, notes: e.target.value })}
          placeholder="Talking points, investor names, version notes… (auto-saves)"
        />
        <p className="text-[10px] text-ledger/30 mt-1">Auto-saves on blur</p>
      </div>
    </div>
  );
}

// ── Tab 3: Prompts ───────────────────────────────────────

type PromptTemplate = { id: string; title: string; category: string; use_for: string; content: string; is_builtin: boolean; sort_order: number };

function PromptsTab() {
  const { isAdmin } = useProfile();
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", category: "General", use_for: "", content: "" });

  const load = async () => {
    setLoading(true);
    const { data } = await db.from("ghq_prompt_templates").select("*").order("sort_order").order("created_at");
    if (!data || data.length === 0) {
      await db.from("ghq_prompt_templates").insert(PROMPT_SEED.map(p => ({ ...p, is_builtin: true })));
      const { data: seeded } = await db.from("ghq_prompt_templates").select("*").order("sort_order");
      setPrompts(seeded ?? []);
    } else {
      setPrompts(data);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCopy = (id: string, content: string) => {
    copyText(content, "Template copied!");
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const addPrompt = async () => {
    if (!addForm.title.trim() || !addForm.content.trim()) { toast.error("Title and content required"); return; }
    await db.from("ghq_prompt_templates").insert({ ...addForm, is_builtin: false, sort_order: 999 });
    toast.success("Template added");
    setAddForm({ title: "", category: "General", use_for: "", content: "" });
    setShowAdd(false);
    load();
  };

  const deletePrompt = async (id: string) => {
    await db.from("ghq_prompt_templates").delete().eq("id", id);
    setPrompts(p => p.filter(x => x.id !== id));
    toast.success("Deleted");
  };

  const filtered = filterCat === "All" ? prompts : prompts.filter(p => p.category === filterCat);

  if (loading) return <div className="text-ledger/50 text-sm">Loading…</div>;

  return (
    <div className="space-y-4">
      {/* Filter + Add */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {PROMPT_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition border ${
                filterCat === cat
                  ? "bg-ledger text-cream border-ledger"
                  : "border-ledger/15 text-ledger/60 hover:bg-khadi"
              }`}>
              {cat}
              {cat !== "All" && (
                <span className="ml-1 opacity-50">{prompts.filter(p => p.category === cat).length}</span>
              )}
            </button>
          ))}
        </div>
        {isAdmin && (
          <button onClick={() => setShowAdd(s => !s)} className="btn-primary text-sm flex items-center gap-1.5">
            <Plus size={14} /> Add Template
          </button>
        )}
      </div>

      {showAdd && (
        <div className="rounded-2xl border border-marigold/30 bg-white p-5 shadow-sm space-y-3">
          <h3 className="font-semibold text-ledger">New Prompt Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="label">Title</label>
              <input className="input" value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><label className="label">Category</label>
              <select className="input" value={addForm.category} onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))}>
                {[...PROMPT_CATEGORIES.slice(1), "General"].map(c => <option key={c}>{c}</option>)}
              </select></div>
          </div>
          <div><label className="label">Use for</label>
            <input className="input" value={addForm.use_for} onChange={e => setAddForm(f => ({ ...f, use_for: e.target.value }))} placeholder="When to use this…" /></div>
          <div><label className="label">Content</label>
            <textarea className="input resize-none" rows={6} value={addForm.content} onChange={e => setAddForm(f => ({ ...f, content: e.target.value }))} /></div>
          <div className="flex gap-2">
            <button onClick={addPrompt} className="btn-primary text-sm">Save Template</button>
            <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-ledger/40">
          <Brain size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No templates in this category.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(p => (
            <div key={p.id} className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition ${expanded === p.id ? "border-marigold/40 ring-1 ring-marigold/20" : "border-ledger/8"}`}>
              {/* Card header */}
              <div className="px-4 py-3.5 flex items-start gap-3 cursor-pointer"
                onClick={() => setExpanded(e => e === p.id ? null : p.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-ledger text-sm">{p.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CAT_COLOR[p.category] ?? CAT_COLOR.General}`}>
                      {p.category}
                    </span>
                    {!p.is_builtin && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-marigold/15 text-marigold font-medium">Custom</span>
                    )}
                  </div>
                  {p.use_for && (
                    <p className="text-xs text-ledger/50 mt-1 line-clamp-1">{p.use_for}</p>
                  )}
                  {expanded !== p.id && (
                    <p className="text-xs text-ledger/40 mt-1.5 line-clamp-1 font-mono">
                      {p.content.split("\n")[0]}
                    </p>
                  )}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handleCopy(p.id, p.content); }}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition flex-shrink-0 ${
                    copied === p.id
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                      : "border-ledger/15 text-ledger/50 hover:border-marigold/40 hover:text-marigold"
                  }`}
                >
                  {copied === p.id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>

              {/* Expanded content */}
              {expanded === p.id && (
                <div className="border-t border-ledger/5 bg-cream/30 px-4 py-3">
                  <pre className="text-xs text-ledger/80 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                    {p.content}
                  </pre>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-ledger/8">
                    {isAdmin && !p.is_builtin ? (
                      <button onClick={() => deletePrompt(p.id)}
                        className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                        <Trash2 size={12} /> Delete
                      </button>
                    ) : <span />}
                    <button onClick={() => handleCopy(p.id, p.content)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition ${
                        copied === p.id
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                          : "border-ledger/15 text-ledger/60 hover:border-marigold/40 hover:text-marigold"
                      }`}>
                      {copied === p.id ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy full template</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab 4: Brand Assets ──────────────────────────────────

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
  const [copiedMsg, setCopiedMsg] = useState<number | null>(null);

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
    if (error) toast.error(error.message);
    else { toast.success(`${file.name} uploaded`); loadFiles(); }
    setUploading(false);
  };

  const downloadFile = (filename: string) => {
    const { data: { publicUrl } } = supabase.storage.from("brand-assets").getPublicUrl(filename);
    const a = document.createElement("a"); a.href = publicUrl; a.download = filename; a.click();
  };

  const deleteFile = async (filename: string) => {
    const { error } = await supabase.storage.from("brand-assets").remove([filename]);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); loadFiles(); }
  };

  const getPublicUrl = (filename: string) =>
    supabase.storage.from("brand-assets").getPublicUrl(filename).data.publicUrl;

  const isImage = (name: string) => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(name);

  const copyHex = (hex: string) => {
    copyText(hex, `${hex} copied!`);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const copyMsg = (i: number, msg: string) => {
    copyText(msg, "Status copied!");
    setCopiedMsg(i);
    setTimeout(() => setCopiedMsg(null), 2000);
  };

  const updateMessage = (i: number, val: string) =>
    setData(d => ({ ...d, status_messages: d.status_messages.map((m, j) => j === i ? val : m) }));

  if (loading) return <div className="text-ledger/50 text-sm">Loading…</div>;

  return (
    <div className="space-y-6">
      {/* Color Palette */}
      <div>
        <h2 className="font-semibold text-ledger mb-3">Brand Color Palette</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {BRAND_COLORS.map(c => (
            <button key={c.hex} onClick={() => copyHex(c.hex)}
              className="group text-left rounded-2xl overflow-hidden border border-ledger/8 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="h-14 w-full relative" style={{ backgroundColor: c.hex }}>
                {copiedHex === c.hex && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-t-2xl">
                    <Check size={18} className="text-white" />
                  </div>
                )}
              </div>
              <div className="p-2 bg-white">
                <div className="text-[10px] font-semibold text-ledger truncate leading-tight">{c.name}</div>
                <div className="text-[9px] font-mono text-ledger/40 mt-0.5">{c.hex}</div>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-ledger/40 mt-2">Click any swatch to copy hex code</p>
      </div>

      {/* Typography */}
      <div>
        <h2 className="font-semibold text-ledger mb-3">Typography</h2>
        <div className="rounded-2xl border border-ledger/10 bg-white shadow-sm overflow-hidden">
          {FONTS.map((f, i) => (
            <div key={f.name} className={`flex items-center gap-4 px-4 py-3 ${i > 0 ? "border-t border-ledger/5" : ""}`}>
              <div className="w-32 flex-shrink-0">
                <div className="text-sm font-semibold text-ledger">{f.name}</div>
                <div className="text-[10px] text-ledger/40">{f.weights}</div>
              </div>
              <div className="text-sm text-ledger/60 italic flex-1 truncate">{f.sample}</div>
              <span className="text-[10px] text-ledger/40 bg-cream px-2 py-0.5 rounded-full flex-shrink-0">{f.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Files */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-ledger">Logos & Banners</h2>
          <div className="flex gap-2">
            <button onClick={loadFiles} className="p-2 rounded-lg text-ledger/40 hover:text-ledger hover:bg-cream transition">
              <RefreshCw size={14} />
            </button>
            {isAdmin && (
              <label className={`btn-primary text-sm cursor-pointer flex items-center gap-1.5 ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                <Upload size={14} /> {uploading ? "Uploading…" : "Upload"}
                <input type="file" className="hidden" accept="image/*,.pdf,.zip,.svg,.fig"
                  onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0])} />
              </label>
            )}
          </div>
        </div>
        {filesLoading ? (
          <div className="text-sm text-ledger/40">Loading files…</div>
        ) : files.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-ledger/15 py-14 text-center bg-cream/20">
            <Upload size={28} className="mx-auto text-ledger/20 mb-2" />
            <p className="text-sm text-ledger/40">No files uploaded yet</p>
            {isAdmin && <p className="text-xs text-ledger/30 mt-1">Upload logos, banners, WA DPs, Figma exports</p>}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {files.map(f => (
              <div key={f.name} className="rounded-2xl border border-ledger/8 bg-white overflow-hidden group hover:shadow-md transition-shadow">
                {isImage(f.name) ? (
                  <div className="aspect-square bg-cream overflow-hidden">
                    <img src={getPublicUrl(f.name)} alt={f.name} className="w-full h-full object-contain p-3" />
                  </div>
                ) : (
                  <div className="aspect-square bg-ledger/5 flex items-center justify-center">
                    <FileText size={32} className="text-ledger/20" />
                  </div>
                )}
                <div className="p-2.5">
                  <p className="text-[11px] text-ledger font-medium truncate" title={f.name}>{f.name}</p>
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => downloadFile(f.name)}
                      className="flex-1 text-xs py-1.5 rounded-lg bg-ledger text-cream hover:bg-ledger/80 flex items-center justify-center gap-1 transition">
                      <Download size={10} /> Save
                    </button>
                    {isAdmin && (
                      <button onClick={() => deleteFile(f.name)}
                        className="p-1.5 rounded-lg text-ledger/30 hover:text-red-500 hover:bg-red-50 transition">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp Status Messages */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-ledger">WhatsApp Status Messages</h2>
            <p className="text-xs text-ledger/50 mt-0.5">Ready-to-use status texts. Click to copy.</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              {editingMessages ? (
                <>
                  <button onClick={() => setEditingMessages(false)} className="btn-secondary text-sm"><X size={14} /></button>
                  <button onClick={async () => { await save(data); toast.success("Saved"); setEditingMessages(false); }}
                    className="btn-primary text-sm flex items-center gap-1"><Check size={14} /> Save</button>
                </>
              ) : (
                <button onClick={() => setEditingMessages(true)} className="btn-secondary text-sm flex items-center gap-1">
                  <Pencil size={14} /> Edit
                </button>
              )}
            </div>
          )}
        </div>
        <div className="space-y-2.5">
          {data.status_messages.map((msg, i) => (
            <div key={i} className="rounded-2xl bg-emerald-50 border border-emerald-100 overflow-hidden">
              {editingMessages ? (
                <div className="p-3 flex gap-2">
                  <textarea className="input flex-1 resize-none text-sm bg-white" rows={3} value={msg}
                    onChange={e => updateMessage(i, e.target.value)} />
                  <button onClick={() => setData(d => ({ ...d, status_messages: d.status_messages.filter((_, j) => j !== i) }))}
                    className="p-1.5 text-ledger/30 hover:text-red-500 self-start transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <MessageCircle size={14} className="text-white" />
                  </div>
                  <p className="flex-1 text-sm text-ledger/80 leading-relaxed">{msg}</p>
                  <button onClick={() => copyMsg(i, msg)}
                    className={`p-1.5 rounded-lg flex-shrink-0 transition ${
                      copiedMsg === i
                        ? "bg-emerald-100 text-emerald-600"
                        : "hover:bg-emerald-100 text-emerald-500"
                    }`}>
                    {copiedMsg === i ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              )}
            </div>
          ))}
          {editingMessages && (
            <button onClick={() => setData(d => ({ ...d, status_messages: [...d.status_messages, ""] }))}
              className="flex items-center gap-1 text-sm text-marigold hover:underline">
              <Plus size={14} /> Add Message
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────

export default function EcomAIContextPage() {
  const [tab, setTab] = useState("social");
  const active = TABS.find(t => t.key === tab)!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl text-ledger">ECOM AI Context</h1>
        <p className="text-sm text-ledger/60 mt-0.5">Central hub — handles, deck, prompts, brand assets.</p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 rounded-2xl bg-khadi/40 p-1.5">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition flex-1 justify-center ${
              tab === t.key
                ? "bg-white text-ledger shadow-sm"
                : "text-ledger/55 hover:text-ledger hover:bg-white/50"
            }`}>
            <t.icon size={15} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Active tab hint */}
      <div className="flex items-center gap-2">
        <active.icon size={14} className="text-marigold" />
        <span className="text-xs text-ledger/50">{active.desc}</span>
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
