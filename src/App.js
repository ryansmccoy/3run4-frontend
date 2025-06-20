import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import logo from "./3run4-logo.png";

// ---- Color Palette ----
const PRIMARY_BLUE = "#143E8E";
const PRIMARY_RED = "#E02327";
const CARD_BG = "#fff";
const LIGHT_GRAY = "#f4f6fa";
const API_URL = "https://qjbg4gz6ff.execute-api.us-east-1.amazonaws.com/prod";

// ---- Attendance Bar Chart (Tiny) ----
function AttendanceBar({ dates }) {
  if (!Array.isArray(dates) || dates.length === 0) return <div style={{minWidth:60}} />;
  // Only show last 40 weeks, right-aligned
  const maxBars = 40;
  const sorted = [...dates].sort();
  const bars = sorted.slice(-maxBars);
  return (
    <div style={{ display: "flex", gap: 1, alignItems: "flex-end", minWidth: 60 }}>
      {[...Array(maxBars)].map((_, i) => {
        const hasAttendance = i >= maxBars - bars.length;
        return (
          <div
            key={i}
            title={hasAttendance ? bars[i - (maxBars - bars.length)] : ""}
            style={{
              width: 4,
              height: hasAttendance ? 20 : 8,
              background: hasAttendance ? "#143E8E" : "#E0E2E8",
              borderRadius: 2,
              marginRight: i === maxBars-1 ? 0 : 1,
              transition: "background 0.2s"
            }}
          />
        );
      })}
    </div>
  );
}

