import { useEffect, useState } from "react";
import { Linkedin, Instagram, Facebook, Twitter, Lock, Check, Loader2, Unplug, Wifi } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PLATFORMS, type PlatformId, type PlatformMeta } from "@/constants/platforms";
import { useConnections } from "@/hooks/useConnections";

const ICONS: Record<PlatformId, typeof Linkedin> = {
  linkedin: Linkedin, instagram: Instagram, facebook: Facebook, x: Twitter,
};

export default function ConnectorsPage() {
  const { connections, getFor, reload, disconnect } = useConnections();

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "oauth-complete") {
        reload();
        if (e.data.success) toast.success(`${e.data.platform} connected`);
        else toast.error(`Connection failed: ${e.data.error ?? "unknown"}`);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [reload]);

  const connectedCount = connections.filter(c => c.status === "connected").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl text-ledger">Social Connectors</h1>
          <p className="text-sm text-ledger/60 mt-0.5">Connect social accounts so the pipeline can publish automatically.</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${
          connectedCount > 0 ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-ledger/5 border-ledger/10 text-ledger/40"
        }`}>
          <Wifi size={15} />
          {connectedCount}/{PLATFORMS.length} connected
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PLATFORMS.map(p => (
          <PlatformCard
            key={p.id}
            platform={p}
            connection={getFor(p.id)}
            onChanged={reload}
            onDisconnect={() => disconnect(p.id)}
          />
        ))}
      </div>

      <div className="rounded-2xl bg-khadi/30 border border-ledger/8 p-4">
        <p className="text-xs font-semibold text-ledger/50 uppercase tracking-wider mb-2">How it works</p>
        <ol className="text-sm text-ledger/60 space-y-1 list-decimal list-inside">
          <li>Click Connect on each platform — OAuth popup opens</li>
          <li>Log in and grant posting permissions</li>
          <li>Connection saves automatically — status turns green</li>
          <li>Run the pipeline from Automation → posts publish to all connected platforms</li>
        </ol>
      </div>
    </div>
  );
}

interface CardProps {
  platform: PlatformMeta;
  connection: ReturnType<typeof useConnections>["connections"][number] | undefined;
  onChanged: () => void;
  onDisconnect: () => void;
}

function PlatformCard({ platform, connection, onDisconnect }: CardProps) {
  const Icon = ICONS[platform.id];
  const [busy, setBusy] = useState(false);
  const connected = connection?.status === "connected";

  const startConnect = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("oauth-connect", { body: { platform: platform.id } });
      if (error || !data?.authUrl) throw new Error(error?.message ?? "No auth URL");
      const w = 600, h = 720;
      const left = window.screenX + (window.outerWidth - w) / 2;
      const top  = window.screenY + (window.outerHeight - h) / 2;
      window.open(data.authUrl, `connect_${platform.id}`, `width=${w},height=${h},left=${left},top=${top}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition hover:shadow-md ${
      connected ? "border-emerald-200 ring-1 ring-emerald-100" :
      !platform.available ? "opacity-70" :
      "border-ledger/10"
    }`}>
      {/* Platform header */}
      <div className="px-5 py-4 flex items-center gap-4 border-b border-ledger/5">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: platform.bgColor }}>
          <Icon size={26} style={{ color: platform.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-ledger">{platform.name}</h3>
            {!platform.available && (
              <span className="flex items-center gap-1 rounded-full bg-khadi px-2 py-0.5 text-[10px] font-medium text-ledger/60">
                <Lock size={9} /> Phase 2
              </span>
            )}
          </div>
          <p className="text-xs text-ledger/40 mt-0.5">{platform.width}×{platform.height}px</p>
        </div>

        {/* Connection status dot */}
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${connected ? "bg-emerald-400 shadow-sm shadow-emerald-200" : "bg-ledger/15"}`} />
      </div>

      {/* Status + action */}
      <div className="px-5 py-4 flex items-center justify-between gap-3">
        <div className="text-sm">
          {connected ? (
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <Check size={14} /> Connected
              {connection?.platform_username && (
                <span className="text-ledger/50 font-normal ml-1">· {connection.platform_username}</span>
              )}
            </span>
          ) : (
            <span className="text-ledger/40">Not connected</span>
          )}
        </div>

        {connected ? (
          <button onClick={onDisconnect}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 transition">
            <Unplug size={12} /> Disconnect
          </button>
        ) : (
          <button
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition ${
              platform.available && !busy
                ? "bg-ledger text-cream hover:bg-ledger/80"
                : "bg-ledger/8 text-ledger/30 cursor-not-allowed"
            }`}
            disabled={!platform.available || busy}
            onClick={startConnect}
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            {platform.available ? "Connect" : "Coming soon"}
          </button>
        )}
      </div>
    </div>
  );
}
