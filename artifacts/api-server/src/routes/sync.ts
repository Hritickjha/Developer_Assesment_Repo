import { Router } from "express";
import db from "../db/database.js";

const router = Router();

interface GraphUser {
  ms_user_id: string;
  email: string;
  display_name: string;
}

function fetchGraphUsers(tenantId: string, clientName: string): GraphUser[] {
  const prefix = tenantId.slice(0, 8);
  const slug   = clientName.toLowerCase().replace(/\s+/g, "");

  return [
    { ms_user_id: `${prefix}-001`, email: `admin@${slug}.onmicrosoft.com`,   display_name: `${clientName} Admin`       },
    { ms_user_id: `${prefix}-002`, email: `finance@${slug}.onmicrosoft.com`, display_name: `${clientName} Finance`     },
    { ms_user_id: `${prefix}-003`, email: `ops@${slug}.onmicrosoft.com`,     display_name: `${clientName} Operations`  },
    { ms_user_id: `${prefix}-004`, email: `it@${slug}.onmicrosoft.com`,      display_name: `${clientName} IT`          },
    { ms_user_id: `${prefix}-005`, email: `hr@${slug}.onmicrosoft.com`,      display_name: `${clientName} HR`          },
  ];
}

router.post("/sync/microsoft", (req, res) => {
  const { client_id } = req.body as { client_id?: unknown };

  if (!client_id) {
    res.status(400).json({ error: "client_id is required" });
    return;
  }

  const client = db
    .prepare("SELECT id, name, tenant_id FROM clients WHERE id = ?")
    .get(client_id) as { id: number; name: string; tenant_id: string } | undefined;

  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  const graphUsers = fetchGraphUsers(client.tenant_id, client.name);

  const insert = db.prepare(
    "INSERT INTO microsoft_users (client_id, ms_user_id, email, display_name, synced_at) VALUES (?, ?, ?, ?, datetime('now'))"
  );

  for (const u of graphUsers) {
    insert.run(client.id, u.ms_user_id, u.email, u.display_name);
  }

  db.prepare(
    "INSERT INTO audit_events (actor_email, action, target_type, target_id, metadata) VALUES (?, ?, ?, ?, ?)"
  ).run(
    req.user?.email ?? "anonymous",
    "sync.triggered",
    "client",
    String(client.id),
    JSON.stringify({ synced: graphUsers.length, tenant_id: client.tenant_id })
  );

  res.json({ success: true, synced: graphUsers.length });
});

export default router;
