import { useEffect, useState } from "react";
import Layout from "@/components/layout";
import { api } from "@/lib/api";

interface AuditEvent {
  id: number;
  actor_email: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: string | null;
  created_at: string;
}

const ACTION_META: Record<string, { label: string; badge: string }> = {
  "client.created":        { label: "Client created",       badge: "bg-blue-100  text-blue-700  border-blue-200"   },
  "client.viewed":         { label: "Client viewed",        badge: "bg-gray-100  text-gray-600  border-gray-200"   },
  "client.status_changed": { label: "Status changed",       badge: "bg-amber-100 text-amber-700 border-amber-200"  },
  "clients.listed":        { label: "Client list viewed",   badge: "bg-gray-100  text-gray-500  border-gray-200"   },
  "onboarding.started":    { label: "Onboarding started",   badge: "bg-amber-100 text-amber-700 border-amber-200"  },
  "sync.triggered":        { label: "M365 sync triggered",  badge: "bg-violet-100 text-violet-700 border-violet-200" },
  "graph.users_fetched":   { label: "Graph users fetched",  badge: "bg-teal-100  text-teal-700  border-teal-200"   },
  "integration.updated":   { label: "Integration updated",  badge: "bg-slate-100 text-slate-600 border-slate-200"  },
  "integration.viewed":    { label: "Integrations viewed",  badge: "bg-slate-100 text-slate-500 border-slate-200"  },
};

const ALL_ACTIONS = Object.keys(ACTION_META);

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr + " UTC").getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatFull(dateStr: string) {
  return new Date(dateStr + " UTC").toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function actorInitials(email: string) {
  const name = email.split("@")[0].replace(/[._-]/g, " ");
  return name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("");
}

function actorColor(email: string) {
  const colors = [
    "bg-blue-500", "bg-violet-500", "bg-teal-500",
    "bg-rose-500", "bg-amber-600", "bg-indigo-500",
  ];
  let hash = 0;
  for (const c of email) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return colors[hash % colors.length];
}

function parseMetadata(raw: string | null): string {
  if (!raw) return "—";
  try {
    const obj = JSON.parse(raw);
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ");
  } catch {
    return raw;
  }
}

export default function AuditPage() {
  const [events,   setEvents]   = useState<AuditEvent[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [filter,   setFilter]   = useState("all");

  useEffect(() => {
    api.audit(200)
      .then(setEvents)
      .catch((e: unknown) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all"
    ? events
    : events.filter((e) => e.action === filter);

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-0.5">Audit Log</h1>
            <p className="text-sm text-gray-500">
              {loading ? "Loading…" : `${filtered.length} event${filtered.length !== 1 ? "s" : ""}${filter !== "all" ? " (filtered)" : ""}`}
            </p>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All actions</option>
            {ALL_ACTIONS.map((a) => (
              <option key={a} value={a}>{ACTION_META[a]?.label ?? a}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">{error}</div>
        )}

        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-44">Actor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Target</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded w-16" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded w-28" /></td>
                    <td className="px-4 py-3"><div className="h-5 bg-gray-100 rounded w-32" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded w-16" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded w-40" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                    {filter === "all" ? "No events recorded yet." : `No events for this action type.`}
                  </td>
                </tr>
              ) : filtered.map((e) => {
                const meta   = ACTION_META[e.action];
                const badge  = meta?.badge ?? "bg-gray-100 text-gray-600 border-gray-200";
                const label  = meta?.label ?? e.action;
                const inits  = actorInitials(e.actor_email);
                const color  = actorColor(e.actor_email);
                return (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap" title={formatFull(e.created_at)}>
                      {timeAgo(e.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-full ${color} flex items-center justify-center text-[9px] font-semibold text-white select-none shrink-0`}
                          title={e.actor_email}
                        >
                          {inits}
                        </div>
                        <span className="text-xs text-gray-600 truncate" title={e.actor_email}>
                          {e.actor_email.split("@")[0]}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded border ${badge}`}>
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                      {e.target_type ? `${e.target_type}/${e.target_id}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate" title={e.metadata ?? ""}>
                      {parseMetadata(e.metadata)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!loading && filtered.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
              {filtered.length} event{filtered.length !== 1 ? "s" : ""}
              {filter !== "all" && ` · filter: ${ACTION_META[filter]?.label ?? filter}`}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
