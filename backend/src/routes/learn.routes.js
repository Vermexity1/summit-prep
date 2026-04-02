import { Router } from "express";
import { getLearnGuides } from "../services/question.service.js";

const router = Router();

router.get("/guides", (req, res) => {
  const guides = getLearnGuides({
    section: req.query.section,
    type: req.query.type
  });

  res.json({ guides });
});

export default router;

