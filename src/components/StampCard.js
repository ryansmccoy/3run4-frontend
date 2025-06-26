import React, { useRef, useEffect } from "react";
import Confetti from "react-dom-confetti";

const PRIMARY_RED = "#E02327";
const PRIMARY_BLUE = "#143E8E";

// Confetti config
const confettiConfig = {
  angle: 90,
  spread: 45,
  startVelocity: 25,
  elementCount: 40,
  dragFriction: 0.1,
  duration: 800,
  stagger: 2,
  width: "8px",
  height: "8px",
  perspective: "600px",
  colors: [PRIMARY_RED, PRIMARY_BLUE, "#fff"]
};

export default function StampCard({ stampCount, lastAnimatedIdx }) {
  const cardCols = 5;
  const totalStamps = Math.max(stampCount, 20); // at least 4 rows
  const cardRows = Math.ceil(totalStamps / cardCols);

  // Refs for confetti per stamp
  const confettiRefs = useRef([]);
  useEffect(() => {
    // Clean up refs if stampCount changes
    confettiRefs.current = confettiRefs.current.slice(0, cardRows * cardCols);
  }, [cardRows, cardCols]);

  function getPrizeEmoji(idx) {
    if (idx === 4) return "🧢";
    if (idx === 9) return "🍺";
    if (idx === 14) return "🚗";
    return "";
  }

  const stampCircles = [];
  for (let row = 0; row < cardRows; ++row) {
    const rowArr = [];
    for (let col = 0; col < cardCols; ++col) {
      const idx = row * cardCols + col;
      const isStamped = idx < stampCount;
      rowArr.push(
        <div key={col} style={{ position: "relative" }}>
          <div
            className={isStamped && idx === lastAnimatedIdx ? "stamp-pop" : ""}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              margin: 4,
              background: isStamped ? PRIMARY_RED : "#ececec",
              border: `2px solid ${PRIMARY_BLUE}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 21,
              fontWeight: "bold",
              color: "#fff",
              position: "relative",
              transition: "background 0.2s"
            }}
          >
            {isStamped ? "✔️" : ""}
            <span style={{ position: "absolute", right: -25 }}>
              {getPrizeEmoji(idx)}
            </span>
          </div>
          {/* Confetti */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              pointerEvents: "none",
              transform: "translate(-50%, -50%)"
            }}
          >
            <Confetti
              active={lastAnimatedIdx === idx}
              config={confettiConfig}
            />
          </div>
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
