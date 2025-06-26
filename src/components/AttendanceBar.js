import React from "react";

export default function AttendanceBar({ attendanceHistory = [] }) {
  const weeks = attendanceHistory.slice(-8);
  if (weeks.length === 0) {
    return <span style={{ color: "#aaa" }}>–</span>;
  }
  return (
    <div style={{ display: "flex", gap: 2, height: 16, alignItems: "flex-end" }}>
      {weeks.map((att, i) =>
        <div key={i}
          style={{
            width: 8,
            height: att ? 16 : 6,
            background: att ? "#2aaf3b" : "#eee",
            borderRadius: 2
          }}
          title={att ? "Present" : "Absent"}
        />
      )}
    </div>
  );
}
