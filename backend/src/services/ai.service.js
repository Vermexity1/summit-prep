import OpenAI from "openai";
import { isOpenAiEnabled, config } from "../config/env.js";

const client = isOpenAiEnabled ? new OpenAI({ apiKey: config.openAiApiKey }) : null;

function parseJsonPayload(text = "") {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");
  return JSON.parse(cleaned);
}

function normalizeAiQuestion(question) {
  if (!question?.prompt || !question?.explanationSteps?.length) {
    return null;
  }

  return {
    prompt: question.prompt,
    passage: question.passage || "",
    answerFormat: question.answerFormat || "multiple-choice",
    choices: question.choices || [],
    answerKey: question.answerKey || null,
    acceptedAnswers: question.acceptedAnswers || [],
    explanationSteps: question.explanationSteps,
    bestApproach: question.bestApproach || "Reason carefully"
  };
}

export async function generateQuestionWithOpenAi({ examType, section, type, difficulty }) {
  if (!client) {
    return null;
  }

  try {
    const response = await client.responses.create({
      model: config.openAiModel,
      input: [
        {
          role: "system",
          content:
            "You create original SAT/PSAT-style questions. Return strict JSON only with keys: prompt, passage, answerFormat, choices, answerKey, acceptedAnswers, explanationSteps, bestApproach."
        },
        {
          role: "user",
          content: `Create one ${difficulty} ${examType} ${section} question of type ${type}. If answerFormat is multiple-choice, choices must be an array of four objects with id A-D and text. explanationSteps must contain 3 to 5 short strings. Keep the question original.`
        }
      ]
    });

    return normalizeAiQuestion(parseJsonPayload(response.output_text));
  } catch (error) {
    console.warn("OpenAI question generation failed. Falling back to local templates.");
    console.warn(error.message);
    return null;
  }
}

export async function generateExplanationWithOpenAi(question, correctAnswerText) {
  if (!client) {
    return null;
  }

  try {
    const response = await client.responses.create({
      model: config.openAiModel,
      input: [
        {
          role: "system",
          content:
            "You explain SAT/PSAT questions clearly for students. Return strict JSON only with keys: explanationSteps and bestApproach."
        },
        {
          role: "user",
          content: JSON.stringify({
            prompt: question.prompt,
            passage: question.passage || "",
            choices: question.choices || [],
            correctAnswerText
          })
        }
      ]
    });

    const parsed = parseJsonPayload(response.output_text);
    if (!parsed?.explanationSteps?.length) {
      return null;
    }

    return {
      explanationSteps: parsed.explanationSteps,
      bestApproach: parsed.bestApproach || question.bestApproach
    };
  } catch (error) {
    console.warn("OpenAI explanation generation failed. Using local explanation.");
    console.warn(error.message);
    return null;
  }
}

export async function generateStudyPlanWithOpenAi({ weakAreas, strengths }) {
  if (!client || !weakAreas?.length) {
    return null;
  }

  try {
    const response = await client.responses.create({
      model: config.openAiModel,
      input: [
        {
          role: "system",
          content:
            "You generate short personalized SAT study recommendations. Return strict JSON only with keys: headline and steps."
        },
        {
          role: "user",
          content: JSON.stringify({ weakAreas, strengths })
        }
      ]
    });

    const parsed = parseJsonPayload(response.output_text);
    if (!parsed?.steps?.length) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn("OpenAI study-plan generation failed.");
    console.warn(error.message);
    return null;
  }
}
