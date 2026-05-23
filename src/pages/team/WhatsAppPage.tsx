import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, UserPlus, ExternalLink, Loader2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type WaContact = { name: string; phone: string; message_count: number };
type ImportRow = {
  id: string; group_name: string | null; file_name: string | null;
  contacts_found: number; contacts_added: number; imported_at: string;
};

// WhatsApp Lead Importer — file upload → FastAPI parse → push to pipeline
export default function WhatsAppPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [contacts, setContacts] = useState<WaContact[]>([]);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [groupName, setGroupName] = useState("");
  const [fileName, setFileName] = useState("");
  const [sortBy, setSortBy] = useState<"messages" | "name">("messages");
  const [imports, setImports] = useState<ImportRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadImports = async () => {
    try {
      const res = await fetch(`${API}/api/whatsapp/imports`);
      if (res.ok) setImports(await res.json());
    } catch {
      // Silently fail — API may not be running yet
    }
  };

  useEffect(() => { loadImports(); }, []);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".txt")) return toast.error("Upload a .txt WhatsApp export");
    setRawFile(file);
    setFileName(file.name);
    setGroupName(file.name.replace(/\.txt$/i, "").replace(/WhatsApp Chat with /i, "").trim());
    setParsing(true);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`${API}/api/whatsapp/parse`, { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      const data: { contacts: WaContact[]; total: number } = await res.json();
      setContacts(data.contacts);
      setSelected(new Set(data.contacts.map((_, i) => i)));
      data.total === 0
        ? toast.error("No phone numbers found — check file format")
        : toast.success(`Found ${data.total} unique contacts`);
    } catch (err: unknown) {
      toast.error(`Parse failed: ${err instanceof Error ? err.message : "API unreachable"}`);
    } finally {
      setParsing(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const toggleSelect = (i: number) => {
    const next = new Set(selected);
    next.has(i) ? next.delete(i) : next.add(i);
    setSelected(next);
  };

  const toggleAll = () =>
    setSelected(selected.size === contacts.length ? new Set() : new Set(contacts.map((_, i) => i)));

  const addToLeads = async () => {
    if (selected.size === 0) return toast.error("Select at least one contact");
    setSaving(true);
    const payload = {
      contacts: [...selected].map(i => contacts[i]),
      group_name: groupName,
      file_name: fileName,
    };
    try {
      const res = await fetch(`${API}/api/whatsapp/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: { added: number } = await res.json();
      toast.success(`✓ ${data.added} contacts added to Lead Pipeline`);
      setContacts([]); setSelected(new Set()); setGroupName(""); setFileName(""); setRawFile(null);
      loadImports();
    } catch (err: unknown) {
      toast.error(`Import failed: ${err instanceof Error ? err.message : "API unreachable"}`);
    } finally {
      setSaving(false);
    }
  };

  const sorted = [...contacts].sort((a, b) =>
    sortBy === "messages" ? b.message_count - a.message_count : a.name.localeCompare(b.name)
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl md:text-3xl text-ledger">WhatsApp Lead Importer</h1>
        <p className="text-sm text-ledger/60">Export group chat → upload .txt → FastAPI parses → contacts added to pipeline.</p>
      </header>

      <div className="card space-y-4">
        <h2 className="font-semibold text-ledger">How to export</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            ["1", "Open WhatsApp group", "Tap ⋮ Menu → More → Export chat"],
            ["2", "Choose without media", 'Select "Without media" → saves .txt file'],
            ["3", "Upload below", "Drag & drop or click the upload area"],
          ].map(([n, t, d]) => (
            <div key={n} className="flex gap-3 items-start p-3 rounded-lg bg-cream">
              <span className="w-6 h-6 rounded-full bg-marigold text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{n}</span>
              <div>
                <div className="text-sm font-medium text-ledger">{t}</div>
                <div className="text-xs text-ledger/60 mt-0.5">{d}</div>
              </div>
            </div>
          ))}
        </div>

        <div
          onDrop={onDrop} onDragOver={e => e.preventDefault()} onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-ledger/20 rounded-xl p-10 text-center cursor-pointer hover:border-marigold/50 hover:bg-cream/50 transition">
          {parsing
            ? <Loader2 className="mx-auto text-marigold animate-spin mb-2" size={32} />
            : <Upload className="mx-auto text-ledger/30 mb-3" size={32} />}
          <p className="text-sm text-ledger/60">
            {parsing ? "Parsing with FastAPI…" : rawFile ? rawFile.name : "Drag & drop .txt file or click to browse"}
          </p>
          <input ref={fileRef} type="file" accept=".txt" className="hidden" onChange={onFileChange} />
        </div>
      </div>

      {contacts.length > 0 && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-semibold text-ledger">Found {contacts.length} unique contacts</h2>
              <input className="input mt-2 max-w-xs" placeholder="Group name…" value={groupName}
                onChange={e => setGroupName(e.target.value)} />
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-sm text-ledger/60">Sort:</span>
              {(["messages", "name"] as const).map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`text-xs px-3 py-1 rounded-full border transition ${sortBy === s ? "bg-marigold text-white border-marigold" : "border-ledger/20 text-ledger/60"}`}>
                  {s === "messages" ? "Most active" : "Name"}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ledger/10 text-left text-xs text-ledger/50 uppercase tracking-wide">
                  <th className="pb-2 pr-3">
                    <input type="checkbox" checked={selected.size === contacts.length} onChange={toggleAll} />
                  </th>
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Phone</th>
                  <th className="pb-2 pr-4">Messages</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c, _sortIdx) => {
                  const origIdx = contacts.indexOf(c);
                  return (
                    <tr key={origIdx} className="border-b border-ledger/5 hover:bg-cream/50">
                      <td className="py-2 pr-3">
                        <input type="checkbox" checked={selected.has(origIdx)} onChange={() => toggleSelect(origIdx)} />
                      </td>
                      <td className="py-2 pr-4 font-medium text-ledger">{c.name}</td>
                      <td className="py-2 pr-4 text-ledger/70 font-mono text-xs">{c.phone || "—"}</td>
                      <td className="py-2 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.message_count >= 10 ? "bg-green-100 text-green-800" : c.message_count >= 5 ? "bg-amber-100 text-amber-800" : "bg-khadi text-ledger/60"}`}>
                          {c.message_count}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-ledger/60">{selected.size} of {contacts.length} selected</span>
            <button className="btn-primary" onClick={addToLeads} disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              {saving ? "Adding…" : `Add ${selected.size} to Lead Pipeline →`}
            </button>
          </div>
        </div>
      )}

      {imports.length > 0 && (
        <div className="card space-y-3">
          <h2 className="font-semibold text-ledger">Previously Imported Groups</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ledger/10 text-left text-xs text-ledger/50 uppercase tracking-wide">
                  <th className="pb-2 pr-4">Group Name</th>
                  <th className="pb-2 pr-4">Found</th>
                  <th className="pb-2 pr-4">Added</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {imports.map(imp => (
                  <tr key={imp.id} className="border-b border-ledger/5">
                    <td className="py-2 pr-4 font-medium text-ledger">{imp.group_name ?? imp.file_name ?? "Unknown"}</td>
                    <td className="py-2 pr-4 text-ledger/70">{imp.contacts_found}</td>
                    <td className="py-2 pr-4">
                      <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">
                        ✓ {imp.contacts_added}
                      </span>
                    </td>
                    <td className="py-2 text-ledger/50 text-xs">{new Date(imp.imported_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <a href="/leads" className="inline-flex items-center gap-1 text-sm text-marigold hover:underline">
            <ExternalLink size={14} /> View in Lead Hunter
          </a>
        </div>
      )}

      {contacts.length === 0 && imports.length === 0 && (
        <div className="text-center py-16 text-ledger/30">
          <p className="text-4xl mb-3">📲</p>
          <p className="text-sm">Upload a WhatsApp group export to get started</p>
        </div>
      )}
    </div>
  );
}
