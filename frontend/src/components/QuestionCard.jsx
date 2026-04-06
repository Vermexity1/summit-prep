export default function QuestionCard({
  question,
  answer,
  onAnswerChange,
  onSubmit,
  onGenerateMore,
  submitting,
  result
}) {
  if (!question) {
    return (
      <div className="panel empty-state">
        Choose a section and generate a question to begin.
      </div>
    );
  }

  return (
    <article className="question-card panel">
      <div className="question-meta">
        <span>{question.examType}</span>
        <span>{question.section}</span>
        <span>{question.typeLabel}</span>
        <span>{question.difficulty}</span>
        <span>{question.year}</span>
      </div>
      {question.sourceLabel ? <p className="source-label">{question.sourceLabel}</p> : null}

      {question.passage ? <pre className="passage-block">{question.passage}</pre> : null}

      <h3>{question.prompt}</h3>

      {question.answerFormat === "multiple-choice" ? (
        <div className="choice-list">
          {question.choices.map((choice) => (
            <label key={choice.id} className={`choice-pill ${answer === choice.id ? "selected" : ""}`}>
              <input
                type="radio"
                name={question.id}
                value={choice.id}
                checked={answer === choice.id}
                onChange={(event) => onAnswerChange(event.target.value)}
              />
              <span className="choice-id">{choice.id}</span>
              <span>{choice.text}</span>
            </label>
          ))}
        </div>
      ) : (
        <label className="numeric-answer">
          <span>Your answer</span>
          <input value={answer} onChange={(event) => onAnswerChange(event.target.value)} placeholder="Type a number" />
        </label>
      )}

      <button className="primary-button" onClick={onSubmit} disabled={!answer || submitting}>
        {submitting ? "Checking..." : "Check answer"}
      </button>

      {result ? (
        <section className={`review-card ${result.correct ? "correct" : "incorrect"}`} aria-live="polite">
          <h4>{result.correct ? "Correct" : "Not quite yet"}</h4>
          <p>
            <strong>Correct answer:</strong> {result.correctAnswer}
          </p>
          <p>
            <strong>Best approach:</strong> {result.bestApproach}
          </p>
          <ol className="explanation-list">
            {result.explanationSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="button-row">
            <button className="primary-button inline-button" onClick={onGenerateMore}>
              Generate more
            </button>
          </div>
        </section>
      ) : null}
    </article>
  );
}
