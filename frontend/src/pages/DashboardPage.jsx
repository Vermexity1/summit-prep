import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import ProgressBar from "../components/ProgressBar";
import StatCard from "../components/StatCard";
import TrendChart from "../components/TrendChart";

export default function DashboardPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSummary() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/dashboard/summary", token);
        setSummary(response.summary);
      } catch (nextError) {
        setError(nextError.message);
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, [token]);

  if (loading) {
    return <div className="panel">Loading your dashboard...</div>;
  }

  if (error) {
    return <div className="panel form-error">{error}</div>;
  }

  const strongest = summary.strengths[0]?.label || "No data yet";

  return (
    <div className="stack-lg">
      <section className="hero-grid">
        <div className="panel hero-panel">
          <p className="eyebrow">Progress dashboard</p>
          <h1>Your training loop, mapped in one place.</h1>
          <p className="muted-text">
            Use the section bars for consistency, the trend chart for score movement, and the weak
            areas list for your next reps.
          </p>

          {summary.studyPlan ? (
            <div className="study-plan">
              <h3>{summary.studyPlan.headline}</h3>
              <ul className="feature-list compact">
                {summary.studyPlan.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="card-grid stats-grid">
          <StatCard
            eyebrow="Score estimate"
            value={summary.scoreEstimate}
            detail="Based on your latest full test or current section accuracy."
            tone="warm"
          />
          <StatCard
            eyebrow="Practice accuracy"
            value={`${summary.practiceAccuracy}%`}
            detail={`${summary.totalPracticeQuestions} practice questions completed`}
          />
          <StatCard
            eyebrow="Study time"
            value={`${summary.totalTimeMinutes} min`}
            detail="Combined practice and mock test time"
          />
          <StatCard
            eyebrow="Strongest area"
            value={strongest}
            detail={`${summary.totalTestsCompleted} full tests finished`}
            tone="green"
          />
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Score trend</p>
            <h2>Recent mock test performance</h2>
          </div>
          <Link to="/mock-tests" className="ghost-button inline-button">
            Take another mock test
          </Link>
        </div>
        <TrendChart points={summary.recentScores} />
      </section>

      <section className="two-column-grid">
        <article className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Section accuracy</p>
              <h2>How each section is moving</h2>
            </div>
          </div>
          <div className="stack-sm">
            {summary.sectionPerformance.map((item) => (
              <ProgressBar
                key={item.section}
                label={item.section}
                value={item.accuracy}
                detail={`${item.accuracy}% (${item.attempts} attempts)`}
                tone={item.accuracy >= 70 ? "green" : item.accuracy >= 50 ? "amber" : "blue"}
              />
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Weekly activity</p>
              <h2>Time spent recently</h2>
            </div>
          </div>
          <div className="stack-sm">
            {summary.weeklyActivity.length ? (
              summary.weeklyActivity.map((day) => (
                <ProgressBar
                  key={day.date}
                  label={day.date}
                  value={Math.min(day.minutes * 5, 100)}
                  detail={`${day.minutes} min`}
                  tone="blue"
                />
              ))
            ) : (
              <div className="empty-state subtle">Your activity streak will appear here after you start practicing.</div>
            )}
          </div>
        </article>
      </section>

      <section className="two-column-grid">
        <article className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Weak areas</p>
              <h2>Topics to revisit next</h2>
            </div>
            <Link to="/practice" className="ghost-button inline-button">
              Open practice
            </Link>
          </div>

          <div className="stack-sm">
            {summary.weakAreas.length ? (
              summary.weakAreas.map((area) => (
                <div key={area.type} className="callout-row">
                  <div>
                    <strong>{area.label}</strong>
                    <p className="muted-text">
                      {area.section} · {area.domain}
                    </p>
                  </div>
                  <Link className="inline-link" to={`/practice?section=${area.section}&type=${area.type}`}>
                    {area.accuracy}% accuracy
                  </Link>
                </div>
              ))
            ) : (
              <div className="empty-state subtle">
                Once you answer a few questions, your weaker topics will show up here.
              </div>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Recommended next sets</p>
              <h2>Practice ideas generated from your misses</h2>
            </div>
          </div>

          <div className="stack-sm">
            {summary.recommendations.length ? (
              summary.recommendations.map((item) => (
                <div key={item.type} className="recommendation-card">
                  <div className="question-meta">
                    <span>{item.section}</span>
                    <span>{item.label}</span>
                  </div>
                  <p>{item.reason}</p>
                  <p className="muted-text">{item.previewQuestion.prompt}</p>
                  <Link className="ghost-button inline-button" to={`/practice?section=${item.section}&type=${item.type}`}>
                    Train this area
                  </Link>
                </div>
              ))
            ) : (
              <div className="empty-state subtle">
                Finish a few practice questions to unlock targeted recommendations.
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Topic mastery</p>
            <h2>Accuracy by problem type</h2>
          </div>
        </div>
        <div className="stack-sm">
          {summary.topicMastery.length ? (
            summary.topicMastery.map((topic) => (
              <ProgressBar
                key={topic.type}
                label={topic.label}
                value={topic.accuracy}
                detail={`${topic.accuracy}% across ${topic.attempts} tries`}
                tone={topic.accuracy >= 75 ? "green" : topic.accuracy >= 50 ? "amber" : "blue"}
              />
            ))
          ) : (
            <div className="empty-state subtle">
              Topic mastery appears after your first practice session.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

