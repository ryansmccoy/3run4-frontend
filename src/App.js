import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import logo from "./3run4-logo.png";

const PRIMARY_RED = "#ee2328";
const PRIMARY_BLUE = "#143e8e";
const LIGHT_GRAY = "#f2f3f7";
const CARD_BG = "#ffffff";
const API_URL = "https://qjbg4gz6ff.execute-api.us-east-1.amazonaws.com/prod";

function UserLoginAndCard() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [stampCount, setStampCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prizesClaimed, setPrizesClaimed] = useState([]);
  const [initialStampsInput, setInitialStampsInput] = useState("");
  const [firstTime, setFirstTime] = useState(false);

  // Emoji for prizes at the end of each row
  const prizeEmojis = ["🧢", "🍺", "🚗", ""];
  const prizeThresholds = [5, 10, 15, 0]; // 0 for padding

  // 5 stamps per row, + 1 for prize
  const stampsPerRow = 5;

  // Helper to get # of rows needed for user's stamps (minimum 4)
  const totalRows = Math.max(Math.ceil((stampCount || 0) / stampsPerRow), 4);

  // Fetch card data from backend
const fetchCard = async (userEmail) => {
  setLoading(true);
  setError("");
  try {
    const url = `${API_URL}/card?email=${encodeURIComponent(userEmail)}`;
    const res = await fetch(url);
    if (res.status === 404) {
      // Definitely a new user!
      setFirstTime(true);
      setDisplayName("");
      setStampCount(0);
      setPrizesClaimed([]);
      setError("");
      setLoading(false);
      return;
    }
    const data = await res.json();
    let parsed = {};
    if (data.body) { try { parsed = JSON.parse(data.body); } catch { parsed = data.body; } } else { parsed = data; }
    if (parsed.error === "User not found") {
      setFirstTime(true);
      setDisplayName("");
      setStampCount(0);
      setPrizesClaimed([]);
      setError("");
      setLoading(false);
      return;
    }
    setStampCount(parsed.stamp_count || 0);
    setDisplayName(parsed.display_name || "");
    setPrizesClaimed(parsed.prizes_claimed || []);
    setFirstTime(false);
    if (parsed.error) setError(parsed.error);
  } catch (err) {
    setFirstTime(true);
    setDisplayName("");
    setStampCount(0);
    setPrizesClaimed([]);
    setError("");
  }
  setLoading(false);
};


  // On login, fetch or register user
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoggedIn(true);
    await fetchCard(email.trim().toLowerCase());
  };

  // If first login and displayName is empty, ask for it
  const handleSetDisplayName = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let body = {
        email: email.trim().toLowerCase(),
        display_name: displayNameInput.trim()
      };
      if (firstTime && initialStampsInput && !isNaN(Number(initialStampsInput))) {
        body.stamp_count = Number(initialStampsInput);
      }
      const res = await fetch(`${API_URL}/card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await fetchCard(email.trim().toLowerCase());
    } catch (err) {
      setError("Failed to save display name.");
    }
    setLoading(false);
  };

  const handleAddStamp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/stamp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      let parsed = {};
      if (data.body) { try { parsed = JSON.parse(data.body); } catch { parsed = data.body; } } else { parsed = data; }
      let count = typeof parsed.stamp_count === "number" ? parsed.stamp_count : null;
      setStampCount(count || 0);
      setPrizesClaimed(parsed.prizes_claimed || []);
      if (parsed.error) setError(parsed.error);
    } catch (err) {
      setError("Failed to add stamp.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setEmail("");
    setDisplayName("");
    setStampCount(null);
    setPrizesClaimed([]);
    setError("");
  };

  // Display name + initial stamp form for first-time users
  if (loggedIn && !displayName) {
    return (
      <div style={{ maxWidth: 350, margin: "3rem auto", padding: "2rem", textAlign: "center", background: CARD_BG, borderRadius: 16, boxShadow: "0 4px 16px rgba(20,62,142,0.10)" }}>
        <img src={logo} alt="3run4 logo" style={{ height: 60, marginBottom: 12 }} />
        <h2 style={{ color: PRIMARY_BLUE }}>Welcome!</h2>
        <form onSubmit={handleSetDisplayName}>
          <div>
            <label style={{ fontWeight: "bold", color: PRIMARY_BLUE }}>What do you want your card to say?</label>
            <input
              placeholder="Display Name"
              value={displayNameInput}
              onChange={e => setDisplayNameInput(e.target.value)}
              style={{ width: "80%", padding: 12, fontSize: 16, border: `2px solid ${PRIMARY_BLUE}`, borderRadius: 8, outline: "none", marginBottom: 12 }}
              required
            />
          </div>
          {firstTime && (
            <div>
              <label style={{ fontWeight: "bold", color: PRIMARY_RED }}>
                How many stamps did you have on your old paper card? <br />
                <span style={{ fontWeight: 400, color: "#333", fontSize: 13 }}>(Leave blank for 0)</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 7"
                value={initialStampsInput}
                onChange={e => setInitialStampsInput(e.target.value)}
                style={{ width: "80%", padding: 12, fontSize: 16, border: `2px solid ${PRIMARY_RED}`, borderRadius: 8, outline: "none", marginBottom: 12, marginTop: 4 }}
              />
            </div>
          )}
          <button style={{ marginTop: 10, padding: "10px 30px", fontSize: 16, background: PRIMARY_BLUE, color: "white", border: "none", borderRadius: 8, letterSpacing: 1, fontWeight: "bold", cursor: "pointer" }} type="submit" disabled={loading || !displayNameInput.trim()}>
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
        {error && <p style={{ color: PRIMARY_RED, marginTop: 14 }}>{error}</p>}
        <button onClick={handleLogout} style={{ marginTop: 22, background: "none", color: PRIMARY_RED, border: "none", textDecoration: "underline", fontSize: 15, cursor: "pointer" }}>Log out</button>
      </div>
    );
  }

  // Login form
  if (!loggedIn) {
    return (
      <div style={{ maxWidth: 350, margin: "3rem auto", padding: "2rem", textAlign: "center", background: CARD_BG, borderRadius: 16, boxShadow: "0 4px 16px rgba(20,62,142,0.10)" }}>
        <img src={logo} alt="3run4 logo" style={{ height: 60, marginBottom: 12 }} />
        <h2 style={{ color: PRIMARY_BLUE, margin: "0 0 12px 0" }}>3run4 Stamp Card</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "80%", padding: 12, fontSize: 16, border: `2px solid ${PRIMARY_RED}`, borderRadius: 8, outline: "none", marginBottom: 12 }}
            required
          />
          <br />
          <button style={{ marginTop: 10, padding: "10px 30px", fontSize: 16, background: PRIMARY_RED, color: "white", border: "none", borderRadius: 8, letterSpacing: 1, fontWeight: "bold", cursor: "pointer" }} type="submit" disabled={loading || !email.trim()}>
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
        {error && <p style={{ color: PRIMARY_RED, marginTop: 14 }}>{error}</p>}
      </div>
    );
  }

  // ----- LOGGED-IN USER STAMP CARD -----
  // Dynamically render rows; 5 stamps + 1 emoji at end per row
  const renderRows = [];
  for (let row = 0; row < totalRows; row++) {
    const rowStamps = [];
    for (let i = 0; i < stampsPerRow; i++) {
      const stampNumber = row * stampsPerRow + i + 1;
      rowStamps.push(
        <span key={i} style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          display: "inline-block",
          background: stampNumber <= (stampCount || 0) ? PRIMARY_RED : LIGHT_GRAY,
          border: `2px solid ${stampNumber <= (stampCount || 0) ? PRIMARY_BLUE : "#ccc"}`,
          color: stampNumber <= (stampCount || 0) ? "white" : "#bbb",
          fontWeight: "bold",
          lineHeight: "30px",
          fontSize: 19,
          marginRight: 8,
          boxShadow: stampNumber <= (stampCount || 0) ? `0 0 4px ${PRIMARY_BLUE}` : "none",
          transition: "all 0.2s"
        }}>
          {stampNumber <= (stampCount || 0) ? "✓" : ""}
        </span>
      );
    }
    // Emoji prize at end (dim if not yet reached)
    let emoji = "";
    let dim = false;
    if (row < prizeEmojis.length && prizeEmojis[row]) {
      emoji = prizeEmojis[row];
      dim = (stampCount || 0) < prizeThresholds[row];
    }
    rowStamps.push(
      <span key="emoji" style={{
        marginLeft: 6,
        fontSize: 22,
        opacity: emoji && dim ? 0.25 : 1,
        filter: emoji && dim ? "grayscale(60%)" : "none"
      }}>{emoji}</span>
    );
    renderRows.push(
      <div key={row} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0, marginBottom: 8 }}>
        {rowStamps}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 420, margin: "3rem auto", padding: "2rem", background: CARD_BG, borderRadius: 18, boxShadow: "0 8px 32px rgba(20,62,142,0.11)", textAlign: "center", border: `2px solid ${PRIMARY_BLUE}` }}>
      <img src={logo} alt="3run4 logo" style={{ height: 52, marginBottom: 4 }} />
      <h2 style={{ color: PRIMARY_BLUE, margin: "0 0 10px 0", fontWeight: 800 }}>
        Welcome, <span style={{ color: PRIMARY_RED }}>{displayName}</span>!
      </h2>
      <div style={{ color: PRIMARY_RED, fontWeight: 600, marginBottom: 2 }}>Your stamp card:</div>
      <div style={{ marginTop: 18, marginBottom: 0 }}>
        {renderRows}
      </div>
      <p style={{ marginTop: 12, fontWeight: "bold", color: PRIMARY_BLUE }}>
        {stampCount || 0} stamp{stampCount === 1 ? "" : "s"}
      </p>
      <button
        onClick={handleAddStamp}
        disabled={loading}
        style={{ marginTop: 18, padding: "10px 26px", background: PRIMARY_BLUE, color: "white", border: "none", borderRadius: 8, fontSize: 17, fontWeight: "bold", letterSpacing: 1, boxShadow: "0 2px 8px rgba(20,62,142,0.08)", cursor: loading ? "wait" : "pointer" }}
      >
        {loading ? "Stamping..." : "Add Stamp"}
      </button>
      <br />
      <button onClick={handleLogout} style={{ marginTop: 22, background: "none", color: PRIMARY_RED, border: "none", textDecoration: "underline", fontSize: 15, cursor: "pointer" }}>
        Log out
      </button>
      {error && <p style={{ color: PRIMARY_RED, marginTop: 14 }}>{error}</p>}
    </div>
  );
}

// ---------- ADMIN DASHBOARD & LOGIN ----------
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
  const [csv, setCSV] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const ADMIN_USER = "admin";
  const ADMIN_PASS = "3run4";
  const navigate = useNavigate();

  // Fetch all users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError("");
    try {
      const url = `${API_URL}/users`;
      const res = await fetch(url);
      const data = await res.json();
      let items = [];
      if (data.body) { try { items = JSON.parse(data.body); } catch { items = []; } } else { items = data; }
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
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let lastThursday = new Date(today);
    while (lastThursday.getDay() !== 4) { lastThursday.setDate(lastThursday.getDate() - 1); }
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

  // ---- Export CSV ----
  function handleExportCSV() {
    const header = "Email,Display Name,Stamps,Last Stamp Date";
    const lines = users.map(u =>
      [u.email, `"${u.display_name || ""}"`, u.stamp_count || 0, u.last_stamp_date || ""].join(",")
    );
    setCSV([header, ...lines].join("\n"));
    setTimeout(() => {
      const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "3run4_users.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 150);
  }

  // ---- Leaderboard ----
  const getStreak = (user) => user.streak || 0;
  const topStreaks = [...users].sort((a, b) => (getStreak(b) - getStreak(a))).slice(0, 5);

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
    <div style={{ maxWidth: 760, margin: "3rem auto", padding: "2rem", textAlign: "center" }}>
      <img src={logo} alt="3run4 logo" style={{ height: 60, marginBottom: 12 }} />
      <h2 style={{ color: PRIMARY_BLUE }}>Admin Dashboard</h2>
      <button onClick={fetchUsers} style={{ marginBottom: 14, fontSize: 15, background: PRIMARY_BLUE, color: "white", border: "none", borderRadius: 6, padding: "8px 20px", fontWeight: 500, cursor: "pointer" }}>
        Refresh
      </button>{" "}
      <button onClick={handleExportCSV} style={{ marginBottom: 14, fontSize: 15, background: "#1fa743", color: "white", border: "none", borderRadius: 6, padding: "8px 20px", fontWeight: 500, cursor: "pointer" }}>
        Export Emails (CSV)
      </button>
      <br />
      <button
        onClick={handlePickRaffleWinner}
        style={{ marginBottom: 18, background: "#ffa500", color: "#222", fontWeight: "bold", borderRadius: 6, padding: "8px 22px", border: "none", fontSize: 15, cursor: "pointer" }}
      >
        Pick Raffle Winner (this week)
      </button>{" "}
      <button
        onClick={() => setShowLeaderboard(l => !l)}
        style={{ marginBottom: 18, background: "#24b6f9", color: "#fff", fontWeight: "bold", borderRadius: 6, padding: "8px 22px", border: "none", fontSize: 15, cursor: "pointer" }}
      >
        {showLeaderboard ? "Hide" : "Show"} Streaks Leaderboard
      </button>
      {raffleWinner && (
        <div style={{ margin: "18px 0", fontWeight: 700, fontSize: 19, color: "#ee2328" }}>
          🎉 Raffle Winner: {raffleWinner.display_name || raffleWinner.email}
        </div>
      )}
      {raffleCandidates.length > 0 && (
        <div style={{ margin: "0 0 18px 0", fontSize: 15 }}>
          <span>Eligible this week:</span> {raffleCandidates.map(u => u.display_name || u.email).join(", ")}
        </div>
      )}
      {showLeaderboard && (
        <div style={{ margin: "0 0 18px 0", fontSize: 15, background: "#f6faff", padding: 12, borderRadius: 7 }}>
          <div style={{ fontWeight: "bold", color: PRIMARY_BLUE, fontSize: 16 }}>🏆 Streaks Leaderboard</div>
          {topStreaks.map((u, idx) => (
            <div key={idx}>
              {idx + 1}. {u.display_name || u.email} – {u.streak || 0} weeks
            </div>
          ))}
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
              <th style={{ padding: 8, border: `1px solid ${PRIMARY_BLUE}` }}>Email</th>
              <th style={{ padding: 8, border: `1px solid ${PRIMARY_BLUE}` }}>Display Name</th>
              <th style={{ padding: 8, border: `1px solid ${PRIMARY_BLUE}` }}>Stamps</th>
              <th style={{ padding: 8, border: `1px solid ${PRIMARY_BLUE}` }}>Last Stamp Date</th>
              <th style={{ padding: 8, border: `1px solid ${PRIMARY_BLUE}` }}>Claimed Prizes</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 12 }}>No users yet.</td></tr>
            ) : users.map((u, idx) => (
              <tr key={idx}>
                <td style={{ padding: 8, border: `1px solid #bbb` }}>{u.email}</td>
                <td style={{ padding: 8, border: `1px solid #bbb` }}>{u.display_name || "-"}</td>
                <td style={{ padding: 8, border: `1px solid #bbb`, textAlign: "center" }}>{u.stamp_count || 0}</td>
                <td style={{ padding: 8, border: `1px solid #bbb`, textAlign: "center" }}>{u.last_stamp_date || "-"}</td>
                <td style={{ padding: 8, border: `1px solid #bbb`, textAlign: "center" }}>
                  {(u.prizes_claimed || []).join(", ")}
                </td>
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
