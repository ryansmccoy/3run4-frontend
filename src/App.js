import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import logo from "./3run4-logo.png"; // Place your logo in src/

const PRIMARY_RED = "#ee2328";
const PRIMARY_BLUE = "#143e8e";
const LIGHT_GRAY = "#f2f3f7";
const CARD_BG = "#ffffff";
const API_URL = "https://qjbg4gz6ff.execute-api.us-east-1.amazonaws.com/prod"; // <--- your actual URL

function UserLoginAndCard() {
  const [name, setName] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [stampCount, setStampCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [initialStamps, setInitialStamps] = useState(0);

  // Fetch the current card for this user
  const fetchCard = async (userName) => {
    setLoading(true);
    setError("");
    try {
      const url = `${API_URL}/card?name=${encodeURIComponent(userName)}`;
      const res = await fetch(url);
      const data = await res.json();
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
      if (parsed.error && parsed.error.toLowerCase().includes("not found")) {
        setIsNewUser(true);
        setLoading(false);
        // DO NOT set loggedIn here
        return;
      }
      let count = typeof parsed.stamp_count === "number" ? parsed.stamp_count : 0;
      setStampCount(count);
      setLoggedIn(true); // Only for *existing* user
      if (parsed.error) setError(parsed.error);
    } catch (err) {
      setError("Failed to connect to backend.");
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    await fetchCard(name.trim());
    // do not setLoggedIn here
  };

  const handleInitialStampsConfirm = async () => {
    if (initialStamps < 0 || initialStamps > 999) {
      setError("Initial stamps must be between 0 and 999.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/stamp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, initial_stamps: initialStamps }),
      });
      const data = await res.json();
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
      let count = typeof parsed.stamp_count === "number" ? parsed.stamp_count : initialStamps;
      setStampCount(count);
      setIsNewUser(false);
      setLoggedIn(true); // Only after new user confirmed!
    } catch (err) {
      setError("Failed to set initial stamp count.");
    }
    setLoading(false);
  };

  // Add a stamp and update UI
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
      } else {
        setError(parsed.error || "Could not update stamp count.");
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
    setIsNewUser(false);
    setError("");
    setInitialStamps(0);
  };

  // New user initial stamps prompt
  if (isNewUser) {
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
        <h2 style={{ color: PRIMARY_BLUE, margin: "0 0 12px 0" }}>Welcome to 3run4!</h2>
        <p>Looks like this is your first time logging in.</p>
        <p>How many stamps do you have on your old paper card?</p>
        <input
          type="number"
          min={0}
          max={999}
          value={initialStamps}
          onChange={e => setInitialStamps(Number(e.target.value))}
          style={{
            width: "50px",
            padding: 8,
            fontSize: 16,
            border: `2px solid ${PRIMARY_RED}`,
            borderRadius: 8,
            marginBottom: 16
          }}
        />
        <br />
        <button
          style={{
            marginTop: 6,
            padding: "10px 30px",
            fontSize: 16,
            background: PRIMARY_BLUE,
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            cursor: "pointer"
          }}
          onClick={handleInitialStampsConfirm}
          disabled={loading || initialStamps < 0}
        >
          {loading ? "Saving..." : "Confirm"}
        </button>
        <br />
        <button
          style={{
            marginTop: 12,
            background: "none",
            color: PRIMARY_RED,
            border: "none",
            textDecoration: "underline",
            fontSize: 15,
            cursor: "pointer",
          }}
          onClick={handleLogout}
        >
          Cancel
        </button>
        {error && <p style={{ color: PRIMARY_RED, marginTop: 14 }}>{error}</p>}
      </div>
    );
  }

  // Show login form if not logged in
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
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: "80%",
              padding: 12,
              fontSize: 16,
              border: `2px solid ${PRIMARY_BLUE}`,
              borderRadius: 8,
              marginBottom: 12
            }}
            required
          /><br />
          <button
            type="submit"
            style={{
              padding: "10px 30px",
              fontSize: 16,
              background: PRIMARY_BLUE,
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: "bold",
              cursor: "pointer"
            }}
            disabled={loading}
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
        {error && <p style={{ color: PRIMARY_RED, marginTop: 14 }}>{error}</p>}
      </div>
    );
  }

  // Dynamic rows: as many as needed for any number of stamps!
  const cols = 5;
  const totalStamps = stampCount || 0;
  const rows = Math.ceil(totalStamps / cols) || 1;
  const totalRowsToShow = Math.max(rows, 1);

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
      <div style={{ display: "grid", gridTemplateRows: `repeat(${totalRowsToShow}, 38px)`, gap: 10, margin: "18px 0 0 0" }}>
        {[...Array(totalRowsToShow)].map((_, rowIdx) => (
          <div key={rowIdx} style={{ display: "flex", justifyContent: "center", gap: 14 }}>
            {[...Array(cols)].map((_, colIdx) => {
              const stampIndex = rowIdx * cols + colIdx + 1;
              return (
                <span
                  key={colIdx}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    display: "inline-block",
                    background: stampIndex <= totalStamps ? PRIMARY_RED : LIGHT_GRAY,
                    border: `2px solid ${stampIndex <= totalStamps ? PRIMARY_BLUE : "#ccc"}`,
                    color: stampIndex <= totalStamps ? "white" : "#bbb",
                    fontWeight: "bold",
                    lineHeight: "30px",
                    fontSize: 19,
                    boxShadow: stampIndex <= totalStamps ? `0 0 4px ${PRIMARY_BLUE}` : "none",
                    transition: "all 0.2s"
                  }}
                >
                  {stampIndex <= totalStamps ? "✓" : ""}
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

// ----------- ADMIN LOGIN AND DASHBOARD WITH RAFFLE -----------
function AdminLoginAndDashboard() {
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [users, setUsers] = useState([]);
  const [usersError, setUsersError] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [raffleWinner, setRaffleWinner] = useState(null);
  const [raffleCandidates, setRaffleCandidates] = useState([]);
  const navigate = useNavigate();

  const ADMIN_USER = "admin";
  const ADMIN_PASS = "3run4";

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError("");
    try {
      const url = `${API_URL}/users`;
      const res = await fetch(url);
      const data = await res.json();
      let items = [];
      if (data.body) {
        try {
          items = JSON.parse(data.body);
        } catch (e) {
          items = [];
        }
      } else {
        items = data;
      }
      setUsers(items);
    } catch (err) {
      setUsersError("Failed to fetch users.");
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
    }
  };

  // ---- Raffle Feature ----
  function isUserPresentThisWeek(user) {
    if (!user.last_stamp_date) return false;
    const stampDate = new Date(user.last_stamp_date);
    const now = new Date();
    // Find most recent Thursday (today if it's Thursday)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let lastThursday = new Date(today);
    while (lastThursday.getDay() !== 4) { // 4 = Thursday
      lastThursday.setDate(lastThursday.getDate() - 1);
    }
    // Compare yyyy-mm-dd
    return stampDate.toISOString().slice(0, 10) === lastThursday.toISOString().slice(0, 10);
  }

  function handlePickRaffleWinner() {
    const candidates = users.filter(isUserPresentThisWeek);
    setRaffleCandidates(candidates);
    if (candidates.length === 0) {
      setRaffleWinner(null);
      alert("No eligible users this week!");
      return;
    }
    const winner = candidates[Math.floor(Math.random() * candidates.length)];
    setRaffleWinner(winner);
  }

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
    <div style={{ maxWidth: 620, margin: "3rem auto", padding: "2rem", textAlign: "center" }}>
      <img src={logo} alt="3run4 logo" style={{ height: 60, marginBottom: 12 }} />
      <h2 style={{ color: PRIMARY_BLUE }}>Admin Dashboard</h2>
      <button onClick={fetchUsers} style={{ marginBottom: 14, fontSize: 15, background: PRIMARY_BLUE, color: "white", border: "none", borderRadius: 6, padding: "8px 20px", fontWeight: 500, cursor: "pointer" }}>
        Refresh
      </button>
      <br />
      <button
        onClick={handlePickRaffleWinner}
        style={{ marginBottom: 18, background: "#ffa500", color: "#222", fontWeight: "bold", borderRadius: 6, padding: "8px 22px", border: "none", fontSize: 15, cursor: "pointer" }}
      >
        Pick Raffle Winner (this week)
      </button>
      {raffleWinner && (
        <div style={{ margin: "18px 0", fontWeight: 700, fontSize: 19, color: "#ee2328" }}>
          🎉 Raffle Winner: {raffleWinner.name}
        </div>
      )}
      {raffleCandidates.length > 0 && (
        <div style={{ margin: "0 0 18px 0", fontSize: 15 }}>
          <span>Eligible this week:</span> {raffleCandidates.map(u => u.name).join(", ")}
        </div>
      )}
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