import React from "react";

export default function Footer() {
  return (
    <footer style={{
      marginTop: 36,
      fontSize: 14,
      color: "#888",
      textAlign: "center"
    }}>
      Open Source @ {" "}
      <a href="https://github.com/ryansmccoy/3run4-frontend" target="_blank" rel="noopener noreferrer" style={{ color: "#143E8E", fontWeight: 600 }}>
        3run4
      </a>
    </footer>
  );
}
