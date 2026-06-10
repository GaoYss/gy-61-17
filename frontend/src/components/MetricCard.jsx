export function MetricCard({ label, value, tone = "blue", onClick }) {
  const className = `metric-card tone-${tone}${onClick ? " clickable" : ""}`;
  const props = onClick ? { className, onClick, role: "button", tabIndex: 0 } : { className };
  return (
    <div {...props}>
      <span>{label}</span>
      <strong>{value ?? "-"}</strong>
    </div>
  );
}
