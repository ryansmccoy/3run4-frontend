import React, { useState } from "react";
import logo from "./3run4-logo.png"; // Place your logo in src/

const PRIMARY_RED = "#ee2328";
const PRIMARY_BLUE = "#143e8e";
const LIGHT_GRAY = "#f2f3f7";
const CARD_BG = "#ffffff";

const API_URL = "https://qjbg4gz6ff.execute-api.us-east-1.amazonaws.com/prod";

function App() {
  const [name, setName] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [stampCount, setStampCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const fetchCard = async (userName) => {
  setLoading(true);
  setError("");
  try {
    const res = await fetch(`${API_URL}/card?name=${encodeURIComponent(userName)}`);
    const data = await res.json();
    console.log("Card response:", data);

    let parsed = data.body ? JSON.parse(data.body) : {};
    let count = 0;
    if (typeof parsed.stamp_count === "number") {
      count = parsed.stamp_count;
    } else if (parsed.Attributes && typeof parsed.Attributes.stamp_count === "number") {
      count = parsed.Attributes.stamp_count;
    } else if (res.status === 404) {
      count = 0;
    }
    setStampCount(count);
  } catch (err) {
    setError("Failed to connect to backend.");
  }
  setLoading(false);
};

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoggedIn(true);
    await fetchCard(name.trim());
  };

const handleAddStamp = async () => {
  setError("");
  setLoading(true);
  try {
    const res = await fetch(`${API_URL}/stamp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    console.log("Add stamp response:", data);

    let parsed = data.body ? JSON.parse(data.body) : {};
    let count = null;
    if (typeof parsed.stamp_count === "number") {
      count = parsed.stamp_count;
    } else if (parsed.Attributes && typeof parsed.Attributes.stamp_count === "number") {
      count = parsed.Attributes.stamp_count;
    }
    if (count !== null) {
      setStampCount(count);
    } else {
      setError("Could not update stamp count.");
    }
  } catch (err) {
    setError("Failed to add stamp.");
  }
  setLoading(false);
};

  // Reset and log out
  const handleLogout = () => {
    setLoggedIn(false);
    setName("");
    setStampCount(null);
    setError("");
  };

  // Render login form
  if (!loggedIn) {
    return (
      <div style={{
        maxWidth: 350,
        margin: "3rem auto",
        padding: "2rem",
        textAlign: "center",
        background: CARD_BG,
        borderRadius: 16,
        boxShadow: "0 4px 16px rgba(20,62,142,0.10)"
      }}>
        <img src={logo} alt="3run4 logo" style={{ height: 60, marginBottom: 12 }} />
        <h2 style={{ color: PRIMARY_BLUE, margin: "0 0 12px 0" }}>3run4 Stamp Card</h2>
        <form onSubmit={handleLogin}>
          <input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "80%",
              padding: 12,
              fontSize: 16,
              border: `2px solid ${PRIMARY_RED}`,
              borderRadius: 8,
              outline: "none",
              marginBottom: 12
            }}
            required
          />
          <br />
          <button
            style={{
              marginTop: 10,
              padding: "10px 30px",
              fontSize: 16,
              background: PRIMARY_RED,
              color: "white",
              border: "none",
              borderRadius: 8,
              letterSpacing: 1,
              fontWeight: "bold",
              cursor: "pointer"
            }}
            type="submit"
            disabled={loading || !name.trim()}
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
        {error && <p style={{ color: PRIMARY_RED, marginTop: 14 }}>{error}</p>}
      </div>
    );
  }

  // Render the stamp card (4 rows of 5)
  const rows = 4, cols = 5;
  let count = 0;
  const totalStamps = stampCount || 0;

  return (
    <div style={{
      maxWidth: 420,
      margin: "3rem auto",
      padding: "2rem",
      background: CARD_BG,
      borderRadius: 18,
      boxShadow: "0 8px 32px rgba(20,62,142,0.11)",
      textAlign: "center",
      border: `2px solid ${PRIMARY_BLUE}`,
    }}>
      <img src={logo} alt="3run4 logo" style={{ height: 52, marginBottom: 4 }} />
      <h2 style={{ color: PRIMARY_BLUE, margin: "0 0 10px 0", fontWeight: 800 }}>
        Welcome, <span style={{ color: PRIMARY_RED }}>{name}!</span>
      </h2>
      <p style={{ color: PRIMARY_RED, fontWeight: 600, margin: 0 }}>
        Your stamp card:
      </p>
      <div style={{ display: "grid", gridTemplateRows: `repeat(${rows}, 38px)`, gap: 10, margin: "18px 0 0 0" }}>
        {[...Array(rows)].map((_, rowIdx) => (
          <div key={rowIdx} style={{ display: "flex", justifyContent: "center", gap: 14 }}>
            {[...Array(cols)].map((_, colIdx) => {
              count++;
              return (
                <span
                  key={colIdx}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    display: "inline-block",
                    background: count <= totalStamps ? PRIMARY_RED : LIGHT_GRAY,
                    border: `2px solid ${count <= totalStamps ? PRIMARY_BLUE : "#ccc"}`,
                    color: count <= totalStamps ? "white" : "#bbb",
                    fontWeight: "bold",
                    lineHeight: "30px",
                    fontSize: 19,
                    boxShadow: count <= totalStamps ? `0 0 4px ${PRIMARY_BLUE}` : "none",
                    transition: "all 0.2s"
                  }}
                >
                  {count <= totalStamps ? "✓" : ""}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <p style={{ marginTop: 16, fontWeight: "bold", color: PRIMARY_BLUE }}>
        {totalStamps} stamp{totalStamps !== 1 ? "s" : ""}
      </p>
      <button
        onClick={handleAddStamp}
        disabled={loading}
        style={{
          marginTop: 18,
          padding: "10px 26px",
          background: PRIMARY_BLUE,
          color: "white",
          border: "none",
          borderRadius: 8,
          fontSize: 17,
          fontWeight: "bold",
          letterSpacing: 1,
          boxShadow: "0 2px 8px rgba(20,62,142,0.08)",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading ? "Stamping..." : "Add Stamp"}
      </button>
      <br />
      <button
        onClick={handleLogout}
        style={{
          marginTop: 22,
          background: "none",
          color: PRIMARY_RED,
          border: "none",
          textDecoration: "underline",
          fontSize: 15,
          cursor: "pointer",
        }}
      >
        Log out
      </button>
      {error && <p style={{ color: PRIMARY_RED, marginTop: 14 }}>{error}</p>}
    </div>
  );
}

export default App;
