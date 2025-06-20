import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import logo from "./3run4-logo.png"; // Place your logo in src/

const PRIMARY_RED = "#ee2328";
const PRIMARY_BLUE = "#143e8e";
const LIGHT_GRAY = "#f2f3f7";
const CARD_BG = "#ffffff";
const API_URL = "https://qjbg4gz6ff.execute-api.us-east-1.amazonaws.com/prod"; // <--- set your actual URL

function UserLoginAndCard() {
  const [name, setName] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [stampCount, setStampCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch the current card for this user
  const fetchCard = async (userName) => {
    setLoading(true);
    setError("");
    try {
      const url = `${API_URL}/card?name=${encodeURIComponent(userName)}`;
      console.log("Fetching card with URL:", url);
      const res = await fetch(url);
      const data = await res.json();
      console.log("Card response:", data);
let parsed = {};
if (data.body) {
  try {
    parsed = JSON.parse(data.body);
  } catch (e) {
    parsed = data.body;
  }
} else {
  parsed = data;
}
let count = typeof parsed.stamp_count === "number" ? parsed.stamp_count : 0;

      setStampCount(count);
      if (parsed.error) setError(parsed.error);
    } catch (err) {
      console.error("Fetch card error:", err);
      setError("Failed to connect to backend.");
    }
    setLoading(false);
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoggedIn(true);
    console.log("User logged in:", name.trim());
    await fetchCard(name.trim());
  };

  // Add a stamp and update UI
const handleAddStamp = async () => {
  setError("");
  setLoading(true);
  try {
    console.log("Add stamp for:", name);
    const res = await fetch(`${API_URL}/stamp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    console.log("Add stamp response:", data);

    let parsed = {};
    if (data.body) {
      try {
        parsed = JSON.parse(data.body);
      } catch (e) {
        parsed = data.body;
      }
    } else {
      parsed = data;
    }
    let count = typeof parsed.stamp_count === "number" ? parsed.stamp_count : null;

    if (count !== null) {
      setStampCount(count);
      console.log("Updated stamp count:", count);
    } else {
      setError(parsed.error || "Could not update stamp count.");
      console.warn("Stamp error:", parsed.error);
    }
  } catch (err) {
    setError("Failed to add stamp.");
    console.error("Add stamp error:", err);
  }
  setLoading(false);
};
  // Reset and log out
  const handleLogout = () => {
    setLoggedIn(false);
    setName("");
    setStampCount(null);
    setError("");
    console.log("User logged out.");
  };

  // Login form
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

// ----------- ADMIN LOGIN AND DASHBOARD -----------
function AdminLoginAndDashboard() {
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [users, setUsers] = useState([]);
  const [usersError, setUsersError] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const navigate = useNavigate();

  const ADMIN_USER = "admin";
  const ADMIN_PASS = "3run4";

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError("");
    try {
      const url = `${API_URL}/users`;
      console.log("Fetching all users with URL:", url);
      const res = await fetch(url);
      const data = await res.json();
      console.log("All users response:", data);
      const items = data.body ? JSON.parse(data.body) : data;
      setUsers(items);
    } catch (err) {
      setUsersError("Failed to fetch users.");
      console.error("Fetch users error:", err);
    }
    setLoadingUsers(false);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (adminUsername === ADMIN_USER && adminPassword === ADMIN_PASS) {
      setAdminLoggedIn(true);
      setAdminError("");
      await fetchUsers();
    } else {
      setAdminError("Invalid admin username or password.");
      console.warn("Admin login failed!");
    }
  };

  if (!adminLoggedIn) {
    return (
      <div style={{ maxWidth: 350, margin: "3rem auto", padding: "2rem", textAlign: "center" }}>
        <img src={logo} alt="3run4 logo" style={{ height: 60, marginBottom: 12 }} />
        <h2 style={{ color: PRIMARY_BLUE }}>Admin Login</h2>
        <form onSubmit={handleAdminLogin}>
          <input
            placeholder="Username"
            value={adminUsername}
            onChange={e => setAdminUsername(e.target.value)}
            style={{ width: "80%", padding: 12, fontSize: 16, border: `2px solid ${PRIMARY_BLUE}`, borderRadius: 8, marginBottom: 12 }}
            required
          /><br/>
          <input
            type="password"
            placeholder="Password"
            value={adminPassword}
            onChange={e => setAdminPassword(e.target.value)}
            style={{ width: "80%", padding: 12, fontSize: 16, border: `2px solid ${PRIMARY_RED}`, borderRadius: 8, marginBottom: 12 }}
            required
          /><br/>
          <button style={{ padding: "10px 30px", fontSize: 16, background: PRIMARY_BLUE, color: "white", border: "none", borderRadius: 8, letterSpacing: 1, fontWeight: "bold", cursor: "pointer" }} type="submit">
            Login
          </button>
        </form>
        {adminError && <p style={{ color: PRIMARY_RED, marginTop: 14 }}>{adminError}</p>}
        <button
          onClick={() => navigate("/")}
          style={{ marginTop: 16, color: PRIMARY_BLUE, background: "none", border: "none", textDecoration: "underline" }}
        >
          Back to User Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 540, margin: "3rem auto", padding: "2rem", textAlign: "center" }}>
      <img src={logo} alt="3run4 logo" style={{ height: 60, marginBottom: 12 }} />
      <h2 style={{ color: PRIMARY_BLUE }}>Admin Dashboard</h2>
      <button onClick={fetchUsers} style={{ marginBottom: 14, fontSize: 15, background: PRIMARY_BLUE, color: "white", border: "none", borderRadius: 6, padding: "8px 20px", fontWeight: 500, cursor: "pointer" }}>
        Refresh
      </button>
      {loadingUsers ? (
        <p>Loading users...</p>
      ) : usersError ? (
        <p style={{ color: PRIMARY_RED }}>{usersError}</p>
      ) : (
        <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: LIGHT_GRAY }}>
              <th style={{ padding: 8, border: `1px solid ${PRIMARY_BLUE}` }}>Name</th>
              <th style={{ padding: 8, border: `1px solid ${PRIMARY_BLUE}` }}>Stamps</th>
              <th style={{ padding: 8, border: `1px solid ${PRIMARY_BLUE}` }}>Last Stamp Date</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: 12 }}>No users yet.</td></tr>
            ) : users.map((u, idx) => (
              <tr key={idx}>
                <td style={{ padding: 8, border: `1px solid #bbb` }}>{u.name}</td>
                <td style={{ padding: 8, border: `1px solid #bbb`, textAlign: "center" }}>{u.stamp_count || 0}</td>
                <td style={{ padding: 8, border: `1px solid #bbb`, textAlign: "center" }}>{u.last_stamp_date || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={() => setAdminLoggedIn(false)} style={{ marginTop: 22, background: "none", color: PRIMARY_RED, border: "none", textDecoration: "underline", fontSize: 15, cursor: "pointer" }}>
        Log out
      </button>
    </div>
  );
}

// ----------- APP ROUTER -----------
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminLoginAndDashboard />} />
        <Route path="/" element={<UserLoginAndCard />} />
      </Routes>
    </Router>
  );
}

export default App;
