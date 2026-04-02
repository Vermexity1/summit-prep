import { QUESTION_TYPE_LOOKUP } from "../data/seed/catalog.js";
import { buildLearnGuides, generateLocalQuestion } from "../data/seed/questions.js";
import { createHttpError, normalizeAnswer } from "../utils/helpers.js";
import { generateExplanationWithOpenAi, generateQuestionWithOpenAi } from "./ai.service.js";
import { addPracticeAttempt, getIssuedQuestion, saveIssuedQuestion } from "./data.service.js";

export function stripAnswerFields(question) {
  const { answerKey, acceptedAnswers, explanationSteps, ...safeQuestion } = question;
  return safeQuestion;
}

export function resolveCorrectAnswerText(question) {
  if (question.answerFormat === "numeric") {
    return question.acceptedAnswers[0];
  }

  const matchingChoice = question.choices.find(
    (choice) => normalizeAnswer(choice.id) === normalizeAnswer(question.answerKey)
  );

  return matchingChoice ? `${matchingChoice.id}. ${matchingChoice.text}` : question.answerKey;
}

export function isAnswerCorrect(question, answer) {
  const normalized = normalizeAnswer(answer);

  if (question.answerFormat === "numeric") {
    return question.acceptedAnswers.some((candidate) => normalizeAnswer(candidate) === normalized);
  }

  return (
    normalizeAnswer(question.answerKey) === normalized ||
    question.choices.some(
      (choice) =>
        normalizeAnswer(choice.id) === normalizeAnswer(question.answerKey) &&
        normalizeAnswer(choice.text) === normalized
    )
  );
}

export async function createPracticeQuestion({ userId, examType, section, type, difficulty }) {
  const localQuestion = generateLocalQuestion({
    examType,
    section,
    type,
    difficulty
  });

  // OpenAI can replace the prompt/explanation layer, but the local template keeps the app runnable offline.
  const aiQuestion = await generateQuestionWithOpenAi({
    examType,
    section,
    type,
    difficulty
  });

  const templateMetadata = QUESTION_TYPE_LOOKUP[type] || QUESTION_TYPE_LOOKUP[localQuestion.type];
  const mergedQuestion = {
    ...localQuestion,
    ...(aiQuestion || {}),
    type: type || localQuestion.type,
    typeLabel: templateMetadata?.label || localQuestion.typeLabel,
    domain: templateMetadata?.domain || localQuestion.domain
  };

  await saveIssuedQuestion({
    id: mergedQuestion.id,
    ownerUserId: userId,
    payload: mergedQuestion,
    createdAt: new Date().toISOString()
  });

  return stripAnswerFields(mergedQuestion);
}

export async function submitPracticeAnswer({ userId, questionId, answer, timeSpentSeconds = 0 }) {
  const issuedQuestion = await getIssuedQuestion(questionId);

  if (!issuedQuestion) {
    throw createHttpError("Question not found.", 404);
  }

  if (issuedQuestion.ownerUserId && issuedQuestion.ownerUserId !== userId) {
    throw createHttpError("This question belongs to a different user.", 403);
  }

  const question = issuedQuestion.payload;
  const correct = isAnswerCorrect(question, answer);
  const aiExplanation = await generateExplanationWithOpenAi(question, resolveCorrectAnswerText(question));

  await addPracticeAttempt({
    userId,
    questionId,
    section: question.section,
    type: question.type,
    domain: question.domain,
    examType: question.examType,
    difficulty: question.difficulty,
    year: question.year,
    userAnswer: String(answer ?? ""),
    correct,
    timeSpentSeconds: Number(timeSpentSeconds || 0),
    createdAt: new Date().toISOString()
  });

  return {
    correct,
    correctAnswer: resolveCorrectAnswerText(question),
    explanationSteps: aiExplanation?.explanationSteps || question.explanationSteps,
    bestApproach: aiExplanation?.bestApproach || question.bestApproach,
    question: stripAnswerFields(question)
  };
}

export function getLearnGuides({ section, type } = {}) {
  return buildLearnGuides().filter((guide) => {
    if (section && guide.section !== section) {
      return false;
    }

    if (type && guide.type !== type) {
      return false;
    }

    return true;
  });
}
