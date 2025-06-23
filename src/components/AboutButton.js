import React, { useState } from "react";

export default function AboutButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          right: 16,
          bottom: 12,
          zIndex: 1000,
          background: "#f4f6fa",
          border: "none",
          borderRadius: "50%",
          width: 32,
          height: 32,
          fontSize: 18,
          color: "#143E8E",
          boxShadow: "0 2px 8px rgba(20,62,142,0.09)",
          cursor: "pointer",
        }}
        aria-label="About this app"
      >
        i
      </button>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            left: 0, top: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.16)",
            zIndex: 2000,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 340,
              padding: "2rem",
              boxShadow: "0 8px 32px rgba(20,62,142,0.18)",
              textAlign: "center"
            }}
          >
            <h3 style={{ color: "#143E8E", marginTop: 0 }}>About</h3>
            <p style={{ fontSize: 16, color: "#555", marginBottom: 18 }}>
              This 3run4 stamp card app was designed and built by <a href="https://github.com/ryansmccoy" target="_blank" rel="noopener noreferrer" style={{ color: "#143E8E", fontWeight: 600 }}>ryansmccoy</a>.<br/>
              <span style={{ fontSize: 14, color: "#999" }}>Open Source, STL made.</span>
            </p>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "#143E8E",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 28px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >Close</button>
          </div>
        </div>
      )}
    </>
  );
}
