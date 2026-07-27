import { Router } from "express";
import db from "../db/database.js";

const router = Router();

router.get("/graph/users", (req, res) => {
  const tenantId = req.query["tenant_id"] as string | undefined;

  if (!tenantId) {
    res.status(400).json({ error: "tenant_id query parameter is required" });
    return;
  }

  try {
    const client = db
      .prepare("SELECT id, name, tenant_id FROM clients WHERE tenant_id = ?")
      .get(tenantId) as { id: number; name: string; tenant_id: string } | undefined;

    if (!client) {
      res.status(404).json({ error: "Tenant not found" });
      return;
    }

    const users = db
      .prepare(
        "SELECT id, email, display_name, synced_at FROM microsoft_users WHERE client_id = ? ORDER BY synced_at DESC"
      )
      .all(client.id);

    db.prepare(
      "INSERT INTO audit_events (actor_email, action, target_type, target_id, metadata) VALUES (?, ?, ?, ?, ?)"
    ).run(
      req.user?.email ?? "anonymous",
      "graph.users_fetched",
      "client",
      String(client.id),
      JSON.stringify({ count: users.length })
    );

    res.json({ value: users, tenant_id: tenantId, client_name: client.name });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve users", detail: String(err) });
  }
});

export default router;
