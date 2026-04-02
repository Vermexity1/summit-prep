export default function StatCard({ eyebrow, value, detail, tone = "default" }) {
  return (
    <article className={`stat-card stat-card-${tone}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h3>{value}</h3>
      <p className="muted-text">{detail}</p>
    </article>
  );
}

