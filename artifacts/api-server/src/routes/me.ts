import { Router } from "express";

const router = Router();

router.get("/me", (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json(req.user);
});

export default router;
