import React, { useMemo, useState } from "react";

interface StreakCalendarProps {
  streakData: { date: string; count: number }[];
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({ streakData }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const todayISO = new Date().toISOString().split("T")[0];

  const streakMap = useMemo(() => {
    const map: Record<string, number> = {};
    streakData.forEach((s) => (map[s.date] = s.count));
    return map;
  }, [streakData]);

  // 4 months
  const months: Date[] = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - i);
    months.push(new Date(d));
  }

  const getColor = (count: number) => {
    if (count === 0) return "rgba(129, 210, 214, 0.08)";
    if (count < 2) return "#81d2d6";
    if (count < 4) return "#4ecdc4";
    if (count < 6) return "#44a08d";
    return "#d06262";
  };

  const renderMonth = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];

    // ✅ ONLY actual days (no empty placeholders)
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const iso = d.toISOString().split("T")[0];
      const count = streakMap[iso] || 0;

      const isToday = iso === todayISO;
      const isActive = count > 0;
      const isHigh = count >= 5;

      cells.push(
        <div
          key={iso}
          title={`${count} on ${iso}`}
          style={{
            width: "100%",
            aspectRatio: "1",
            background: getColor(count),
            borderRadius: "3px",

            border: isToday ? "2px solid #fff" : "1px solid transparent",

            boxShadow: isActive
              ? isHigh
                ? "0 0 6px rgba(208,98,98,0.6)"
                : "0 0 4px rgba(129,210,214,0.4)"
              : "none",

            transition: "0.2s",
          }}
        />
      );
    }

    return (
      <div style={{ width: "100%" }}>
        {/* Month title */}
        <div
          style={{
            fontSize: "12px",
            color: "#aaa",
            marginBottom: "6px",
            textAlign: "center",
          }}
        >
          {monthDate.toLocaleString("default", {
            month: "short",
            year: "numeric",
          })}
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "4px",
          }}
        >
          {cells}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        gridColumn: "1 / -1",
        background: "rgba(28, 28, 46, 0.85)",
        border: "1px solid rgba(129, 210, 214, 0.15)",
        borderRadius: "10px",
        padding: "0.8rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
          color: "#aaa",
          fontSize: "13px",
        }}
      >
        <button
          onClick={() => {
            const d = new Date(currentDate);
            d.setMonth(d.getMonth() - 1);
            setCurrentDate(d);
          }}
          style={{ background: "none", border: "none", color: "#aaa" }}
        >
          ◀
        </button>

        <span>Streak Calendar</span>

        <button
          onClick={() => {
            const d = new Date(currentDate);
            d.setMonth(d.getMonth() + 1);
            setCurrentDate(d);
          }}
          style={{ background: "none", border: "none", color: "#aaa" }}
        >
          ▶
        </button>
      </div>

      {/* 4 months */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
        }}
      >
        {months.map((m, i) => (
          <div key={i}>{renderMonth(m)}</div>
        ))}
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: "10px",
          fontSize: "11px",
          display: "flex",
          gap: "5px",
          alignItems: "center",
          color: "#aaa",
        }}
      >
        Less
        {[0, 1, 3, 5, 7].map((lvl) => (
          <div
            key={lvl}
            style={{
              width: "12px",
              height: "12px",
              background: getColor(lvl),
              borderRadius: "2px",
            }}
          />
        ))}
        More
      </div>
    </div>
  );
};

export default StreakCalendar;