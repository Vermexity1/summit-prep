import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const features = [
  {
    title: "Unlimited Question Generation",
    description: "Spin up fresh Math, Reading, and Writing questions with explanations on demand."
  },
  {
    title: "Full-Length Mock Exams",
    description: "Generate SAT and PSAT tests with 98 questions and a full score breakdown."
  },
  {
    title: "Adaptive Weakness Tracking",
    description: "The dashboard highlights weaker skills and points you toward the right follow-up practice."
  },
  {
    title: "Learn Mode Guides",
    description: "Every question family comes with a compact strategy guide and worked example."
  }
];

export default function LandingPage() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="stack-lg">
      <section>
        <div className="hero-copy panel hero-panel">
          <p className="eyebrow">Local-first SAT training stack</p>
          <h1>Train like a serious test taker, not like you are clicking through flashcards.</h1>
          <p className="hero-text">
            Summit Prep gives you original SAT and PSAT-style questions, mock tests, skill guides,
            explanations, and a progress dashboard in one local full-stack app.
          </p>

          <div className="button-row">
            <Link to="/register" className="primary-button">
              Start training
            </Link>
            <Link to="/learn" className="ghost-button">
              Explore learn mode
            </Link>
          </div>

          <div className="demo-credentials">
            <strong>Demo login:</strong> demo@summitprep.dev / demo1234
          </div>
        </div>
      </section>

      <section className="card-grid">
        {features.map((feature) => (
          <article key={feature.title} className="panel feature-card">
            <p className="eyebrow">Feature</p>
            <h3>{feature.title}</h3>
            <p className="muted-text">{feature.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
