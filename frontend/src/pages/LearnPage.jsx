import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";

export default function LearnPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [guides, setGuides] = useState([]);
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const section = searchParams.get("section") || "";
  const type = searchParams.get("type") || "";

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [guidesResponse, metaResponse] = await Promise.all([
          api.get(`/learn/guides${section || type ? `?section=${section}&type=${type}` : ""}`),
          api.get("/meta/catalog")
        ]);

        setGuides(guidesResponse.guides);
        setCatalog(metaResponse.sections);
      } catch (nextError) {
        setError(nextError.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [section, type]);

  const updateFilter = (name, value) => {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(name, value);
    } else {
      next.delete(name);
    }

    if (name === "section" && !value) {
      next.delete("type");
    }

    setSearchParams(next);
  };

  const sectionTypes = section && catalog ? catalog[section] || [] : [];

  return (
    <div className="stack-lg">
      <section className="panel page-header">
        <p className="eyebrow">Learn mode</p>
        <h1>Study the method before you drill the timing.</h1>
        <p className="muted-text">
          Every guide includes the core strategy, common traps, and an example walkthrough.
        </p>

        <div className="filters-row">
          <label>
            <span>Section</span>
            <select value={section} onChange={(event) => updateFilter("section", event.target.value)}>
              <option value="">All sections</option>
              <option value="math">Math</option>
              <option value="reading">Reading</option>
              <option value="writing">Writing</option>
            </select>
          </label>

          <label>
            <span>Question type</span>
            <select value={type} onChange={(event) => updateFilter("type", event.target.value)} disabled={!section}>
              <option value="">All types</option>
              {sectionTypes.map((entry) => (
                <option key={entry.type} value={entry.type}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {loading ? <div className="panel">Loading guides...</div> : null}
      {error ? <div className="panel form-error">{error}</div> : null}

      <div className="stack-md">
        {guides.map((guide) => (
          <article key={guide.type} className="panel guide-card">
            <div className="question-meta">
              <span>{guide.section}</span>
              <span>{guide.domain}</span>
              <span>{guide.label}</span>
            </div>

            <h3>{guide.title}</h3>
            <p>{guide.summary}</p>

            <div className="guide-columns">
              <div>
                <h4>How to solve it</h4>
                <ol className="explanation-list">
                  {guide.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className="muted-text">
                  <strong>Common trap:</strong> {guide.pitfall}
                </p>
              </div>

              <div>
                <h4>Worked example</h4>
                {guide.example.passage ? <pre className="passage-block">{guide.example.passage}</pre> : null}
                <p>{guide.example.prompt}</p>
                {guide.example.choices?.length ? (
                  <ul className="mini-choice-list">
                    {guide.example.choices.map((choice) => (
                      <li key={choice.id}>
                        <strong>{choice.id}.</strong> {choice.text}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <ol className="explanation-list">
                  {guide.example.explanationSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            <Link
              className="ghost-button inline-button"
              to={`/practice?section=${guide.section}&type=${guide.type}`}
            >
              Practice this skill
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
