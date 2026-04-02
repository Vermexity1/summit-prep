import { EXAM_BLUEPRINTS, TEST_YEARS } from "../data/seed/catalog.js";
import { getQuestionBank, getQuestionTemplates } from "../data/seed/questions.js";
import { addTestResult, getMockTest, saveMockTest } from "./data.service.js";
import { isAnswerCorrect, resolveCorrectAnswerText, stripAnswerFields } from "./question.service.js";
import {
  choice,
  createHttpError,
  createId,
  normalizeAnswer,
  round,
  sampleWithoutReplacement,
  shuffle
} from "../utils/helpers.js";

function getDifficulty(index, total) {
  const ratio = index / total;

  if (ratio < 0.3) {
    return "easy";
  }

  if (ratio < 0.75) {
    return "medium";
  }

  return "hard";
}

function buildSectionQuestions(section, count, examType) {
  const difficulties = Array.from({ length: count }, (_item, index) => getDifficulty(index, count));
  const questions = difficulties.map((difficulty) => {
    const bankMatches = getQuestionBank({ examType, section, difficulty });

    if (bankMatches.length) {
      const year = choice(TEST_YEARS);
      return {
        ...JSON.parse(JSON.stringify(choice(bankMatches))),
        id: createId("q"),
        year,
        sourceLabel: `Original Summit Prep practice set (${year})`
      };
    }

    const templates = getQuestionTemplates({ section });
    const template = choice(templates);

    return template.build({
      examType,
      difficulty,
      year: choice(TEST_YEARS)
    });
  });

  return sampleWithoutReplacement(questions, count);
}

function scaleScore(raw, total, [min, max]) {
  if (!total) {
    return min;
  }

  // This is a training estimate, not an official College Board conversion table.
  const scaled = min + (raw / total) * (max - min);
  return Math.round(scaled / 10) * 10;
}

function buildTypeBreakdown(questionReviews) {
  const grouped = questionReviews.reduce((lookup, review) => {
    lookup[review.type] ??= [];
    lookup[review.type].push(review);
    return lookup;
  }, {});

  return Object.entries(grouped)
    .map(([type, items]) => ({
      type,
      label: items[0].typeLabel,
      section: items[0].section,
      correct: items.filter((item) => item.correct).length,
      total: items.length,
      accuracy: round((items.filter((item) => item.correct).length / items.length) * 100)
    }))
    .sort((left, right) => left.accuracy - right.accuracy);
}

function buildPublicTest(test) {
  return {
    ...test,
    questions: test.questions.map((question) => stripAnswerFields(question))
  };
}

export async function createMockTest({ userId, examType = "SAT" }) {
  const blueprint = EXAM_BLUEPRINTS[examType] || EXAM_BLUEPRINTS.SAT;
  const readingQuestions = buildSectionQuestions("reading", blueprint.readingCount, examType);
  const writingQuestions = buildSectionQuestions("writing", blueprint.writingCount, examType);
  const mathQuestions = buildSectionQuestions("math", blueprint.mathCount, examType);
  const questions = [...readingQuestions, ...writingQuestions, ...mathQuestions];

  const test = {
    id: createId("test"),
    ownerUserId: userId,
    examType,
    totalQuestions: questions.length,
    totalTimeMinutes: blueprint.totalTimeMinutes,
    questions,
    createdAt: new Date().toISOString()
  };

  await saveMockTest(test);
  return buildPublicTest(test);
}

export async function getPublicMockTest(testId, userId) {
  const test = await getMockTest(testId);

  if (!test) {
    throw createHttpError("Test not found.", 404);
  }

  if (test.ownerUserId && test.ownerUserId !== userId) {
    throw createHttpError("This test belongs to another user.", 403);
  }

  return buildPublicTest(test);
}

export async function submitMockTest({ userId, testId, answers = {}, timeSpentSeconds = 0 }) {
  const test = await getMockTest(testId);

  if (!test) {
    throw createHttpError("Test not found.", 404);
  }

  if (test.ownerUserId && test.ownerUserId !== userId) {
    throw createHttpError("This test belongs to another user.", 403);
  }

  const blueprint = EXAM_BLUEPRINTS[test.examType] || EXAM_BLUEPRINTS.SAT;
  const questionReviews = test.questions.map((question) => {
    const userAnswer = String(answers[question.id] ?? "");
    const correct = isAnswerCorrect(question, userAnswer);

    return {
      id: question.id,
      section: question.section,
      type: question.type,
      typeLabel: question.typeLabel,
      domain: question.domain,
      prompt: question.prompt,
      passage: question.passage || "",
      answerFormat: question.answerFormat,
      choices: question.choices || [],
      userAnswer,
      normalizedUserAnswer: normalizeAnswer(userAnswer),
      correct,
      correctAnswer: resolveCorrectAnswerText(question),
      explanationSteps: question.explanationSteps
    };
  });

  const readingCorrect = questionReviews.filter(
    (review) => review.section === "reading" && review.correct
  ).length;
  const writingCorrect = questionReviews.filter(
    (review) => review.section === "writing" && review.correct
  ).length;
  const mathCorrect = questionReviews.filter((review) => review.section === "math" && review.correct).length;
  const verbalCorrect = readingCorrect + writingCorrect;
  const verbalTotal = blueprint.readingCount + blueprint.writingCount;
  const verbalScore = scaleScore(verbalCorrect, verbalTotal, blueprint.scoreRange.verbal);
  const mathScore = scaleScore(mathCorrect, blueprint.mathCount, blueprint.scoreRange.math);
  const totalScore = verbalScore + mathScore;

  const result = {
    id: createId("result"),
    userId,
    testId,
    examType: test.examType,
    totalScore,
    verbalScore,
    mathScore,
    timeSpentSeconds: Number(timeSpentSeconds || 0),
    questionCount: test.questions.length,
    sectionBreakdown: {
      reading: {
        correct: readingCorrect,
        total: blueprint.readingCount,
        accuracy: round((readingCorrect / blueprint.readingCount) * 100)
      },
      writing: {
        correct: writingCorrect,
        total: blueprint.writingCount,
        accuracy: round((writingCorrect / blueprint.writingCount) * 100)
      },
      math: {
        correct: mathCorrect,
        total: blueprint.mathCount,
        accuracy: round((mathCorrect / blueprint.mathCount) * 100)
      }
    },
    questionTypeBreakdown: buildTypeBreakdown(questionReviews),
    questionReviews,
    createdAt: new Date().toISOString()
  };

  await addTestResult(result);

  return {
    id: result.id,
    examType: result.examType,
    totalScore: result.totalScore,
    verbalScore: result.verbalScore,
    mathScore: result.mathScore,
    sectionBreakdown: result.sectionBreakdown,
    questionTypeBreakdown: result.questionTypeBreakdown,
    questionReviews: result.questionReviews,
    createdAt: result.createdAt
  };
}
