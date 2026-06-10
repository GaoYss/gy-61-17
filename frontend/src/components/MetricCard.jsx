import { ChevronRight } from "lucide-react";

export function MetricCard({ label, value, tone = "blue", onClick, hint }) {
  const className = `metric-card tone-${tone}${onClick ? " clickable" : ""}`;
  const props = onClick ? { className, onClick, role: "button", tabIndex: 0 } : { className };
  return (
    <div {...props}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span>{label}</span>
        {onClick && hint && <span className="metric-hint">{hint}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <strong>{value ?? "-"}</strong>
        {onClick && <ChevronRight size={18} className="metric-arrow" />}
      </div>
    </div>
  );
}
