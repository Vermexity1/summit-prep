export default function ProgressBar({ label, value, detail, tone = "blue" }) {
  return (
    <div className="progress-row">
      <div className="progress-row-header">
        <span>{label}</span>
        <span>{detail}</span>
      </div>
      <div className="progress-track">
        <div className={`progress-fill progress-fill-${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

