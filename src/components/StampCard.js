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
  const cardCols = 5; // Changed back to 5 columns
  const totalStamps = Math.max(stampCount, 20); // at least 4 rows (5x4 = 20 stamps)
  const cardRows = Math.ceil(totalStamps / cardCols);

  // Refs for confetti per stamp
  const confettiRefs = useRef([]);
  useEffect(() => {
    // Clean up refs if stampCount changes
    confettiRefs.current = confettiRefs.current.slice(0, cardRows * cardCols);
  }, [cardRows, cardCols]);

  const stampCircles = [];
  for (let row = 0; row < cardRows; ++row) {
    const rowArr = [];
    for (let col = 0; col < cardCols; ++col) {
      const idx = row * cardCols + col;
      const isStamped = idx < stampCount;
      
      // Generate consistent random position and rotation for each stamp based on its index
      // This ensures stamps don't move when new ones are added
      const seed = idx * 123.456; // Use index as seed for consistent randomness
      const randomX = (Math.sin(seed) * 6) - 3; // -3 to 3 pixels (reduced from ±5 to keep well inside circles)
      const randomY = (Math.cos(seed * 1.1) * 6) - 3; // -3 to 3 pixels (reduced from ±5 to keep well inside circles)
      const randomRotation = (Math.sin(seed * 0.7) * 30) - 15; // -15 to 15 degrees (reduced from ±20 for more subtle rotation)
      
      // Determine if this stamp should have a shadow (about 60% of stamps)
      const shouldHaveShadow = Math.sin(seed * 2.3) > -0.2; // ~60% will have shadow
      
      rowArr.push(
        <div key={col} style={{ position: "relative" }}>
          <div
            className={isStamped && idx === lastAnimatedIdx ? "stamp-pop" : ""}
            style={{
              width: 48, // Adjusted back for 5-column layout
              height: 48, // Adjusted back for 5-column layout
              borderRadius: 24, // Adjusted for new size
              margin: 6, // Reduced margin for 5 columns
              background: "#fff",
              border: `2px solid ${PRIMARY_BLUE}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: "bold",
              color: PRIMARY_BLUE,
              position: "relative",
              transition: "background 0.2s"
            }}
          >
            {/* Circle number */}
            <span style={{ 
              position: "absolute", 
              fontSize: 16, // Increased from 14 to 16
              fontWeight: "700", // Made bolder (was 600)
              fontFamily: "Georgia, 'Times New Roman', serif", // Classic serif font like the physical card
              color: "#4A6FA5", // Lighter blue color
              zIndex: 1
            }}>
              {idx + 1}
            </span>
            
            {/* Fleur stamp with random position and rotation */}
            {isStamped && (
              <img
                src={require("../assets/fleur.png")}
                alt="stamp"
                style={{
                  width: 58, // Adjusted for 5-column layout
                  height: 58, // Adjusted for 5-column layout
                  position: "absolute",
                  transform: `translate(${randomX}px, ${randomY}px) rotate(${randomRotation}deg)`,
                  imageRendering: "crisp-edges",
                  filter: shouldHaveShadow 
                    ? `brightness(0) saturate(100%) invert(16%) sepia(98%) saturate(6500%) hue-rotate(356deg) brightness(85%) contrast(125%) drop-shadow(1px 1px 2px rgba(139, 69, 19, 0.25))`
                    : `brightness(0) saturate(100%) invert(16%) sepia(98%) saturate(6500%) hue-rotate(356deg) brightness(85%) contrast(125%)`, // Darker red color
                  zIndex: 2
                }}
              />
            )}
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

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      maxWidth: "400px", // Increased width for 5-column layout
      margin: "0 auto"
    }}>
      {stampCircles}
    </div>
  );
}
