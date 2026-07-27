import { Router } from "express";
import db from "../db/database.js";

const router = Router();

router.post("/onboarding/start", (req, res) => {
  const { client_id } = req.body as { client_id?: unknown };

  if (!client_id) {
    res.status(400).json({ error: "client_id is required" });
    return;
  }

  const client = db
    .prepare("SELECT id, name, status FROM clients WHERE id = ?")
    .get(client_id) as { id: number; name: string; status: string } | undefined;

  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  db.prepare("UPDATE clients SET status = 'onboarding' WHERE id = ?").run(client.id);

  db.prepare(
    "INSERT INTO audit_events (actor_email, action, target_type, target_id, metadata) VALUES (?, ?, ?, ?, ?)"
  ).run(
    req.user?.email ?? "anonymous",
    "onboarding.started",
    "client",
    String(client.id),
    JSON.stringify({ client_name: client.name, triggered_by: req.user?.email ?? "anonymous" })
  );

  res.json({ success: true, client_id: client.id, status: "onboarding" });
});

export default router;
