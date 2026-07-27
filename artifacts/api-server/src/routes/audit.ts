import { Router } from "express";
import db from "../db/database.js";

const router = Router();

router.get("/audit", (req, res) => {
  const raw   = req.query["limit"] as string | undefined;
  const limit = raw ? Math.min(parseInt(raw, 10), 200) : 50;

  if (isNaN(limit) || limit < 1) {
    res.status(400).json({ error: "limit must be a positive integer" });
    return;
  }

  const events = db
    .prepare(
      `SELECT id, actor_email, action, target_type, target_id, metadata, created_at
         FROM audit_events
        ORDER BY created_at DESC
        LIMIT ?`
    )
    .all(limit);

  res.json(events);
});

export default router;
