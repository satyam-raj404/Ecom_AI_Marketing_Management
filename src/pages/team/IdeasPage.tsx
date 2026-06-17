import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, ThumbsUp, Trash2, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Idea = {
  id: string; text: string; author: string; type: string | null;
  votes: number | null; voted_by: string[] | null; status: string | null; created_at: string | null;
};

const TYPES = ["Content", "Product", "Marketing", "Ops"];

const TYPE_COLOR: Record<string, string> = {
  Content:   "bg-blue-100 text-blue-700",
  Product:   "bg-violet-100 text-violet-700",
  Marketing: "bg-amber-100 text-amber-700",
  Ops:       "bg-emerald-100 text-emerald-700",
};

const STATUS_STYLE: Record<string, string> = {
  open:     "bg-slate-100 text-slate-500",
  building: "bg-amber-100 text-amber-700",
  shipped:  "bg-emerald-100 text-emerald-700",
  parked:   "bg-ledger/8 text-ledger/40",
};

const db = supabase as any;

export default function IdeasPage() {
  const { user } = useAuth();
  const me = user?.email ?? "anon";
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filter, setFilter] = useState("All");
  const [text, setText] = useState("");
  const [type, setType] = useState("Content");

  const load = async () => {
    const { data, error } = await db.from("team_ideas").select("*").order("votes", { ascending: false });
    if (error) toast.error(error.message);
    setIdeas(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!text.trim()) return;
    const { error } = await db.from("team_ideas").insert({
      text: text.trim(), type, author: me.split("@")[0], votes: 1, voted_by: [me], status: "open",
    });
    if (error) return toast.error(error.message);
    setText(""); load();
    toast.success("Idea added");
  };

  const toggleVote = async (idea: Idea) => {
    const voted = idea.voted_by ?? [];
    const next = voted.includes(me) ? voted.filter(v => v !== me) : [...voted, me];
    await db.from("team_ideas").update({ voted_by: next, votes: next.length }).eq("id", idea.id);
    load();
  };

  const cycleStatus = async (idea: Idea) => {
    const cycle: Record<string, string> = { open: "building", building: "shipped", shipped: "parked", parked: "open" };
    await db.from("team_ideas").update({ status: cycle[idea.status ?? "open"] }).eq("id", idea.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete idea?")) return;
    await db.from("team_ideas").delete().eq("id", id);
    load();
  };

  const visible = ideas.filter(i => filter === "All" || i.type === filter);
  const counts = Object.fromEntries(["All", ...TYPES].map(t => [
    t, t === "All" ? ideas.length : ideas.filter(i => i.type === t).length
  ]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl text-ledger">Idea Bank</h1>

      {/* Input */}
      <div className="rounded-2xl border border-ledger/10 bg-white shadow-sm p-4 space-y-3">
        <textarea
          className="w-full resize-none rounded-xl bg-cream/60 border border-ledger/10 px-4 py-3 text-sm text-ledger placeholder:text-ledger/30 focus:outline-none focus:ring-2 focus:ring-marigold/30 focus:border-marigold/40 transition"
          rows={2}
          placeholder="What's the idea? Ctrl+Enter to submit…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) add(); }}
        />
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1.5">
            {TYPES.map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition border ${
                  type === t ? "bg-ledger text-cream border-ledger" : "border-ledger/15 text-ledger/60 hover:bg-khadi"
                }`}>
                {t}
              </button>
            ))}
          </div>
          <button
            className="ml-auto btn-primary text-sm flex items-center gap-1.5 disabled:opacity-40"
            onClick={add}
            disabled={!text.trim()}
          >
            <Plus size={15} /> Add Idea
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {["All", ...TYPES].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition border ${
              filter === f
                ? "bg-marigold text-white border-marigold"
                : "border-ledger/15 text-ledger/60 hover:bg-khadi"
            }`}>
            {f}
            <span className="ml-1.5 text-[10px] opacity-60">{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Ideas list */}
      {visible.length === 0 ? (
        <div className="text-center py-16 text-ledger/40">
          <div className="text-4xl mb-3">💡</div>
          <p className="text-sm">No ideas yet. What's on your mind?</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visible.map(idea => {
            const voted = (idea.voted_by ?? []).includes(me);
            const votes = idea.votes ?? 0;
            const status = idea.status ?? "open";
            return (
              <div key={idea.id}
                className={`flex gap-4 items-start rounded-2xl border bg-white px-4 py-3.5 shadow-sm transition hover:shadow-md ${
                  votes >= 3 ? "border-mustard/40" : "border-ledger/8"
                }`}>

                {/* Vote */}
                <button onClick={() => toggleVote(idea)}
                  className={`flex flex-col items-center rounded-xl border px-2.5 py-2 shrink-0 w-12 transition ${
                    voted
                      ? "border-marigold bg-marigold/10 text-marigold"
                      : "border-ledger/12 text-ledger/40 hover:border-marigold/50 hover:text-marigold"
                  }`}>
                  <ThumbsUp size={14} />
                  <span className="text-sm font-bold mt-0.5">{votes}</span>
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-ledger text-sm leading-relaxed whitespace-pre-wrap">{idea.text}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${TYPE_COLOR[idea.type ?? "Content"] ?? TYPE_COLOR.Content}`}>
                      {idea.type}
                    </span>
                    <span className="text-[11px] text-ledger/40">{idea.author}</span>
                    {votes >= 3 && <span className="text-[11px] text-mustard font-semibold">🔥 Hot</span>}
                  </div>
                </div>

                {/* Status + delete */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button onClick={() => remove(idea.id)} className="text-ledger/20 hover:text-red-400 transition">
                    <Trash2 size={13} />
                  </button>
                  <button
                    onClick={() => cycleStatus(idea)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition hover:opacity-80 ${STATUS_STYLE[status] ?? STATUS_STYLE.open}`}
                    title="Click to cycle status"
                  >
                    {status === "building" && <Rocket size={10} />}
                    {status}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
