import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import ProgressBar from "../components/ProgressBar";
import StatCard from "../components/StatCard";

function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function MockTestsPage() {
  const { token } = useAuth();
  const [examType, setExamType] = useState("SAT");
  const [test, setTest] = useState(null);
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!test || result) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [test, result]);

  const startMockTest = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/tests/mock", { examType }, token);
      setTest(response.test);
      setResult(null);
      setAnswers({});
      setCurrentIndex(0);
      setElapsedSeconds(0);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setLoading(false);
    }
  };

  const submitTest = async () => {
    if (!test || currentIndex !== test.questions.length - 1) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await api.post(
        `/tests/mock/${test.id}/submit`,
        {
          answers,
          timeSpentSeconds: elapsedSeconds
        },
        token
      );
      setResult(response.result);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = test?.questions[currentIndex];
  const isLastQuestion = Boolean(test) && currentIndex === test.questions.length - 1;

  return (
    <div className="stack-lg">
      {!test ? (
        <section className="panel">
          <p className="eyebrow">Mock SAT and PSAT tests</p>
          <h1>Generate a full-length training exam.</h1>
          <p className="muted-text">
            The generated test uses the current 98-question structure and returns a training score
            plus section and type breakdowns.
          </p>

          <div className="filters-row">
            <label>
              <span>Exam type</span>
              <select value={examType} onChange={(event) => setExamType(event.target.value)}>
                <option value="SAT">SAT</option>
                <option value="PSAT">PSAT</option>
              </select>
            </label>
          </div>

          <button className="primary-button inline-button" onClick={startMockTest} disabled={loading}>
            {loading ? "Building test..." : `Generate full-length ${examType}`}
          </button>
          {error ? <p className="form-error">{error}</p> : null}
        </section>
      ) : null}

      {test && !result ? (
        <>
          <section className="panel test-toolbar">
            <div>
              <p className="eyebrow">{test.examType} mock test</p>
              <h2>
                Question {currentIndex + 1} of {test.totalQuestions}
              </h2>
            </div>
            <div className="test-status">
              <span>{formatClock(elapsedSeconds)}</span>
              <span>{Object.keys(answers).length} answered</span>
            </div>
          </section>

          {currentQuestion ? (
            <article className="panel question-card">
              <div className="question-meta">
                <span>{currentQuestion.section}</span>
                <span>{currentQuestion.typeLabel}</span>
                <span>{currentQuestion.domain}</span>
                <span>{currentQuestion.year}</span>
              </div>

              {currentQuestion.passage ? <pre className="passage-block">{currentQuestion.passage}</pre> : null}
              <h3>{currentQuestion.prompt}</h3>

              {currentQuestion.answerFormat === "multiple-choice" ? (
                <div className="choice-list">
                  {currentQuestion.choices.map((choice) => (
                    <label
                      key={choice.id}
                      className={`choice-pill ${answers[currentQuestion.id] === choice.id ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        checked={answers[currentQuestion.id] === choice.id}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            [currentQuestion.id]: choice.id
                          }))
                        }
                      />
                      <span className="choice-id">{choice.id}</span>
                      <span>{choice.text}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <label className="numeric-answer">
                  <span>Your answer</span>
                  <input
                    value={answers[currentQuestion.id] || ""}
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        [currentQuestion.id]: event.target.value
                      }))
                    }
                  />
                </label>
              )}

              <div className="button-row">
                <button
                  className="ghost-button"
                  onClick={() => setCurrentIndex((current) => Math.max(current - 1, 0))}
                  disabled={currentIndex === 0}
                >
                  Previous
                </button>
                <button
                  className="ghost-button"
                  onClick={() =>
                    setCurrentIndex((current) => Math.min(current + 1, test.questions.length - 1))
                  }
                  disabled={currentIndex === test.questions.length - 1}
                >
                  Next
                </button>
                {isLastQuestion ? (
                  <button className="primary-button" onClick={submitTest} disabled={loading}>
                    {loading ? "Scoring..." : "Submit mock test"}
                  </button>
                ) : null}
              </div>
              {!isLastQuestion ? (
                <p className="test-submit-note">
                  Review questions freely, but final submission unlocks only on the last question.
                </p>
              ) : null}
              {error ? <p className="form-error">{error}</p> : null}

              <div className="question-index-grid">
                {test.questions.map((item, index) => (
                  <button
                    key={item.id}
                    className={`index-pill ${answers[item.id] ? "answered" : ""} ${
                      index === currentIndex ? "active" : ""
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </article>
          ) : null}
        </>
      ) : null}

      {result ? (
        <div className="stack-lg">
          <section className="card-grid stats-grid">
            <StatCard eyebrow="Total score" value={result.totalScore} detail={`${result.examType} training estimate`} tone="warm" />
            <StatCard eyebrow="Reading & Writing" value={result.verbalScore} detail="Scaled verbal estimate" />
            <StatCard eyebrow="Math" value={result.mathScore} detail="Scaled math estimate" tone="green" />
            <StatCard eyebrow="Time used" value={formatClock(elapsedSeconds)} detail="Total elapsed time" />
          </section>

          <section className="two-column-grid">
            <article className="panel">
              <p className="eyebrow">Section breakdown</p>
              <h2>Accuracy by section</h2>
              <div className="stack-sm">
                {Object.entries(result.sectionBreakdown).map(([section, stats]) => (
                  <ProgressBar
                    key={section}
                    label={section}
                    value={stats.accuracy}
                    detail={`${stats.correct}/${stats.total} correct`}
                    tone={stats.accuracy >= 70 ? "green" : stats.accuracy >= 50 ? "amber" : "blue"}
                  />
                ))}
              </div>
            </article>

            <article className="panel">
              <p className="eyebrow">Question type breakdown</p>
              <h2>Where the misses clustered</h2>
              <div className="stack-sm">
                {result.questionTypeBreakdown.slice(0, 8).map((entry) => (
                  <ProgressBar
                    key={entry.type}
                    label={entry.label}
                    value={entry.accuracy}
                    detail={`${entry.correct}/${entry.total} correct`}
                    tone={entry.accuracy >= 70 ? "green" : entry.accuracy >= 50 ? "amber" : "blue"}
                  />
                ))}
              </div>
            </article>
          </section>

          <section className="panel">
            <p className="eyebrow">Review</p>
            <h2>Incorrect questions and explanations</h2>
            <div className="stack-sm">
              {result.questionReviews
                .filter((review) => !review.correct)
                .slice(0, 12)
                .map((review) => (
                  <article key={review.id} className="review-card incorrect">
                    <div className="question-meta">
                      <span>{review.section}</span>
                      <span>{review.typeLabel}</span>
                    </div>
                    {review.passage ? <pre className="passage-block">{review.passage}</pre> : null}
                    <h3>{review.prompt}</h3>
                    <p>
                      <strong>Your answer:</strong> {review.userAnswer || "Blank"}
                    </p>
                    <p>
                      <strong>Correct answer:</strong> {review.correctAnswer}
                    </p>
                    <ol className="explanation-list">
                      {review.explanationSteps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </article>
                ))}
            </div>
          </section>

          <button
            className="primary-button inline-button"
            onClick={() => {
              setTest(null);
              setResult(null);
              setAnswers({});
              setElapsedSeconds(0);
            }}
          >
            Build another full-length test
          </button>
        </div>
      ) : null}
    </div>
  );
}
