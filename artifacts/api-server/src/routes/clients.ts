import { Router } from "express";
import db from "../db/database.js";

const router = Router();

router.get("/clients", (req, res) => {
  const clients = db
    .prepare("SELECT * FROM clients ORDER BY created_at DESC")
    .all();

  if (req.user) {
    try {
      db.prepare(
        "INSERT INTO audit_events (actor_email, action) VALUES (?, ?)"
      ).run(req.user.email, "clients.listed");
    } catch {
    }
  }

  res.json(clients);
});

router.get("/clients/:id", (req, res) => {
  const { id } = req.params;

  const client = db
    .prepare("SELECT * FROM clients WHERE id = ?")
    .get(id);

  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }

  const microsoftUsers = db
    .prepare(
      "SELECT id, email, display_name, synced_at FROM microsoft_users WHERE client_id = ? ORDER BY synced_at DESC"
    )
    .all(id);

  try {
    db.prepare(
      "INSERT INTO audit_events (actor_email, action, target_type, target_id) VALUES (?, ?, ?, ?)"
    ).run(req.user?.email ?? "anonymous", "client.viewed", "client", id);
  } catch {
  }

  res.json({ ...client, microsoft_users: microsoftUsers });
});

export default router;
