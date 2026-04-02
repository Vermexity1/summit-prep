import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getDashboardSummary } from "../services/analytics.service.js";

const router = Router();

router.get("/summary", requireAuth, async (req, res, next) => {
  try {
    const summary = await getDashboardSummary(req.user);
    res.json({ summary });
  } catch (error) {
    next(error);
  }
});

export default router;
