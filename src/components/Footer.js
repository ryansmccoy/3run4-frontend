import React from "react";
import { FaInstagram, FaFacebook, FaGithub } from "react-icons/fa";

const iconStyle = {
  fontSize: 22,
  marginRight: 7,
  verticalAlign: "middle"
};
const linkStyle = {
  margin: "0 12px",
  color: "#143E8E",
  textDecoration: "none",
  fontWeight: 500,
  display: "inline-flex",
  alignItems: "center"
};

export default function Footer() {
  return (
    <footer style={{
      marginTop: 30,
      marginBottom: 5,
      padding: "12px 0 3px 0",
      fontSize: 15,
      textAlign: "center"
    }}>
      <div>
        <a
          href="https://www.instagram.com/threerunfour"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          <FaInstagram style={iconStyle} />
          Instagram
        </a>
        <a
          href="https://www.facebook.com/groups/threerunfour"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          <FaFacebook style={iconStyle} />
          Facebook
        </a>
        <a
          href="https://github.com/ryansmccoy/3run4-frontend"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          <FaGithub style={iconStyle} />
          GitHub
        </a>
      </div>
      <div style={{ color: "#999", fontSize: 13, marginTop: 5 }}>
      </div>
    </footer>
  );
}
