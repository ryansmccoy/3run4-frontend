import React from "react";
const PRIMARY_BLUE = "#143E8E";

export default function AttendanceBar({ dates }) {
  if (!Array.isArray(dates) || dates.length === 0) return <div style={{minWidth:60}} />;
  const maxBars = 40;
  const sorted = [...dates].sort();
  const bars = sorted.slice(-maxBars);
  return (
    <div style={{ display: "flex", gap: 1, alignItems: "flex-end", minWidth: 60 }}>
      {[...Array(maxBars)].map((_, i) => {
        const hasAttendance = i >= maxBars - bars.length;
        return (
          <div
            key={i}
            title={hasAttendance ? bars[i - (maxBars - bars.length)] : ""}
            style={{
              width: 4,
              height: hasAttendance ? 20 : 8,
              background: hasAttendance ? PRIMARY_BLUE : "#E0E2E8",
              borderRadius: 2,
              marginRight: i === maxBars-1 ? 0 : 1,
              transition: "background 0.2s"
            }}
          />
        );
      })}
    </div>
  );
}
