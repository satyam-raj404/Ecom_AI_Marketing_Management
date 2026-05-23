import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PLATFORMS, type PlatformId } from "@/constants/platforms";
import type { ContentRun } from "@/types";

// Shows a grid of all generated images across runs
export default function GalleryPage() {
  const [runs, setRuns] = useState<ContentRun[]>([]);

  useEffect(() => {
    supabase.from("content_runs")
      .select("*").order("run_date", { ascending: false }).limit(50)
      .then(({ data }) => setRuns((data ?? []) as ContentRun[]));
  }, []);

  const items: { run: ContentRun; platform: PlatformId; path: string }[] = [];
  for (const r of runs) {
    for (const p of PLATFORMS) {
      const path = r[`${p.id}_image_path` as keyof ContentRun] as string | null;
      if (path) items.push({ run: r, platform: p.id, path });
    }
  }

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-3xl text-ledger">Gallery</h2>
        <p className="mt-1 text-inkblack/60">All generated images from your runs.</p>
      </header>
      {items.length === 0 ? (
        <div className="card text-center text-inkblack/50">No generated images yet — run the pipeline to populate this.</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => <ImageCard key={i} {...it} />)}
        </div>
      )}
    </div>
  );
}

function ImageCard({ run, platform, path }: { run: ContentRun; platform: PlatformId; path: string }) {
  const { data } = supabase.storage.from("post-images").getPublicUrl(path);
  const post = run[`${platform}_post` as keyof ContentRun] as string | null;
  const meta = PLATFORMS.find((p) => p.id === platform)!;
  return (
    <div className="card overflow-hidden p-0">
      <img src={data.publicUrl} alt={`${platform} post`} className="aspect-[4/3] w-full object-cover bg-khadi" />
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: meta.bgColor, color: meta.color }}>{meta.name}</span>
          <span className="text-xs text-inkblack/50">{run.run_date}</span>
        </div>
        <p className="line-clamp-3 text-sm text-inkblack/70">{post ?? "—"}</p>
      </div>
    </div>
  );
}
