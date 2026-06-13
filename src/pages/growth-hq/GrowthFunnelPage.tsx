// Static funnel visualization — read-only reference for the team
export default function GrowthFunnelPage() {
  const BANDS = [
    {
      stage: "TOP — Awareness",
      goal: "Reach cold audiences. Get follows & saves.",
      offer: "Reels, memes, evergreen content — '5 signs your udhaar is out of control'",
      format: "Reels, Carousels, Memes",
      platform: "Instagram, Facebook, X",
      cta: "Follow / Save",
      bg: "#0F3B2E", text: "#FDF8F0",
    },
    {
      stage: "MID — Education",
      goal: "Build trust. Establish expertise.",
      offer: "Carousels, case studies, build-in-public updates, founder story",
      format: "Carousels, Videos, LinkedIn Posts",
      platform: "LinkedIn, Instagram, YouTube",
      cta: "Comment DEMO",
      bg: "#E8703C", text: "#FDF8F0",
    },
    {
      stage: "BOTTOM — Capture",
      goal: "Convert attention to intent. Build waitlist.",
      offer: "Bad Debt Calculator + pilot pre-registration offer",
      format: "Landing page CTA, Reel CTAs",
      platform: "All platforms → landing page",
      cta: "Join the first 100",
      bg: "#F4B740", text: "#0F3B2E",
    },
    {
      stage: "NURTURE — Relationship",
      goal: "Keep warm leads engaged before launch.",
      offer: "Weekly WhatsApp tips, field visit stories, community updates",
      format: "WhatsApp broadcast, DMs",
      platform: "WhatsApp, Email",
      cta: "Reply to book demo",
      bg: "#F4ECD9", text: "#0F3B2E",
    },
    {
      stage: "CONVERT — Activation",
      goal: "Turn pilot users into paying customers at launch.",
      offer: "Onboarding call, first 10-min setup, Day 1 wins",
      format: "1:1 calls, demo video, onboarding checklist",
      platform: "WhatsApp + in-person",
      cta: "Start pilot",
      bg: "#2D8659", text: "#FDF8F0",
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl text-ledger">🌪️ Funnel</h1>
        <p className="text-sm text-ledger/60">What we offer at each stage of the customer journey.</p>
      </header>

      <div className="space-y-2">
        {BANDS.map((band, i) => {
          const widths = ["w-full", "w-[90%]", "w-[75%]", "w-[60%]", "w-[45%]"];
          return (
            <div key={i} className={`mx-auto rounded-xl px-6 py-5 ${widths[i]}`} style={{ backgroundColor: band.bg }}>
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                <div className="flex-1">
                  <h3 className="font-semibold text-base" style={{ color: band.text }}>{band.stage}</h3>
                  <p className="text-sm mt-0.5 opacity-80" style={{ color: band.text }}>{band.goal}</p>
                </div>
                <div className="hidden md:block w-px opacity-20" style={{ backgroundColor: band.text, minHeight: "40px" }} />
                <div className="flex-1">
                  <p className="text-xs opacity-60 uppercase tracking-wider" style={{ color: band.text }}>Content</p>
                  <p className="text-sm" style={{ color: band.text }}>{band.offer}</p>
                </div>
                <div className="hidden md:block w-px opacity-20" style={{ backgroundColor: band.text, minHeight: "40px" }} />
                <div className="shrink-0 text-right">
                  <p className="text-xs opacity-60 uppercase tracking-wider mb-1" style={{ color: band.text }}>CTA</p>
                  <span className="inline-block rounded-full px-3 py-1 text-xs font-bold"
                    style={{ backgroundColor: `${band.text}20`, color: band.text }}>
                    → {band.cta}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex gap-3 text-xs opacity-60" style={{ color: band.text }}>
                <span>📄 {band.format}</span>
                <span>·</span>
                <span>📡 {band.platform}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border-2 border-marigold/40 bg-marigold/5 p-6">
        <h3 className="font-semibold text-ledger text-base mb-2">🏴 Core Principle</h3>
        <p className="text-ledger/80">
          <strong>Sell BEFORE you build.</strong> Validate demand with waitlist sign-ups before building heavy features.
          Every piece of content should pull someone one stage deeper into the funnel.
          Target: <strong>100–200 pilot pre-registrations</strong> from Odisha, Bengaluru, Jharkhand before full launch.
          Budget: <strong>&lt;₹10K/month</strong> on organic + minimal paid.
        </p>
      </div>
    </div>
  );
}
