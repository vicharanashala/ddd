export function Header() {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Dashboard</h1>
      <p style={{ opacity: 0.6 }}>
        Interactive insights from the CSV — colorful visual summary
      </p>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button className="card" style={{ background: "#6366f1" }}>
          Section-wise
        </button>
        <button className="card">Quiz-wise</button>

        <div style={{ marginLeft: "auto" }}>
          <button className="card">CSV data</button>
        </div>
      </div>
    </div>
  );
}