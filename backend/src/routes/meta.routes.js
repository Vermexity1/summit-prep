import { Router } from "express";
import { EXAM_BLUEPRINTS, OFFICIAL_RESOURCES, QUESTION_CATALOG } from "../data/seed/catalog.js";
import { getQuestionBankStats } from "../data/seed/questions.js";

const router = Router();

router.get("/catalog", (_req, res) => {
  res.json({
    exams: EXAM_BLUEPRINTS,
    sections: QUESTION_CATALOG,
    officialResources: OFFICIAL_RESOURCES,
    questionBankStats: getQuestionBankStats(),
    demoAccount: {
      email: "demo@summitprep.dev",
      password: "demo1234"
    }
  });
});

export default router;
