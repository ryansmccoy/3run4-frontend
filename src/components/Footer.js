import React from "react";

export default function Footer() {
  return (
    <footer style={{
      marginTop: 36,
      fontSize: 14,
      color: "#888",
      textAlign: "center"
    }}>
      Made by{" "}
      <a href="https://github.com/ryansmccoy" target="_blank" rel="noopener noreferrer" style={{ color: "#143E8E", fontWeight: 600 }}>
        ryansmccoy
      </a>
    </footer>
  );
}
