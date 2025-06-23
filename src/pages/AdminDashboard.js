import React, { useState, useEffect } from "react";
import logo from "../assets/logo-3run4.png";
import { fetchUsers, createOrUpdateUser, fetchPrizes } from "../utils/api";
import AdminTable from "../components/AdminTable";
import Footer from "../components/Footer";
import AboutButton from "../components/AboutButton";
import PrizeTableModal from "../components/PrizeTableModal";

const PRIMARY_BLUE = "#143E8E";
const PRIMARY_RED = "#E02327";
const CARD_BG = "#fff";

const DEFAULT_PRIZE_TABLE = [
  { stamps: 5, prize: "Hat" },
  { stamps: 10, prize: "Case of Beer" },
  { stamps: 15, prize: "Model Car" }
];

export default function AdminDashboard() {
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterWeek, setFilterWeek] = useState("this");
  const [customWeek, setCustomWeek] = useState("");
  const [raffleWinner, setRaffleWinner] = useState(null);
  const [manualEdit, setManualEdit] = useState({});
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [prizeTable, setPrizeTable] = useState(DEFAULT_PRIZE_TABLE);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  // Sorting state
  const [sortColumn, setSortColumn] = useState("email");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    if (adminLoggedIn) {
      fetchUsersList();
      fetchPrizes().then(p => {
        if (Array.isArray(p)) setPrizeTable(p);
      });
    }
    // eslint-disable-next-line
  }, [adminLoggedIn]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminEmail === "admin@3run4.org" && adminPassword === "3run4") {
      setAdminLoggedIn(true);
      setAdminError("");
    } else {
      setAdminError("Invalid admin credentials");
    }
  };

  const fetchUsersList = async () => {
    setLoadingUsers(true);
    setUsersError("");
    try {
      const allUsers = await fetchUsers();
      setUsers(Array.isArray(allUsers) ? allUsers : []);
    } catch {
      setUsersError("Failed to load users.");
    }
    setLoadingUsers(false);
  };

  const getFilteredUsers = () => {
    let filtered = users;
    if (searchQuery) {
      filtered = filtered.filter(
        u =>
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (u.display_name || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Sorting
    filtered = [...filtered].sort((a, b) => {
      let aVal = a[sortColumn] || "";
      let bVal = b[sortColumn] || "";
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return filtered;
  };

  const handleManualEdit = (email, field, value) => {
    setManualEdit({ ...manualEdit, [email]: { ...manualEdit[email], [field]: value } });
  };

  const handleSaveManualEdit = async (email) => {
    const userEdit = manualEdit[email];
    if (!userEdit) return;
    try {
      await createOrUpdateUser(email, undefined, userEdit.stamp_count);
      await fetchUsersList();
      setManualEdit({ ...manualEdit, [email]: undefined });
    } catch {
      alert("Failed to update user.");
    }
  };

  const handlePickRaffleWinner = () => {
    const eligible = getFilteredUsers();
    if (!eligible.length) {
      setRaffleWinner(null);
      return;
    }
    const winner = eligible[Math.floor(Math.random() * eligible.length)];
    setRaffleWinner(winner);
  };

  const handleDeleteUserClick = (user) => {
    setUserToDelete(user);
    setShowDeletePopup(true);
  };

  if (!adminLoggedIn) {
    return (
      <>
        <div style={{ maxWidth: 350, margin: "3rem auto", padding: "2rem", textAlign: "center", background: CARD_BG, borderRadius: 16, boxShadow: "0 4px 16px rgba(20,62,142,0.10)" }}>
          <img src={logo} alt="3run4 logo" style={{ height: 46, marginBottom: 10 }} />
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
        <Footer />
        <AboutButton />
      </>
    );
  }

  return (
    <>
      <div style={{ maxWidth: 950, margin: "2rem auto", padding: "2rem", background: CARD_BG, borderRadius: 18, boxShadow: "0 4px 24px rgba(20,62,142,0.08)" }}>
        <img src={logo} alt="3run4 logo" style={{ height: 46, marginBottom: 10 }} />
        <h2 style={{ color: PRIMARY_BLUE, marginTop: 0, marginBottom: 10 }}>Admin Dashboard</h2>

        <button
          onClick={() => setShowPrizeModal(true)}
          style={{ marginBottom: 12, background: "#143E8E", color: "#fff", border: "none", borderRadius: 7, padding: "8px 16px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}
        >
          Edit Prizes
        </button>
        <PrizeTableModal
          open={showPrizeModal}
          onClose={() => setShowPrizeModal(false)}
          prizeTable={prizeTable}
          setPrizeTable={setPrizeTable}
        />

        {/* Display the current prize table */}
        <ul style={{ listStyle: "none", padding: 0, fontSize: 15, marginBottom: 14 }}>
          {prizeTable.map((pr, i) => (
            <li key={i}><b>{pr.stamps} stamps:</b> {pr.prize}</li>
          ))}
        </ul>

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
          <button onClick={fetchUsersList} style={{ background: PRIMARY_BLUE, color: "white", border: "none", padding: "7px 14px", borderRadius: 5 }}>Refresh</button>
          <button onClick={handlePickRaffleWinner} style={{ background: PRIMARY_RED, color: "white", border: "none", padding: "7px 14px", borderRadius: 5, marginLeft: 16 }}>Pick Raffle Winner</button>
        </div>
        {raffleWinner && (
          <div style={{ background: "#f8fcf3", color: PRIMARY_RED, fontWeight: 700, border: `2px dashed ${PRIMARY_RED}`, padding: 16, marginBottom: 14, borderRadius: 8 }}>
            🎉 Raffle Winner: {raffleWinner.display_name || raffleWinner.email}
          </div>
        )}
        {loadingUsers && <div>Loading...</div>}
        {usersError && <div style={{ color: PRIMARY_RED }}>{usersError}</div>}
        <AdminTable
          users={getFilteredUsers()}
          manualEdit={manualEdit}
          handleManualEdit={handleManualEdit}
          handleSaveManualEdit={handleSaveManualEdit}
          setManualEdit={setManualEdit}
          onDeleteUser={fetchUsersList} // <--- this triggers a refresh after delete!
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={(col) => {
            if (sortColumn === col) {
              setSortDirection(sortDirection === "asc" ? "desc" : "asc");
            } else {
              setSortColumn(col);
              setSortDirection("asc");
            }
          }}
        />
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
        <Footer />
      </div>
      <AboutButton />
    </>
  );
}
