export function ProgressBar({ value, label }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className="progress-wrap">
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      {label ? <p className="progress-label">{label}</p> : null}
    </div>
  );
}
