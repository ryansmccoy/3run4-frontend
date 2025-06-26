import React, { useState, useEffect } from "react";
import logo from "../assets/logo-3run4.png";
import { getUserCard, createOrUpdateUser, addStamp, getPrizes } from "../utils/api";
import StampCard from "../components/StampCard";
import Footer from "../components/Footer";
import AboutButton from "../components/AboutButton";

const PRIMARY_BLUE = "#143E8E";
const PRIMARY_RED = "#E02327";
const CARD_BG = "#fff";

function WaiverModal({ onAccept }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
    }}>
      <div style={{
        background: "#fff", padding: 32, borderRadius: 12, maxWidth: 400,
        boxShadow: "0 4px 16px rgba(20,62,142,0.14)", textAlign: "left"
      }}>
        <h3 style={{ color: PRIMARY_BLUE, marginBottom: 12 }}>Run Club Code of Conduct & Waiver</h3>
        <div style={{ fontSize: 15, color: "#333", marginBottom: 16, lineHeight: 1.55 }}>
          <b>Code of Conduct:</b><br/>
          • Be respectful to all participants<br/>
          • Run safely and look out for others<br/>
          • No harassment, discrimination, or unsportsmanlike behavior<br/>
          <br/>
          <b>Liability Waiver:</b><br/>
          • You acknowledge you are participating at your own risk.<br/>
          • The organizers are not responsible for any injury, loss, or damage.<br/>
          • By clicking "I Agree," you confirm you have read and accept this waiver.
        </div>
        <button
          onClick={onAccept}
          style={{
            padding: "10px 28px", background: PRIMARY_BLUE, color: "#fff",
            fontWeight: "bold", borderRadius: 7, fontSize: 15, border: "none", cursor: "pointer"
          }}>
          I Agree
        </button>
      </div>
    </div>
  );
}

export default function UserLoginAndCard() {
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

  // Prizes
  const [prizes, setPrizes] = useState([]);
  // Waiver
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [showWaiver, setShowWaiver] = useState(false);

  // Confetti animation
  const [lastAnimatedIdx, setLastAnimatedIdx] = useState(null);

  useEffect(() => {
    getPrizes().then(setPrizes).catch(() => setPrizes([]));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const emailTrimmed = email.trim().toLowerCase();
    try {
      const data = await getUserCard(emailTrimmed);
      if (data && !data.error && (data.display_name || data.stamp_count !== undefined)) {
        setDisplayName(data.display_name || "");
        setStampCount(data.stamp_count || 0);
        setPrizesClaimed(data.prizes_claimed || []);
        setFirstTime(false);
        setWaiverAccepted(!!data.waiver_accepted);
        setLoggedIn(true);
        setError("");
      } else {
        setFirstTime(true);
        setWaiverAccepted(false);
        setShowWaiver(true);
        setDisplayName("");
        setStampCount(0);
        setPrizesClaimed([]);
        setLoggedIn(true);
        setError("");
      }
    } catch {
      setFirstTime(true);
      setWaiverAccepted(false);
      setShowWaiver(true);
      setDisplayName("");
      setStampCount(0);
      setPrizesClaimed([]);
      setLoggedIn(true);
      setError("");
    }
    setLoading(false);
  };

  const handleSetDisplayName = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let count = undefined;
      if (firstTime && initialStampsInput && !isNaN(Number(initialStampsInput))) {
        count = Number(initialStampsInput);
      }
      // Add waiver_accepted: true for new users
      const data = await createOrUpdateUser(email, displayNameInput, count, waiverAccepted);
      setDisplayName(data.display_name || "");
      setStampCount(data.stamp_count || 0);
      setPrizesClaimed(data.prizes_claimed || []);
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
      const data = await addStamp(email);
      if (data.stamp_count !== undefined) {
        setLastAnimatedIdx(data.stamp_count - 1);
        setStampCount(data.stamp_count);
        setTimeout(() => setLastAnimatedIdx(null), 1200); // Remove after animation
      }
      if (data.prizes_claimed) setPrizesClaimed(data.prizes_claimed);
      setError(data.error || "");
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
    setWaiverAccepted(false);
    setShowWaiver(false);
    setLastAnimatedIdx(null);
  };

  // Show Waiver Modal for new users
  if (showWaiver && firstTime && !waiverAccepted) {
    return (
      <WaiverModal
        onAccept={() => {
          setWaiverAccepted(true);
          setShowWaiver(false);
        }}
      />
    );
  }

  if (!loggedIn) {
    return (
      <>
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
          <Footer />
        </div>
        <AboutButton />
      </>
    );
  }

  if (loggedIn && !displayName) {
    return (
      <>
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
            <button style={{ marginTop: 10, padding: "10px 30px", fontSize: 16, background: PRIMARY_BLUE, color: "white", border: "none", borderRadius: 8, letterSpacing: 1, fontWeight: "bold", cursor: "pointer" }} type="submit" disabled={loading || !displayNameInput.trim() || (firstTime && !waiverAccepted)}>
              {loading ? "Saving..." : "Save"}
            </button>
          </form>
          {error && <p style={{ color: PRIMARY_RED, marginTop: 14 }}>{error}</p>}
          <button onClick={handleLogout} style={{ marginTop: 22, background: "none", color: PRIMARY_RED, border: "none", textDecoration: "underline", fontSize: 15, cursor: "pointer" }}>Log out</button>
          <Footer />
        </div>
        <AboutButton />
      </>
    );
  }

  return (
    <>
      <div style={{ maxWidth: 400, margin: "3rem auto", padding: "2rem", textAlign: "center", background: CARD_BG, borderRadius: 16, boxShadow: "0 4px 16px rgba(20,62,142,0.10)" }}>
        <img src={logo} alt="3run4 logo" style={{ height: 60, marginBottom: 12 }} />
        <h2>
          <span style={{ color: PRIMARY_BLUE }}>Welcome,</span>{" "}
          <span style={{ color: PRIMARY_RED }}>{displayName || email}</span>!
        </h2>
        <div style={{ margin: "16px 0 10px 0", color: PRIMARY_RED, fontWeight: 700 }}>Your stamp card:</div>
        <StampCard stampCount={stampCount} lastAnimatedIdx={lastAnimatedIdx} />
        <div style={{margin:"10px 0 5px 0", color:PRIMARY_BLUE, fontWeight:700}}>Prizes:</div>
        <div style={{fontSize:15, marginBottom:6}}>
          {prizes.length === 0
            ? "No prizes set yet."
            : prizes.map((p, i) => (
                <div key={i}>
                  <b>{p.stamps} stamps:</b> {p.prize}
                </div>
              ))
          }
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
      <AboutButton />
    </>
  );
}
