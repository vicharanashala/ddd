import clsx from "clsx";

type Props = {
  rank: number;
  name: string;
  email: string;
  attempts: number;
  completed: number;
};

export function ChampionCard({
  rank,
  name,
  email,
  attempts,
  completed,
}: Props) {
  return (
    <div
      className={clsx(
        "card",
        rank === 1 && "glow-green",
        rank === 2 && "glow-gray",
        rank === 3 && "glow-bronze"
      )}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
      }}
    >
      {/* LEFT */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "#fbbf24",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            color: "#000",
          }}
        >
          {rank}
        </div>

        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: 12, opacity: 0.6 }}>{email}</div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", gap: 30, textAlign: "right" }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.6 }}>CHAMPION</div>
          🏆
        </div>

        <div>
          <div style={{ fontSize: 11, opacity: 0.6 }}>TOTAL ATTEMPTS</div>
          <div style={{ color: "#f87171", fontWeight: 700 }}>
            {attempts}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, opacity: 0.6 }}>COMPLETED</div>
          <div style={{ color: "#a78bfa", fontWeight: 700 }}>
            {completed}/17
          </div>
        </div>
      </div>
    </div>
  );
}