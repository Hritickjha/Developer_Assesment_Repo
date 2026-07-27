import { useEffect, useState } from "react";
import { Link } from "wouter";
import Layout from "@/components/layout";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";

interface AuditEvent {
  id: number;
  actor_email: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  created_at: string;
}

interface Client {
  id: number;
  name: string;
  status: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr + " UTC").getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const ACTION_META: Record<string, { label: string; dot: string }> = {
  "client.created":        { label: "Client created",         dot: "bg-blue-500"   },
  "client.viewed":         { label: "Client viewed",          dot: "bg-gray-400"   },
  "client.status_changed": { label: "Status changed",         dot: "bg-amber-500"  },
  "clients.listed":        { label: "Client list viewed",     dot: "bg-gray-300"   },
  "onboarding.started":    { label: "Onboarding started",     dot: "bg-amber-500"  },
  "sync.triggered":        { label: "M365 sync triggered",    dot: "bg-violet-500" },
  "graph.users_fetched":   { label: "Graph users fetched",    dot: "bg-teal-500"   },
  "integration.updated":   { label: "Integration updated",    dot: "bg-slate-500"  },
  "integration.viewed":    { label: "Integrations viewed",    dot: "bg-slate-400"  },
};

function actorInitials(email: string) {
  const name = email.split("@")[0].replace(/[._-]/g, " ");
  return name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("");
}

export default function DashboardPage() {
  const user = getUser();
  const [clients, setClients] = useState<Client[]>([]);
  const [events,  setEvents]  = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [meData,  setMeData]  = useState<{ display_name: string; role: string } | null>(null);

  useEffect(() => {
    Promise.all([api.clients(), api.audit(15), api.me()]).then(([c, e, me]) => {
      setClients(c);
      setEvents(e);
      setMeData({ display_name: me.display_name, role: me.role });
    }).finally(() => setLoading(false));
  }, []);

  const active     = clients.filter((c) => c.status === "active").length;
  const onboarding = clients.filter((c) => c.status === "onboarding").length;
  const suspended  = clients.filter((c) => c.status === "suspended").length;

  const displayName = meData?.display_name ?? user?.displayName ?? "—";
  const initials    = displayName.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  const role        = meData?.role ?? "staff";

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">

        <div className="flex items-center gap-4 bg-white border border-gray-200 rounded px-5 py-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0 select-none">
            {loading ? "…" : (initials || "?")}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {loading ? "Loading…" : `Welcome back, ${displayName}`}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {user?.email ?? ""}
              {role && <><span className="mx-1.5 text-gray-300">·</span><span className="capitalize">{role}</span></>}
            </p>
          </div>
          <div className="ml-auto shrink-0 flex items-center gap-1.5 text-xs text-green-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Signed in via Microsoft
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Active Clients"
            value={active}
            color="text-green-600"
            subtext="currently operational"
            loading={loading}
          />
          <StatCard
            label="In Onboarding"
            value={onboarding}
            color="text-amber-600"
            subtext="awaiting completion"
            loading={loading}
          />
          <StatCard
            label="Suspended"
            value={suspended}
            color="text-red-600"
            subtext="access restricted"
            loading={loading}
          />
        </div>

        <div className="bg-white rounded border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Recent Activity</h2>
            <Link href="/audit">
              <a className="text-xs text-blue-600 hover:underline">View all →</a>
            </Link>
          </div>

          {loading ? (
            <div className="divide-y divide-gray-100">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-gray-200 shrink-0" />
                  <div className="h-3 bg-gray-100 rounded w-48" />
                  <div className="ml-auto h-3 bg-gray-100 rounded w-16" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="p-6 text-sm text-gray-400 text-center">No activity yet.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {events.map((e) => {
                const meta = ACTION_META[e.action];
                const dot  = meta?.dot ?? "bg-gray-300";
                const label = meta?.label ?? e.action;
                const initials = actorInitials(e.actor_email);
                return (
                  <li key={e.id} className="px-4 py-3 flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 leading-tight">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{e.actor_email}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-semibold text-gray-500 select-none"
                        title={e.actor_email}
                      >
                        {initials}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap w-14 text-right">
                        {timeAgo(e.created_at)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({
  label, value, color, subtext, loading,
}: {
  label: string; value: number; color: string; subtext: string; loading: boolean;
}) {
  return (
    <div className="bg-white rounded border border-gray-200 px-5 py-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color} leading-none mb-1`}>
        {loading ? <span className="text-gray-200">—</span> : value}
      </p>
      <p className="text-[11px] text-gray-400">{subtext}</p>
    </div>
  );
}
