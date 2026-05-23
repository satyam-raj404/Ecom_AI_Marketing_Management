import { useEffect, useState } from "react";
import { Linkedin, Instagram, Facebook, Twitter, Lock, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PLATFORMS, type PlatformId, type PlatformMeta } from "@/constants/platforms";
import { useConnections } from "@/hooks/useConnections";

const ICONS: Record<PlatformId, typeof Linkedin> = {
  linkedin: Linkedin, instagram: Instagram, facebook: Facebook, x: Twitter,
};

// Lists all 4 platform connection cards
export default function ConnectorsPage() {
  const { connections, getFor, reload, disconnect } = useConnections();

  // Listen for postMessage from the OAuth popup completion page
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

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-3xl text-ledger">Social Connectors</h2>
        <p className="mt-1 text-inkblack/60">Connect your social accounts so the pipeline can publish for you.</p>
      </header>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {PLATFORMS.map((p) => (
          <PlatformCard
            key={p.id}
            platform={p}
            connection={getFor(p.id)}
            onChanged={reload}
            onDisconnect={() => disconnect(p.id)}
          />
        ))}
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

// One platform card with connect/disconnect/locked state
function PlatformCard({ platform, connection, onDisconnect }: CardProps) {
  const Icon = ICONS[platform.id];
  const [busy, setBusy] = useState(false);
  const connected = connection?.status === "connected";

  const startConnect = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("oauth-connect", {
        body: { platform: platform.id },
      });
      if (error || !data?.authUrl) throw new Error(error?.message ?? "No auth URL");
      const w = 600, h = 720;
      const left = window.screenX + (window.outerWidth - w) / 2;
      const top = window.screenY + (window.outerHeight - h) / 2;
      window.open(data.authUrl, `connect_${platform.id}`,
        `width=${w},height=${h},left=${left},top=${top}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ background: platform.bgColor }}>
          <Icon size={26} style={{ color: platform.color }} />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-xl text-ledger">{platform.name}</h3>
          <p className="text-xs text-inkblack/60">{platform.width}×{platform.height}</p>
        </div>
        {!platform.available && (
          <span className="flex items-center gap-1 rounded-full bg-khadi px-2.5 py-1 text-xs text-ledger/70">
            <Lock size={12} /> Phase 2
          </span>
        )}
      </div>

      {connected ? (
        <div className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success flex items-center gap-2">
          <Check size={16} /> Connected
          {connection?.platform_username && <span className="text-inkblack/70">— {connection.platform_username}</span>}
        </div>
      ) : (
        <div className="text-sm text-inkblack/50">Not connected</div>
      )}

      <div className="mt-auto flex gap-2">
        {connected ? (
          <button className="btn-danger flex-1" onClick={onDisconnect}>Disconnect</button>
        ) : (
          <button
            className="btn-primary flex-1"
            disabled={!platform.available || busy}
            onClick={startConnect}
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {platform.available ? "Connect" : "Coming soon"}
          </button>
        )}
      </div>
    </div>
  );
}
