export default function TrendChart({ points = [], valueKey = "score" }) {
  if (!points.length) {
    return <div className="empty-state subtle">Take a mock test to see your score trend.</div>;
  }

  const width = 320;
  const height = 120;
  const values = points.map((point) => point[valueKey]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;

  const polylinePoints = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - ((point[valueKey] - min) / spread) * (height - 20) - 10;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="trend-chart">
      <svg viewBox={`0 0 ${width} ${height}`} aria-label="Score trend chart">
        <polyline fill="none" stroke="currentColor" strokeWidth="3" points={polylinePoints} />
        {points.map((point, index) => {
          const x = (index / Math.max(points.length - 1, 1)) * width;
          const y = height - ((point[valueKey] - min) / spread) * (height - 20) - 10;
          return <circle key={`${point.date}-${index}`} cx={x} cy={y} r="4" fill="currentColor" />;
        })}
      </svg>
      <div className="trend-labels">
        {points.map((point) => (
          <span key={`${point.date}-${point[valueKey]}`}>{point.date.slice(5)}</span>
        ))}
      </div>
    </div>
  );
}

