import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getDashboardSummary } from "../services/analytics.service.js";
import { createPracticeQuestion, submitPracticeAnswer } from "../services/question.service.js";

const router = Router();

router.post("/random", requireAuth, async (req, res, next) => {
  try {
    const question = await createPracticeQuestion({
      userId: req.user.id,
      ...req.body
    });

    res.json({ question });
  } catch (error) {
    next(error);
  }
});

router.post("/:questionId/submit", requireAuth, async (req, res, next) => {
  try {
    const result = await submitPracticeAnswer({
      userId: req.user.id,
      questionId: req.params.questionId,
      answer: req.body.answer,
      timeSpentSeconds: req.body.timeSpentSeconds
    });

    const summary = await getDashboardSummary(req.user);

    res.json({
      ...result,
      recommendations: summary.recommendations,
      weakAreas: summary.weakAreas
    });
  } catch (error) {
    next(error);
  }
});

export default router;

