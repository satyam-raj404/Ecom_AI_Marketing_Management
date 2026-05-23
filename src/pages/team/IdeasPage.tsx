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
const STATUS_STYLE: Record<string, string> = {
  open: "bg-khadi text-ledger",
  building: "bg-green-100 text-green-800",
  shipped: "bg-blue-100 text-blue-800",
  parked: "bg-ledger/10 text-ledger/50",
};
const AUTHORS = ["Amitav", "Dipali", "Satyam"];

// Idea Bank — upvote-ranked ideas with filter pills and ship-it flow
export default function IdeasPage() {
  const { user } = useAuth();
  const me = user?.email || "anon";
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filter, setFilter] = useState("All");
  const [text, setText] = useState("");
  const [type, setType] = useState("Content");
  const [author, setAuthor] = useState("Amitav");

  const load = async () => {
    const { data, error } = await supabase.from("team_ideas").select("*").order("votes", { ascending: false });
    if (error) toast.error(error.message);
    setIdeas(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!text.trim()) return toast.error("Write something first");
    const { error } = await supabase.from("team_ideas").insert({
      text, type, author, votes: 1, voted_by: [me], status: "open",
    });
    if (error) return toast.error(error.message);
    setText(""); load();
    toast.success("Idea dropped 💡");
  };

  const toggleVote = async (idea: Idea) => {
    const voted = idea.voted_by ?? [];
    const next = voted.includes(me) ? voted.filter(v => v !== me) : [...voted, me];
    await supabase.from("team_ideas").update({ voted_by: next, votes: next.length }).eq("id", idea.id);
    load();
  };

  const ship = async (id: string, current: string | null) => {
    const next = current === "building" ? "shipped" : "building";
    await supabase.from("team_ideas").update({ status: next }).eq("id", id);
    load();
    toast.success(next === "building" ? "Building! 🚀" : "Shipped! 🎉");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete idea?")) return;
    await supabase.from("team_ideas").delete().eq("id", id);
    load();
  };

  const visible = ideas.filter(i => filter === "All" || i.type === filter);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl text-ledger">Idea Bank</h1>
        <p className="text-sm text-ledger/60">Drop ideas, vote for the best. Top ideas get built.</p>
      </header>

      <div className="card space-y-3">
        <textarea className="input" rows={2} placeholder="💡 Drop an idea…" value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) add(); }} />
        <div className="flex flex-wrap gap-2 items-center">
          <select className="input max-w-[140px]" value={type} onChange={e => setType(e.target.value)}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="input max-w-[130px]" value={author} onChange={e => setAuthor(e.target.value)}>
            {AUTHORS.map(a => <option key={a}>{a}</option>)}
          </select>
          <button className="btn-primary text-sm ml-auto" onClick={add}>
            <Plus size={14} /> Drop Idea
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["All", ...TYPES].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition border
              ${filter === f ? "bg-marigold text-white border-marigold" : "border-ledger/20 text-ledger/70 hover:bg-khadi"}`}>
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="text-center py-12 text-ledger/40">
          <p className="text-2xl mb-2">🧠</p>
          <p>No ideas yet. What's on your mind?</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visible.map(idea => {
          const voted = (idea.voted_by ?? []).includes(me);
          const votes = idea.votes ?? 0;
          const hot = votes >= 5;
          const status = idea.status ?? "open";
          return (
            <div key={idea.id}
              className={`card flex gap-4 transition ${hot ? "border-mustard/60 ring-1 ring-mustard/30" : ""}`}>
              <button onClick={() => toggleVote(idea)}
                className={`flex flex-col items-center justify-center rounded-lg border px-3 py-2 shrink-0 min-w-[52px] transition
                  ${voted ? "border-marigold bg-marigold/10 text-marigold" : "border-ledger/15 text-ledger/60 hover:border-marigold/40"}`}>
                <ThumbsUp size={16} />
                <span className="text-sm font-bold mt-0.5">{votes}</span>
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-ledger whitespace-pre-wrap">{idea.text}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${STATUS_STYLE[status] ?? STATUS_STYLE.open}`}>
                    {status}
                  </span>
                  <span className="text-ledger/50">{idea.type}</span>
                  <span className="text-ledger/50">· {idea.author}</span>
                  {hot && <span className="text-mustard font-semibold">🔥 Hot</span>}
                </div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => ship(idea.id, status)}
                    className={`inline-flex items-center gap-1 text-xs rounded-md px-2 py-1 border transition
                      ${status === "building" || status === "shipped"
                        ? "border-success/30 text-success hover:bg-success/10"
                        : "border-ledger/15 text-ledger/60 hover:border-marigold/40 hover:text-marigold"}`}>
                    <Rocket size={12} />
                    {status === "shipped" ? "Shipped ✓" : status === "building" ? "Building…" : "Ship It"}
                  </button>
                </div>
              </div>

              <button onClick={() => remove(idea.id)} className="text-ledger/30 hover:text-danger shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
