import { Link, useLocation } from "wouter";
import { getUser, signOut } from "@/lib/auth";
import { msalInstance } from "@/lib/msalClient";

const NAV_ITEMS = [
  { label: "Dashboard",    href: "/dashboard",          icon: "⊞" },
  { label: "Clients",      href: "/clients",            icon: "🏢" },
  { label: "Integrations", href: "/admin/integrations", icon: "⚙" },
  { label: "Audit Log",    href: "/audit",              icon: "📋" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const user    = getUser();
  const account = msalInstance.getActiveAccount();

  const displayName = account?.name ?? user?.displayName ?? "";
  const email       = account?.username ?? user?.email ?? "";
  const initials    = displayName.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  function handleSignOut() {
    signOut();
    window.location.href = "/login";
  }

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-56 flex-shrink-0 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="px-4 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <rect x="0"  y="0"  width="10" height="10" fill="#F25022"/>
              <rect x="11" y="0"  width="10" height="10" fill="#7FBA00"/>
              <rect x="0"  y="11" width="10" height="10" fill="#00A4EF"/>
              <rect x="11" y="11" width="10" height="10" fill="#FFB900"/>
            </svg>
            <div>
              <p className="text-xs font-semibold leading-none text-sidebar-foreground">Client Portal</p>
              <p className="text-[10px] text-sidebar-foreground/50 mt-0.5">Operations</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={[
                    "flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  ].join(" ")}
                >
                  <span className="w-4 text-center text-base leading-none">{item.icon}</span>
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 px-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-semibold shrink-0 select-none">
              {initials || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-sidebar-foreground/90 font-medium truncate leading-tight">{displayName || "—"}</p>
              <p className="text-[10px] text-sidebar-foreground/40 truncate">{email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-1.5 rounded text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
