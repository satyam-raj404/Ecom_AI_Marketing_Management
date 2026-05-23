import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Star, Copy, Trash2, Trophy, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Note = {
  id: string; title: string; content: string | null; category: string | null;
  is_win: boolean | null; author: string; created_at: string | null;
};

const AUTHORS = ["Amitav", "Dipali", "Satyam"];
const CATEGORIES = ["Customer Quote", "Demo Notes", "Random", "Idea"];
const BLANK = { title: "", content: "", category: "Random", author: "Amitav", is_win: false };

// Notes & Wins — quick team capture with star-to-win flow
export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tab, setTab] = useState<"notes" | "wins">("notes");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("team_notes").select("*")
      .neq("category", "marketing-strategy").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setNotes(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title.trim()) return toast.error("Title required");
    const { error } = await supabase.from("team_notes").insert({
      title: form.title, content: form.content || null,
      category: form.category, is_win: form.is_win, author: form.author,
    });
    if (error) return toast.error(error.message);
    setForm(BLANK); setShowForm(false); load();
    toast.success(form.is_win ? "Win logged 🎉" : "Note saved");
  };

  const toggleWin = async (n: Note) => {
    await supabase.from("team_notes").update({ is_win: !n.is_win }).eq("id", n.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete note?")) return;
    await supabase.from("team_notes").delete().eq("id", id);
    load();
  };

  const copy = (n: Note) => {
    navigator.clipboard.writeText(`${n.title}\n${n.content ?? ""}`);
    toast.success("Copied");
  };

  const wins = notes.filter(n => n.is_win);
  const regular = notes.filter(n => !n.is_win);
  const visible = tab === "wins" ? wins : regular;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl text-ledger">Notes & Wins</h1>
          <p className="text-sm text-ledger/60">Drop quick thoughts. Star a note to move it to Wins.</p>
        </div>
        <button className="btn-primary text-sm" onClick={() => setShowForm(v => !v)}>
          <Plus size={14} /> New Note
        </button>
      </header>

      {showForm && (
        <div className="card space-y-3 border-marigold/30">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-ledger text-sm">New note</span>
            <button onClick={() => setShowForm(false)} className="text-ledger/40 hover:text-ledger"><X size={16} /></button>
          </div>
          <input className="input" placeholder="Quick thought…" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea className="input" rows={3} placeholder="Write anything…" value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })} />
          <div className="flex flex-wrap gap-2">
            <select className="input max-w-[160px]" value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="input max-w-[140px]" value={form.author}
              onChange={e => setForm({ ...form, author: e.target.value })}>
              {AUTHORS.map(a => <option key={a}>{a}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-ledger cursor-pointer ml-auto">
              <input type="checkbox" checked={form.is_win}
                onChange={e => setForm({ ...form, is_win: e.target.checked })} />
              Mark as Win 🏆
            </label>
          </div>
          <button className="btn-primary text-sm w-full" onClick={save}>Save Note</button>
        </div>
      )}

      <div className="flex gap-1 border-b border-ledger/10">
        {(["notes", "wins"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition border-b-2 -mb-px
              ${tab === t ? "border-marigold text-marigold" : "border-transparent text-ledger/60 hover:text-ledger"}`}>
            {t === "wins" ? `🏆 Wins (${wins.length})` : `Notes (${regular.length})`}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="text-center py-12 text-ledger/40 space-y-1">
          <p className="text-2xl">{tab === "wins" ? "🏆" : "💡"}</p>
          <p>{tab === "wins" ? "No wins yet. Star a note to celebrate it!" : "No notes yet. Drop your first thought!"}</p>
        </div>
      )}

      <div className={tab === "wins" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}>
        {visible.map(n => (
          <NoteCard key={n.id} note={n} isWinTab={tab === "wins"}
            expanded={expanded === n.id} onExpand={() => setExpanded(expanded === n.id ? null : n.id)}
            onWin={toggleWin} onCopy={copy} onDelete={remove} />
        ))}
      </div>
    </div>
  );
}

function NoteCard({ note, isWinTab, expanded, onExpand, onWin, onCopy, onDelete }: {
  note: Note; isWinTab: boolean; expanded: boolean;
  onExpand: () => void; onWin: (n: Note) => void; onCopy: (n: Note) => void; onDelete: (id: string) => void;
}) {
  const ago = note.created_at ? relativeTime(note.created_at) : "";
  return (
    <div className={`card cursor-pointer ${isWinTab ? "border-l-4 border-l-success" : ""} ${note.is_win && !isWinTab ? "border-l-4 border-l-mustard" : ""}`}
      onClick={onExpand}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {isWinTab && <span className="text-lg mr-1">🎉</span>}
          <span className="font-medium text-ledger">{note.title}</span>
          <div className="mt-1 text-xs text-ledger/50">
            by {note.author} · {ago} · {note.category}
          </div>
          {note.content && !expanded && (
            <p className="mt-1 text-sm text-ledger/70 line-clamp-2">{note.content}</p>
          )}
          {expanded && note.content && (
            <p className="mt-2 text-sm text-ledger/80 whitespace-pre-wrap">{note.content}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <button onClick={() => onWin(note)}
            className={`p-1.5 rounded transition ${note.is_win ? "text-mustard" : "text-ledger/30 hover:text-mustard"}`}>
            <Star size={15} fill={note.is_win ? "currentColor" : "none"} />
          </button>
          <button onClick={() => onCopy(note)} className="p-1.5 rounded text-ledger/30 hover:text-ledger transition">
            <Copy size={14} />
          </button>
          <button onClick={() => onDelete(note.id)} className="p-1.5 rounded text-ledger/30 hover:text-danger transition">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}