// --------------- USER LOGIN AND CARD ---------------
function UserLoginAndCard() {
  const [email, setEmail] = useState("");
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [initialStampsInput, setInitialStampsInput] = useState("");
  const [firstTime, setFirstTime] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [stampCount, setStampCount] = useState(0);
  const [prizesClaimed, setPrizesClaimed] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const emailTrimmed = email.trim().toLowerCase();
    try {
      const url = `${API_URL}/card?email=${encodeURIComponent(emailTrimmed)}`;
      const res = await fetch(url);
      if (res.status === 404) {
        setFirstTime(true);
        setDisplayName("");
        setStampCount(0);
        setPrizesClaimed([]);
        setLoggedIn(true);
        setError("");
      } else {
        const data = await res.json();
        let parsed = data.body ? JSON.parse(data.body) : data;
        setDisplayName(parsed.display_name || "");
        setStampCount(parsed.stamp_count || 0);
        setPrizesClaimed(parsed.prizes_claimed || []);
        setFirstTime(false);
        setLoggedIn(true);
        setError("");
      }
    } catch {
      setError("Could not login.");
    }
    setLoading(false);
  };

  const handleSetDisplayName = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
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
      const data = await res.json();
      let parsed = data.body ? JSON.parse(data.body) : data;
      setDisplayName(parsed.display_name || "");
      setStampCount(parsed.stamp_count || 0);
      setPrizesClaimed(parsed.prizes_claimed || []);
      setFirstTime(false);
      setError("");
    } catch {
      setError("Failed to save display name.");
    }
    setLoading(false);
  };

  const handleAddStamp = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/stamp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      let parsed = data.body ? JSON.parse(data.body) : data;
      if (parsed.stamp_count !== undefined) setStampCount(parsed.stamp_count);
      if (parsed.prizes_claimed) setPrizesClaimed(parsed.prizes_claimed);
      setError(parsed.error || "");
    } catch {
      setError("Could not update stamp count.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setEmail("");
    setDisplayName("");
    setDisplayNameInput("");
    setStampCount(0);
    setPrizesClaimed([]);
    setLoggedIn(false);
    setError("");
    setFirstTime(false);
    setInitialStampsInput("");
  };

  // ---- Render logic for user registration and card ----
  if (!loggedIn) {
    return (
      <div style={{ maxWidth: 350, margin: "3rem auto", padding: "2rem", textAlign: "center", background: CARD_BG, borderRadius: 16, boxShadow: "0 4px 16px rgba(20,62,142,0.10)" }}>
        <img src={logo} alt="3run4 logo" style={{ height: 60, marginBottom: 12 }} />
        <h2 style={{ color: PRIMARY_BLUE }}>Sign in</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: "80%", padding: 12, fontSize: 16, border: `2px solid ${PRIMARY_BLUE}`, borderRadius: 8, marginBottom: 12 }}
            required
          />
          <button style={{ padding: "10px 30px", fontSize: 16, background: PRIMARY_BLUE, color: "white", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        {error && <p style={{ color: PRIMARY_RED, marginTop: 14 }}>{error}</p>}
      </div>
    );
  }

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

  // ---- Fancy Stamp Card UI (add your own emojis if desired!) ----
  function getPrizeEmoji(idx) {
    if (idx === 4) return "🧢"; // 5 stamps
    if (idx === 9) return "🍺"; // 10 stamps
    if (idx === 14) return "🚗"; // 15 stamps
    return "";
  }

  const cardRows = 4, cardCols = 5;
  const stampCircles = [];
  for (let row = 0; row < cardRows; ++row) {
    const rowArr = [];
    for (let col = 0; col < cardCols; ++col) {
      const idx = row * cardCols + col;
      rowArr.push(
        <div key={col} style={{
          width: 36, height: 36, borderRadius: 18,
          margin: 4,
          background: idx < stampCount ? PRIMARY_RED : "#ececec",
          border: `2px solid ${PRIMARY_BLUE}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 21, fontWeight: "bold", color: "#fff", position: "relative"
        }}>
          {idx < stampCount ? "✔️" : ""}
          <span style={{ position: "absolute", right: -25 }}>{getPrizeEmoji(idx)}</span>
        </div>
      );
    }
    stampCircles.push(
      <div key={row} style={{ display: "flex", justifyContent: "center" }}>{rowArr}</div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "3rem auto", padding: "2rem", textAlign: "center", background: CARD_BG, borderRadius: 16, boxShadow: "0 4px 16px rgba(20,62,142,0.10)" }}>
      <img src={logo} alt="3run4 logo" style={{ height: 60, marginBottom: 12 }} />
      <h2>
        <span style={{ color: PRIMARY_BLUE }}>Welcome,</span>{" "}
        <span style={{ color: PRIMARY_RED }}>{displayName || email}</span>!
      </h2>
      <div style={{ margin: "16px 0 10px 0", color: PRIMARY_RED, fontWeight: 700 }}>Your stamp card:</div>
      <div>{stampCircles}</div>
      <div style={{margin:"10px 0 5px 0", color:PRIMARY_BLUE, fontWeight:700}}>Prizes:</div>
      <div style={{fontSize:15, marginBottom:6}}>
        <b>5 stamps:</b> Hat<br/>
        <b>10 stamps:</b> Case of Beer<br/>
        <b>15 stamps:</b> Model Car
      </div>
      <div style={{ margin: "12px 0", color: PRIMARY_BLUE, fontWeight: 700 }}>{stampCount} stamps</div>
      <button
        onClick={handleAddStamp}
        style={{
          padding: "10px 30px",
          fontSize: 16,
          background: PRIMARY_BLUE,
          color: "white",
          border: "none",
          borderRadius: 8,
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: 10
        }}
        disabled={loading}
      >
        Add Stamp
      </button>
      <div>
        <button onClick={handleLogout} style={{ marginTop: 14, background: "none", color: PRIMARY_RED, border: "none", textDecoration: "underline", fontSize: 15, cursor: "pointer" }}>Log out</button>
      </div>
      {error && <div style={{ color: PRIMARY_RED, marginTop: 8 }}>{error}</div>}
    </div>
  );
}

// --------------- ADMIN DASHBOARD ---------------
function AdminLoginAndDashboard() {
  const navigate = useNavigate();
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterWeek, setFilterWeek] = useState("this"); // "this", "last", "custom"
  const [customWeek, setCustomWeek] = useState(""); // format: "2025-06-20"
  const [raffleWinner, setRaffleWinner] = useState(null);
  const [manualEdit, setManualEdit] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);

  // ----- ADMIN LOGIN -----
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminEmail === "admin@3run4.org" && adminPassword === "3run4") {
      setAdminLoggedIn(true);
      setAdminError("");
      fetchUsers();
    } else {
      setAdminError("Invalid admin login");
    }
  };

  // ----- FETCH USERS -----
  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError("");
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      let parsed = data.body ? JSON.parse(data.body) : data;
      setUsers(parsed || []);
    } catch {
      setUsersError("Failed to load users.");
    }
    setLoadingUsers(false);
  };

  // ----- FILTER/SEARCH -----
  const getFilteredUsers = () => {
    let filtered = users;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        u =>
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.display_name && u.display_name.toLowerCase().includes(q))
      );
    }
    // Filter by attendance week
    let weekStart;
    if (filterWeek === "this" || filterWeek === "last" || filterWeek === "custom") {
      let base = new Date();
      if (filterWeek === "last") base.setDate(base.getDate() - 7);
      if (filterWeek === "custom" && customWeek) base = new Date(customWeek);
      // Find most recent Thursday before (or on) that date
      const day = base.getDay();
      const thursday = new Date(base);
      thursday.setDate(base.getDate() - ((day + 7 - 4) % 7));
      thursday.setHours(0, 0, 0, 0);
      weekStart = thursday.toISOString().slice(0, 10);
      filtered = filtered.filter(
        u =>
          u.attendance_dates &&
          u.attendance_dates.includes(weekStart)
      );
    }
    return filtered;
  };

  // ----- RAFFLE PICKER -----
  const handlePickRaffleWinner = () => {
    const eligible = getFilteredUsers();
    if (eligible.length === 0) return setRaffleWinner(null);
    const winner = eligible[Math.floor(Math.random() * eligible.length)];
    setRaffleWinner(winner);
  };

  // ----- MANUAL STAMP ADJUSTMENT -----
  const handleManualEdit = (email, field, value) => {
    setManualEdit({ ...manualEdit, [email]: { ...manualEdit[email], [field]: value } });
  };

  const handleSaveManualEdit = async (email) => {
    const { stamp_count } = manualEdit[email];
    try {
      await fetch(`${API_URL}/card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, stamp_count: Number(stamp_count) }),
      });
      fetchUsers();
      setManualEdit({ ...manualEdit, [email]: {} });
    } catch {}
  };

  // ----- ADMIN UI -----
  if (!adminLoggedIn) {
    return (
      <div style={{ maxWidth: 350, margin: "3rem auto", padding: "2rem", textAlign: "center" }}>
        <img src={logo} alt="3run4 logo" style={{ height: 60, marginBottom: 12 }} />
        <h2 style={{ color: PRIMARY_BLUE }}>Admin Login</h2>
        <form onSubmit={handleAdminLogin}>
          <input
            type="email"
            placeholder="Admin Email"
            value={adminEmail}
            onChange={e => setAdminEmail(e.target.value)}
            style={{ width: "80%", padding: 12, fontSize: 16, border: `2px solid ${PRIMARY_BLUE}`, borderRadius: 8, marginBottom: 12 }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={adminPassword}
            onChange={e => setAdminPassword(e.target.value)}
            style={{ width: "80%", padding: 12, fontSize: 16, border: `2px solid ${PRIMARY_BLUE}`, borderRadius: 8, marginBottom: 12 }}
            required
          />
          <button style={{ padding: "10px 30px", fontSize: 16, background: PRIMARY_BLUE, color: "white", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}>
            Login
          </button>
        </form>
        {adminError && <p style={{ color: PRIMARY_RED, marginTop: 14 }}>{adminError}</p>}
      </div>
    );
  }

  // ------ Admin Dashboard ------
  return (
    <div style={{ maxWidth: 950, margin: "2rem auto", padding: "2rem", background: CARD_BG, borderRadius: 18, boxShadow: "0 4px 24px rgba(20,62,142,0.08)" }}>
      <img src={logo} alt="3run4 logo" style={{ height: 46, marginBottom: 10 }} />
      <h2 style={{ color: PRIMARY_BLUE, marginTop: 0, marginBottom: 10 }}>Admin Dashboard</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <input
          type="text"
          placeholder="Search email or name"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ fontSize: 15, padding: 7, border: `1.5px solid ${PRIMARY_BLUE}`, borderRadius: 6, marginRight: 8, minWidth: 180 }}
        />
        <select value={filterWeek} onChange={e => setFilterWeek(e.target.value)} style={{ fontSize: 15, padding: 7, borderRadius: 6 }}>
          <option value="this">This Week</option>
          <option value="last">Last Week</option>
          <option value="custom">Pick a Week</option>
        </select>
        {filterWeek === "custom" && (
          <input
            type="date"
            value={customWeek}
            onChange={e => setCustomWeek(e.target.value)}
            style={{ marginRight: 10 }}
          />
        )}
        <button onClick={fetchUsers} style={{ background: PRIMARY_BLUE, color: "white", border: "none", padding: "7px 14px", borderRadius: 5 }}>Refresh</button>
        <button onClick={handlePickRaffleWinner} style={{ background: PRIMARY_RED, color: "white", border: "none", padding: "7px 14px", borderRadius: 5, marginLeft: 16 }}>Pick Raffle Winner</button>
      </div>
      {raffleWinner && (
        <div style={{ background: "#f8fcf3", color: PRIMARY_RED, fontWeight: 700, border: `2px dashed ${PRIMARY_RED}`, padding: 16, marginBottom: 14, borderRadius: 8 }}>
          🎉 Raffle Winner: {raffleWinner.display_name || raffleWinner.email}
        </div>
      )}
      {loadingUsers && <div>Loading...</div>}
      {usersError && <div style={{ color: PRIMARY_RED }}>{usersError}</div>}
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 15 }}>
          <thead>
            <tr style={{ background: LIGHT_GRAY }}>
              <th>Email</th>
              <th>Display Name</th>
              <th>Stamps</th>
              <th>Attendance</th>
              <th>Prizes</th>
              <th>Streak</th>
              <th>Adjust</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredUsers().map(u => (
              <tr key={u.email}>
                <td>{u.email}</td>
                <td>{u.display_name}</td>
                <td>{manualEdit[u.email] ? (
                  <input
                    type="number"
                    value={manualEdit[u.email].stamp_count || u.stamp_count}
                    onChange={e => handleManualEdit(u.email, "stamp_count", e.target.value)}
                    style={{ width: 50 }}
                  />
                ) : u.stamp_count}
                </td>
                <td>
                  <AttendanceBar dates={u.attendance_dates} />
                </td>
                <td>{Array.isArray(u.prizes_claimed) ? u.prizes_claimed.join(", ") : ""}</td>
                <td>{u.streak || 1}</td>
                <td>
                  {manualEdit[u.email] ? (
                    <button onClick={() => handleSaveManualEdit(u.email)} style={{ background: PRIMARY_RED, color: "white", border: "none", borderRadius: 5, padding: "4px 12px" }}>Save</button>
                  ) : (
                    <button onClick={() => setManualEdit({ ...manualEdit, [u.email]: { stamp_count: u.stamp_count } })} style={{ background: PRIMARY_BLUE, color: "white", border: "none", borderRadius: 5, padding: "4px 12px" }}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={() => {
        const rows = getFilteredUsers().map(u => `${u.email},${u.display_name},${u.stamp_count}`);
        const csv = "Email,Name,Stamps\n" + rows.join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "users.csv";
        a.click();
      }} style={{ background: PRIMARY_BLUE, color: "white", border: "none", padding: "7px 14px", borderRadius: 5, marginTop: 12 }}>
        Export Emails/Users as CSV
      </button>
      <button onClick={() => { setAdminLoggedIn(false); }} style={{ marginTop: 22, background: "none", color: PRIMARY_RED, border: "none", textDecoration: "underline", fontSize: 15, cursor: "pointer" }}>Log out</button>
    </div>
  );
}

// --------------- ROUTER ---------------
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminLoginAndDashboard />} />
        <Route path="*" element={<UserLoginAndCard />} />
      </Routes>
    </Router>
  );
}

export default App;
