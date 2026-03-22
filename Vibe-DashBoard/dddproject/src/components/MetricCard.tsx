type Metric = {
  label: string;
  value: string;
};

const metrics: Metric[] = [
  { label: "Total Quizzes", value: "17" },
  { label: "Total Participants", value: "301" },
  { label: "Total Submissions", value: "2743 / 5117" },
  { label: "Completion Rate", value: "53.6%" },
  { label: "Overall Avg Score", value: "99.1%" },
  { label: "Overall Pass Rate", value: "98.9%" },
  { label: "Avg Attempts", value: "2.0" },
];

export function MetricsRow() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: "16px"
    }}>
      {metrics.map((m) => (
        <div key={m.label} className="metric-card">
          <div style={{ fontSize: 26, fontWeight: 700 }}>{m.value}</div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>{m.label}</div>
        </div>
      ))}
    </div>
  );
}