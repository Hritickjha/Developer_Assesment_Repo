import { useEffect, useState } from "react";
import { Link } from "wouter";
import Layout from "@/components/layout";
import { api } from "@/lib/api";

interface Client {
  id: number;
  name: string;
  tenant_id: string;
  status: string;
  created_at: string;
}

const STATUS_BADGE: Record<string, string> = {
  active:     "bg-green-100 text-green-700 border border-green-200",
  onboarding: "bg-amber-100 text-amber-700 border border-amber-200",
  suspended:  "bg-red-100  text-red-700   border border-red-200",
};

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("");
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      onClick={copy}
      className="ml-1.5 text-gray-300 hover:text-gray-500 transition-colors align-middle"
      title="Copy tenant ID"
    >
      {copied ? "✓" : "⎘"}
    </button>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");

  useEffect(() => {
    api.clients()
      .then(setClients)
      .catch((e: unknown) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter((c) =>
    search.trim() === "" ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.tenant_id.toLowerCase().includes(search.toLowerCase()) ||
    c.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-0.5">Clients</h1>
            <p className="text-sm text-gray-500">
              {loading ? "Loading…" : `${clients.length} managed account${clients.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="search"
              placeholder="Filter by name or status…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">{error}</div>
        )}

        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tenant ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Added</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded bg-gray-100 shrink-0" />
                        <div className="h-3 bg-gray-100 rounded w-32" />
                      </div>
                    </td>
                    <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded w-64" /></td>
                    <td className="px-4 py-3"><div className="h-5 bg-gray-100 rounded-full w-16" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-gray-100 rounded w-20" /></td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                    {search ? `No clients matching "${search}"` : "No clients found."}
                  </td>
                </tr>
              ) : filtered.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/clients/${c.id}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-[11px] font-bold text-blue-600 shrink-0 select-none">
                        {initials(c.name)}
                      </div>
                      <span className="font-medium text-gray-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                    {c.tenant_id}
                    <CopyButton value={c.tenant_id} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[c.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(c.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/clients/${c.id}`}>
                      <a
                        className="text-blue-600 hover:underline text-xs font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View →
                      </a>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && filtered.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
              Showing {filtered.length} of {clients.length} client{clients.length !== 1 ? "s" : ""}
              {search && ` matching "${search}"`}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
