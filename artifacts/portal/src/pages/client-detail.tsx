import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import Layout from "@/components/layout";
import { api } from "@/lib/api";

interface MsUser {
  id: number;
  email: string;
  display_name: string;
  synced_at: string;
}

interface Client {
  id: number;
  name: string;
  tenant_id: string;
  status: string;
  created_at: string;
  microsoft_users: MsUser[];
}

const STATUS_BADGE: Record<string, string> = {
  active:     "bg-green-100 text-green-700 border border-green-200",
  onboarding: "bg-amber-100 text-amber-700 border border-amber-200",
  suspended:  "bg-red-100  text-red-700   border border-red-200",
};

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("");
}

function userColor(email: string) {
  const colors = [
    "bg-blue-500", "bg-violet-500", "bg-teal-500",
    "bg-rose-500", "bg-amber-500", "bg-indigo-500",
  ];
  let hash = 0;
  for (const c of email) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return colors[hash % colors.length];
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(s: string) {
  return new Date(s + " UTC").toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

type ActionState = "idle" | "loading" | "success" | "error";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient]               = useState<Client | null>(null);
  const [loading, setLoading]             = useState(true);
  const [error,   setError]               = useState("");
  const [onboardState, setOnboardState]   = useState<ActionState>("idle");
  const [onboardMsg,   setOnboardMsg]     = useState("");
  const [syncState,    setSyncState]      = useState<ActionState>("idle");
  const [syncMsg,      setSyncMsg]        = useState("");

  function loadClient() {
    return api.client(id)
      .then(setClient)
      .catch((e: unknown) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadClient(); }, [id]);

  async function handleStartOnboarding() {
    setOnboardState("loading");
    setOnboardMsg("");
    try {
      await api.startOnboarding(Number(id));
      setOnboardMsg("Onboarding workflow started successfully.");
      setOnboardState("success");
      await loadClient();
    } catch (e: unknown) {
      setOnboardMsg((e as Error).message ?? "Something went wrong.");
      setOnboardState("error");
    }
  }

  async function handleSync() {
    setSyncState("loading");
    setSyncMsg("");
    try {
      const res = await api.syncMicrosoft(Number(id));
      setSyncMsg(`Sync complete — ${res.synced} users imported from Microsoft 365.`);
      setSyncState("success");
      await loadClient();
    } catch (e: unknown) {
      setSyncMsg((e as Error).message ?? "Sync failed.");
      setSyncState("error");
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-6 max-w-4xl mx-auto animate-pulse space-y-4">
          <div className="h-4 bg-gray-100 rounded w-32" />
          <div className="h-6 bg-gray-100 rounded w-56" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      </Layout>
    );
  }

  if (error || !client) {
    return (
      <Layout>
        <div className="p-6 max-w-4xl mx-auto">
          <Link href="/clients"><a className="text-sm text-blue-600 hover:underline">← Back to clients</a></Link>
          <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">
            {error || "Client not found."}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">

        <Link href="/clients">
          <a className="text-sm text-gray-400 hover:text-gray-600 hover:underline transition-colors">← Clients</a>
        </Link>

        <div className="flex items-start justify-between mt-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 select-none shrink-0">
              {initials(client.name)}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 leading-tight">{client.name}</h1>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{client.tenant_id}</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE[client.status] ?? "bg-gray-100 text-gray-600"}`}>
            {client.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <InfoCard label="Status"  value={<span className="capitalize">{client.status}</span>} />
          <InfoCard label="Added"   value={formatDate(client.created_at)} />
          <InfoCard label="M365 Users" value={`${client.microsoft_users.length} synced`} />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <ActionButton
            onClick={handleStartOnboarding}
            state={onboardState}
            label="Start Onboarding"
            loadingLabel="Starting…"
            variant="primary"
          />
          <ActionButton
            onClick={handleSync}
            state={syncState}
            label="Sync M365 Users"
            loadingLabel="Syncing…"
            variant="secondary"
          />
        </div>

        {onboardMsg && (
          <div className={`mb-4 text-sm rounded px-4 py-2.5 border ${onboardState === "error" ? "text-red-700 bg-red-50 border-red-200" : "text-blue-700 bg-blue-50 border-blue-200"}`}>
            {onboardMsg}
          </div>
        )}
        {syncMsg && (
          <div className={`mb-4 text-sm rounded px-4 py-2.5 border ${syncState === "error" ? "text-red-700 bg-red-50 border-red-200" : "text-green-700 bg-green-50 border-green-200"}`}>
            {syncMsg}
          </div>
        )}

        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Microsoft 365 Users</h2>
            <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
              {client.microsoft_users.length}
            </span>
          </div>

          {client.microsoft_users.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-gray-400 mb-1">No users synced yet.</p>
              <p className="text-xs text-gray-300">Click "Sync M365 Users" to import from Microsoft 365.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Synced</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {client.microsoft_users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-full ${userColor(u.email)} flex items-center justify-center text-[10px] font-semibold text-white select-none shrink-0`}>
                          {initials(u.display_name)}
                        </div>
                        <span className="text-gray-900 font-medium">{u.display_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{u.email}</td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs">{formatDateTime(u.synced_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </Layout>
  );
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded px-4 py-3">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function ActionButton({
  onClick, state, label, loadingLabel, variant,
}: {
  onClick: () => void;
  state: ActionState;
  label: string;
  loadingLabel: string;
  variant: "primary" | "secondary";
}) {
  const busy = state === "loading";
  const base = "px-4 py-2 text-sm font-medium rounded transition-colors flex items-center gap-2 disabled:opacity-60";
  const styles = variant === "primary"
    ? `${base} bg-blue-600 hover:bg-blue-700 text-white`
    : `${base} bg-white border border-gray-300 hover:bg-gray-50 text-gray-700`;

  return (
    <button onClick={onClick} disabled={busy} className={styles}>
      {busy && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {busy ? loadingLabel : label}
    </button>
  );
}
