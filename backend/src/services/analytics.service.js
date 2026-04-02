import { QUESTION_TYPE_LOOKUP } from "../data/seed/catalog.js";
import { generateLocalQuestion } from "../data/seed/questions.js";
import { mean, round } from "../utils/helpers.js";
import { generateStudyPlanWithOpenAi } from "./ai.service.js";
import { listPracticeAttemptsByUser, listTestResultsByUser } from "./data.service.js";
import { stripAnswerFields } from "./question.service.js";

function buildSectionPerformance(practiceAttempts) {
  const sections = ["reading", "writing", "math"];

  return sections.map((section) => {
    const attempts = practiceAttempts.filter((attempt) => attempt.section === section);
    const accuracy = attempts.length
      ? round((attempts.filter((attempt) => attempt.correct).length / attempts.length) * 100)
      : 0;

    return {
      section,
      attempts: attempts.length,
      accuracy
    };
  });
}

function buildTopicMastery(practiceAttempts) {
  const grouped = practiceAttempts.reduce((lookup, attempt) => {
    lookup[attempt.type] ??= [];
    lookup[attempt.type].push(attempt);
    return lookup;
  }, {});

  return Object.entries(grouped)
    .map(([type, attempts]) => {
      const accuracy = round((attempts.filter((attempt) => attempt.correct).length / attempts.length) * 100);
      const metadata = QUESTION_TYPE_LOOKUP[type];

      return {
        type,
        label: metadata?.label || type,
        section: attempts[0].section,
        domain: metadata?.domain || attempts[0].domain,
        attempts: attempts.length,
        accuracy
      };
    })
    .sort((left, right) => {
      if (left.accuracy !== right.accuracy) {
        return left.accuracy - right.accuracy;
      }

      return right.attempts - left.attempts;
    });
}

function buildScoreEstimate(sectionPerformance, latestTest) {
  if (latestTest) {
    return latestTest.totalScore;
  }

  const readingAccuracy = sectionPerformance.find((item) => item.section === "reading")?.accuracy || 0;
  const writingAccuracy = sectionPerformance.find((item) => item.section === "writing")?.accuracy || 0;
  const mathAccuracy = sectionPerformance.find((item) => item.section === "math")?.accuracy || 0;
  const verbalEstimated = 200 + mean([readingAccuracy, writingAccuracy]) * 6;
  const mathEstimated = 200 + mathAccuracy * 6;

  return Math.round(verbalEstimated + mathEstimated);
}

function buildRecommendations(weakAreas, targetExam) {
  return weakAreas.slice(0, 3).map((area) => {
    const previewQuestion = generateLocalQuestion({
      examType: targetExam || "SAT",
      section: area.section,
      type: area.type,
      difficulty: area.accuracy < 50 ? "easy" : "medium"
    });

    return {
      ...area,
      reason:
        area.accuracy < 50
          ? "Accuracy is below 50%, so rebuild this skill with easier reps."
          : "This topic is improving, but a few more reps should raise consistency.",
      previewQuestion: stripAnswerFields(previewQuestion)
    };
  });
}

function buildWeeklyActivity(practiceAttempts, testResults) {
  const lookup = {};

  [...practiceAttempts, ...testResults].forEach((item) => {
    const date = item.createdAt.slice(0, 10);
    lookup[date] ??= { date, questions: 0, minutes: 0 };
    lookup[date].questions += item.questionCount || 1;
    lookup[date].minutes += Math.round((item.timeSpentSeconds || 0) / 60);
  });

  return Object.values(lookup).sort((left, right) => left.date.localeCompare(right.date)).slice(-7);
}

export async function getDashboardSummary(user) {
  const [practiceAttempts, testResults] = await Promise.all([
    listPracticeAttemptsByUser(user.id),
    listTestResultsByUser(user.id)
  ]);

  const sectionPerformance = buildSectionPerformance(practiceAttempts);
  const topicMastery = buildTopicMastery(practiceAttempts);
  const weakAreas = topicMastery.filter((item) => item.attempts >= 2).slice(0, 5);
  const strengths = [...topicMastery].reverse().slice(0, 3);
  const latestTest = testResults[0] || null;
  const totalPracticeTimeSeconds = practiceAttempts.reduce(
    (sum, attempt) => sum + (attempt.timeSpentSeconds || 0),
    0
  );
  const totalTestTimeSeconds = testResults.reduce((sum, result) => sum + (result.timeSpentSeconds || 0), 0);
  const recentScores = [...testResults]
    .reverse()
    .slice(-6)
    .map((result) => ({
      date: result.createdAt.slice(0, 10),
      examType: result.examType,
      score: result.totalScore
    }));

  const recommendations = buildRecommendations(weakAreas, user.preferences?.targetExam);
  const studyPlan = await generateStudyPlanWithOpenAi({
    weakAreas: weakAreas.map((area) => ({
      label: area.label,
      accuracy: area.accuracy
    })),
    strengths: strengths.map((area) => area.label)
  });

  return {
    scoreEstimate: buildScoreEstimate(sectionPerformance, latestTest),
    totalPracticeQuestions: practiceAttempts.length,
    totalTestsCompleted: testResults.length,
    totalTimeMinutes: Math.round((totalPracticeTimeSeconds + totalTestTimeSeconds) / 60),
    practiceAccuracy: practiceAttempts.length
      ? round((practiceAttempts.filter((attempt) => attempt.correct).length / practiceAttempts.length) * 100)
      : 0,
    sectionPerformance,
    topicMastery,
    weakAreas,
    strengths,
    recommendations,
    recentScores,
    weeklyActivity: buildWeeklyActivity(practiceAttempts, testResults),
    studyPlan,
    latestTestSummary: latestTest
      ? {
          examType: latestTest.examType,
          totalScore: latestTest.totalScore,
          verbalScore: latestTest.verbalScore,
          mathScore: latestTest.mathScore,
          createdAt: latestTest.createdAt
        }
      : null
  };
}
