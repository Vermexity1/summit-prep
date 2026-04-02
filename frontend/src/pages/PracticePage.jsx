import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import QuestionCard from "../components/QuestionCard";

export default function PracticePage() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [catalog, setCatalog] = useState(null);
  const [officialResources, setOfficialResources] = useState(null);
  const [questionBankStats, setQuestionBankStats] = useState(null);
  const [filters, setFilters] = useState({
    examType: "SAT",
    section: searchParams.get("section") || "math",
    type: searchParams.get("type") || "",
    difficulty: "hard"
  });
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCatalog() {
      const response = await api.get("/meta/catalog");
      setCatalog(response.sections);
      setOfficialResources(response.officialResources);
      setQuestionBankStats(response.questionBankStats);
    }

    loadCatalog();
  }, []);

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      section: searchParams.get("section") || current.section,
      type: searchParams.get("type") || ""
    }));
  }, [searchParams]);

  const sectionTypes = catalog?.[filters.section] || [];
  const filteredOfficialResources =
    officialResources?.items?.filter((resource) => {
      const examMatch =
        !resource.examTypes?.length || resource.examTypes.includes(filters.examType);
      const sectionMatch =
        !resource.sections?.length || resource.sections.includes(filters.section);

      return examMatch && sectionMatch;
    }) || [];

  const updateFilter = (event) => {
    const { name, value } = event.target;
    const nextFilters = {
      ...filters,
      [name]: value
    };

    if (name === "section") {
      const next = new URLSearchParams(searchParams);
      next.set("section", value);
      next.delete("type");
      setSearchParams(next);
      nextFilters.type = "";
    }

    if (name === "type") {
      const next = new URLSearchParams(searchParams);
      next.set("section", filters.section);
      if (value) {
        next.set("type", value);
      } else {
        next.delete("type");
      }
      setSearchParams(next);
    }

    setFilters(nextFilters);
  };

  const generateQuestion = async () => {
    setGenerating(true);
    setResult(null);
    setFeedback(null);
    setAnswer("");
    setError("");

    try {
      const response = await api.post("/questions/random", filters, token);
      setQuestion(response.question);
      setStartedAt(Date.now());
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setGenerating(false);
    }
  };

  const submitAnswer = async () => {
    if (!question) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await api.post(
        `/questions/${question.id}/submit`,
        {
          answer,
          timeSpentSeconds: startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0
        },
        token
      );

      setResult(response);
      setFeedback({
        recommendations: response.recommendations,
        weakAreas: response.weakAreas
      });
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="stack-lg">
      <section className="panel page-header">
        <p className="eyebrow">Unlimited random questions</p>
        <h1>Train with tougher adaptive questions and keep official released material close by.</h1>
        <p className="muted-text">
          Summit Prep keeps its built-in questions original, but defaults this practice mode to a
          harder exam-level setting. For genuine College Board-released prompts, use the official
          resources panel below.
        </p>
        <div className="filters-row">
          <label>
            <span>Exam</span>
            <select name="examType" value={filters.examType} onChange={updateFilter}>
              <option value="SAT">SAT</option>
              <option value="PSAT">PSAT</option>
            </select>
          </label>

          <label>
            <span>Section</span>
            <select name="section" value={filters.section} onChange={updateFilter}>
              <option value="math">Math</option>
              <option value="reading">Reading</option>
              <option value="writing">Writing</option>
            </select>
          </label>

          <label>
            <span>Type</span>
            <select name="type" value={filters.type} onChange={updateFilter}>
              <option value="">Any type</option>
              {sectionTypes.map((entry) => (
                <option key={entry.type} value={entry.type}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Difficulty</span>
            <select name="difficulty" value={filters.difficulty} onChange={updateFilter}>
              <option value="hard">Exam-level</option>
              <option value="medium">Standard</option>
              <option value="easy">Easy</option>
            </select>
          </label>
        </div>

        <button className="primary-button inline-button" onClick={generateQuestion} disabled={generating}>
          {generating ? "Generating..." : "Generate question"}
        </button>
        {error ? <p className="form-error">{error}</p> : null}
      </section>

      <section className="two-column-grid practice-support-grid">
        <article className="panel tutor-panel">
          <p className="eyebrow">Tutor guidance</p>
          <h2>How to use this mode well</h2>
          <div className="stack-sm">
            <div className="coach-note">
              <strong>Use exam-level by default.</strong>
              <p className="muted-text">
                The hardest setting now acts as the main SAT/PSAT training lane, while easier modes
                are there only when you want to rebuild fundamentals.
              </p>
            </div>
            <div className="coach-note">
              <strong>{questionBankStats?.total || "Many"} locally seeded question variants.</strong>
              <p className="muted-text">
                The app now prebuilds a large local bank across Math, Reading, and Writing so each
                category has many more question variations to pull from.
              </p>
            </div>
            <div className="coach-note">
              <strong>Pair generated reps with official released sets.</strong>
              <p className="muted-text">
                Generated questions are best for volume and adaptation. Official College Board sets
                are best for final realism.
              </p>
            </div>
          </div>
        </article>

        <article className="panel official-panel">
          <p className="eyebrow">Official released material</p>
          <h2>College Board resources for real SAT and PSAT questions</h2>
          <p className="muted-text">{officialResources?.note}</p>

          <div className="resource-grid">
            {filteredOfficialResources.map((resource) => (
              <a
                key={resource.id}
                className="resource-card"
                href={resource.url}
                target="_blank"
                rel="noreferrer"
              >
                <span className="resource-source">{resource.source}</span>
                <strong>{resource.title}</strong>
                <p>{resource.description}</p>
              </a>
            ))}
          </div>
        </article>
      </section>

      <QuestionCard
        question={question}
        answer={answer}
        onAnswerChange={setAnswer}
        onSubmit={submitAnswer}
        onGenerateMore={generateQuestion}
        submitting={submitting}
        result={result}
      />

      {feedback ? (
        <section className="two-column-grid">
          <article className="panel">
            <p className="eyebrow">Weak areas</p>
            <h2>Watch these topics</h2>
            <div className="stack-sm">
              {feedback.weakAreas.map((area) => (
                <div key={area.type} className="callout-row">
                  <span>{area.label}</span>
                  <strong>{area.accuracy}%</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <p className="eyebrow">What to practice next</p>
            <h2>Targeted follow-up</h2>
            <div className="stack-sm">
              {feedback.recommendations.map((item) => (
                <div key={item.type} className="recommendation-card">
                  <strong>{item.label}</strong>
                  <p className="muted-text">{item.reason}</p>
                  <p>{item.previewQuestion.prompt}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}
    </div>
  );
}
