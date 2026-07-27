import { useState } from "react";
import Layout from "@/components/layout";

const AZURE = {
  tenantId:     "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  clientId:     "12345678-abcd-ef01-2345-6789abcdef01",
  clientSecret: "3Tg8Q~mKzX.placeholder-secret-value",
  authority:    "https://login.microsoftonline.com/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
};

const PERMISSIONS = [
  { scope: "User.Read.All",       type: "Application", status: "granted" },
  { scope: "Directory.Read.All",  type: "Application", status: "granted" },
  { scope: "GroupMember.Read.All",type: "Application", status: "granted" },
  { scope: "offline_access",      type: "Delegated",   status: "granted" },
  { scope: "AuditLog.Read.All",   type: "Application", status: "pending" },
];

function CopyField({ label, value, mono = true, obscure = false }: {
  label: string; value: string; mono?: boolean; obscure?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const display = obscure ? value.slice(0, 4) + "••••••••••••••••••••" + value.slice(-4) : value;

  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <p className={`flex-1 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded px-3 py-1.5 truncate ${mono ? "font-mono text-xs" : ""}`}>
          {display}
        </p>
        <button
          onClick={copy}
          className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-1.5 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export default function AdminIntegrationsPage() {
  const [syncSchedule, setSyncSchedule] = useState("daily");
  const [syncScopes,   setSyncScopes]   = useState(["Users"]);
  const [saved, setSaved]               = useState(false);
  const [saving, setSaving]             = useState(false);

  function toggleScope(scope: string) {
    setSyncScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900 mb-0.5">Integrations</h1>
        <p className="text-sm text-gray-500 mb-6">Microsoft 365 tenant configuration and sync settings.</p>

        <div className="bg-white rounded border border-gray-200 mb-5">
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
                  <rect x="0"  y="0"  width="10" height="10" fill="#F25022"/>
                  <rect x="11" y="0"  width="10" height="10" fill="#7FBA00"/>
                  <rect x="0"  y="11" width="10" height="10" fill="#00A4EF"/>
                  <rect x="11" y="11" width="10" height="10" fill="#FFB900"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Microsoft 365</p>
                <p className="text-xs text-gray-400 mt-0.5">Azure Active Directory · App registration connected</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Connected
            </div>
          </div>
          <div className="px-5 pb-4 grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-gray-500 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-1.5"><span className="text-gray-300">Last auth:</span> 07 Jul 2026 06:14 UTC</div>
            <div className="flex items-center gap-1.5"><span className="text-gray-300">Token expires:</span> 07 Jul 2026 07:14 UTC</div>
            <div className="flex items-center gap-1.5"><span className="text-gray-300">Last sync:</span> 07 Jul 2026 04:00 UTC</div>
            <div className="flex items-center gap-1.5"><span className="text-gray-300">Sync result:</span>
              <span className="text-green-600 font-medium">Success — 47 users</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 mb-5">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">App Registration</h2>
            <p className="text-xs text-gray-400 mt-0.5">Read-only — managed by your Azure administrator.</p>
          </div>
          <div className="px-5 py-4 space-y-4">
            <CopyField label="Tenant ID"       value={AZURE.tenantId}     />
            <CopyField label="Client ID"       value={AZURE.clientId}     />
            <CopyField label="Client Secret"   value={AZURE.clientSecret} obscure />
            <CopyField label="Authority URL"   value={AZURE.authority}    />
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 mb-5">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">API Permissions</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {PERMISSIONS.map((p) => (
              <div key={p.scope} className="px-5 py-2.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-gray-700">{p.scope}</span>
                  <span className="ml-2 text-[10px] text-gray-400 uppercase tracking-wide">{p.type}</span>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                  p.status === "granted"
                    ? "text-green-700 bg-green-50 border-green-200"
                    : "text-amber-700 bg-amber-50 border-amber-200"
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Sync Settings</h2>
          </div>
          <div className="px-5 py-4 space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Sync Schedule</label>
              <select
                value={syncSchedule}
                onChange={(e) => setSyncSchedule(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="realtime">Real-time (webhook)</option>
                <option value="hourly">Every hour</option>
                <option value="daily">Daily at 04:00 UTC</option>
                <option value="manual">Manual only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Objects to Sync</label>
              <div className="space-y-2">
                {["Users", "Groups", "Licenses", "Devices"].map((s) => (
                  <label key={s} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={syncScopes.includes(s)}
                      onChange={() => toggleScope(s)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{s}</span>
                    {s === "Devices" && (
                      <span className="text-[10px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 uppercase tracking-wide">Requires Intune</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {saved && (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-4 py-2.5">
                Settings saved successfully.
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded transition-colors"
            >
              {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </div>

      </div>
    </Layout>
  );
}
