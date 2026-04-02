import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getCurrentUserFromLocalSession,
  loginLocalUser,
  logoutByToken,
  registerLocalUser
} from "../services/auth.service.js";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const result = await registerLocalUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const result = await loginLocalUser(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/logout", requireAuth, async (req, res, next) => {
  try {
    await logoutByToken(req.authToken);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = req.user || (await getCurrentUserFromLocalSession(req.authToken));
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;

