import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Link2, FileSpreadsheet, Play, Image, Settings, LogOut,
  Target, PencilLine, MessageSquare, Search, Calendar, Lightbulb, Smartphone,
  Palette, Megaphone, Wind, Cog, BarChart3, BookOpen,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const STUDIO = [
  { to: "/automation", label: "Automation", icon: Play },
  { to: "/connectors", label: "Connectors", icon: Link2 },
  { to: "/sheet",      label: "Sheet",      icon: FileSpreadsheet },
  { to: "/gallery",    label: "Gallery",    icon: Image },
  { to: "/settings",   label: "Settings",   icon: Settings },
];

const TEAM = [
  { to: "/team",          label: "Target Board",      icon: Target },
  { to: "/weekly-update", label: "Weekly KPI Update", icon: PencilLine },
  { to: "/reddit",        label: "Reddit Outreach",   icon: MessageSquare },
  { to: "/leads",         label: "Lead Hunter",       icon: Search },
  { to: "/calendar",      label: "Calendar",          icon: Calendar },
  { to: "/ideas",         label: "Idea Bank",         icon: Lightbulb },
  { to: "/whatsapp",      label: "WA Leads",          icon: Smartphone },
];

const GROWTH_HQ = [
  { to: "/ghq/studio",     label: "Content Studio",    icon: Palette },
  { to: "/ghq/marketing",  label: "Marketing Plan",    icon: Megaphone },
  { to: "/ghq/funnel",     label: "Funnel",            icon: Wind },
  { to: "/ghq/automation", label: "Automation",        icon: Cog },
  { to: "/ghq/scorecard",  label: "Scorecard",         icon: BarChart3 },
  { to: "/ghq/context",    label: "ECOM AI Context",   icon: BookOpen },
];

// 5 most-used items for mobile bottom nav
const MOBILE_NAV = [
  { to: "/team",          label: "Board", icon: Target },
  { to: "/weekly-update", label: "KPI",   icon: PencilLine },
  { to: "/leads",         label: "Leads", icon: Search },
  { to: "/calendar",      label: "Cal",   icon: Calendar },
  { to: "/ideas",         label: "Ideas", icon: Lightbulb },
];

// App shell — desktop sidebar + mobile bottom nav
export default function AppLayout() {
  const navigate = useNavigate();
  const signOut = async () => { await supabase.auth.signOut(); navigate("/auth"); };

  return (
    <div className="flex h-full">
      <aside className="hidden md:flex w-64 flex-col bg-ledger text-cream overflow-y-auto">
        <div className="px-6 py-6 border-b border-white/10">
          <h1 className="font-display text-xl text-mustard leading-tight">EcomBharat AI</h1>
          <p className="text-xs text-cream/60 mt-1">Content Studio</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <SectionLabel>Content Studio</SectionLabel>
          {STUDIO.map((item) => <NavItem key={item.to} {...item} />)}

          <div className="my-4 flex items-center gap-2 px-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] tracking-widest text-mustard/80">TEAM HQ</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
          {TEAM.map((item) => <NavItem key={item.to} {...item} />)}

          <div className="my-4 flex items-center gap-2 px-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] tracking-widest text-mustard/80">GROWTH HQ</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
          {GROWTH_HQ.map((item) => <NavItem key={item.to} {...item} />)}
        </nav>
        <button
          onClick={signOut}
          className="mx-3 mb-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-cream/70 hover:bg-white/5"
        >
          <LogOut size={18} /> Sign out
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <header className="md:hidden sticky top-0 z-10 flex items-center justify-between bg-ledger px-4 py-3 text-cream">
          <h1 className="font-display text-mustard">EcomBharat AI</h1>
          <button onClick={signOut} className="text-xs text-cream/70"><LogOut size={16} /></button>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 grid grid-cols-5 border-t border-ledger/10 bg-white">
        {MOBILE_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-[10px] ${
                isActive ? "text-marigold" : "text-ledger/60"
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

// Sidebar section label
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-3 pb-1 text-[10px] tracking-widest text-cream/40">{children}</div>;
}

// Sidebar nav item
function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: React.ComponentType<{ size?: number }> }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
          isActive ? "bg-marigold text-white" : "text-cream/80 hover:bg-white/5"
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}
