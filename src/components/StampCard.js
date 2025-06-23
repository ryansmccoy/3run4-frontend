import React from "react";
const PRIMARY_RED = "#E02327";
const PRIMARY_BLUE = "#143E8E";
const COLS = 5;

export default function StampCard({ stampCount, prizes = [] }) {
  // Build an object for fast lookup: idx => emoji
  const prizeMap = {};
  prizes.forEach(prize => {
    if (typeof prize.count === "number" && prize.emoji) {
      prizeMap[prize.count - 1] = prize.emoji; // prize at 5 stamps = idx 4
    }
  });

  const rows = Math.ceil(Math.max(stampCount, ...prizes.map(p=>p.count||0)) / COLS) || 1;
  const maxIdx = Math.max(stampCount, ...prizes.map(p => p.count || 0));
  const total = Math.max(maxIdx, rows * COLS);

  const stampCircles = [];
  for (let row = 0; row < Math.ceil(total / COLS); ++row) {
    const rowArr = [];
    for (let col = 0; col < COLS; ++col) {
      const idx = row * COLS + col;
      rowArr.push(
        <div key={col} style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          margin: 4,
          background: idx < stampCount ? PRIMARY_RED : "#ececec",
          border: `2px solid ${PRIMARY_BLUE}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 21,
          fontWeight: "bold",
          color: "#fff",
          position: "relative"
        }}>
          {idx < stampCount ? "✔️" : ""}
          <span style={{ position: "absolute", right: -25 }}>{prizeMap[idx] || ""}</span>
        </div>
      );
    }
    stampCircles.push(
      <div key={row} style={{ display: "flex", justifyContent: "center" }}>
        {rowArr}
      </div>
    );
  }
  return <div>{stampCircles}</div>;
}
