import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createMockTest, getPublicMockTest, submitMockTest } from "../services/test.service.js";

const router = Router();

router.post("/mock", requireAuth, async (req, res, next) => {
  try {
    const test = await createMockTest({
      userId: req.user.id,
      examType: req.body.examType
    });

    res.status(201).json({ test });
  } catch (error) {
    next(error);
  }
});

router.get("/mock/:testId", requireAuth, async (req, res, next) => {
  try {
    const test = await getPublicMockTest(req.params.testId, req.user.id);
    res.json({ test });
  } catch (error) {
    next(error);
  }
});

router.post("/mock/:testId/submit", requireAuth, async (req, res, next) => {
  try {
    const result = await submitMockTest({
      userId: req.user.id,
      testId: req.params.testId,
      answers: req.body.answers,
      timeSpentSeconds: req.body.timeSpentSeconds
    });

    res.json({ result });
  } catch (error) {
    next(error);
  }
});

export default router;

