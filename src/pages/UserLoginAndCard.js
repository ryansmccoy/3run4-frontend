import { getAnnouncement } from "../utils/api";
import React, { useState, useEffect } from "react";
import logo from "../assets/logo-3run4.png";
import { getUserCard, createOrUpdateUser, addStamp, getPrizes } from "../utils/api";
import StampCard from "../components/StampCard";
import Footer from "../components/Footer";
import AboutButton from "../components/AboutButton";
import { FaInstagram, FaFacebook, FaGithub } from "react-icons/fa";

const PRIMARY_BLUE = "#143E8E";
const PRIMARY_RED = "#E02327";
const CARD_BG = "#fff";

// --- Newsletter Checkbox & Login Explanation ---
function LoginInfoBlock() {
  return (
    <div style={{
      background: "#f3f5f9",
      color: "#163e8e",
      fontSize: 15,
      padding: "9px 14px",
      borderRadius: 9,
      marginBottom: 16,
      lineHeight: 1.5
    }}>
      <span>
        Use an email to keep track of your stamp card.<br />
      </span>
    </div>
  );
}

// --- Waiver Modal (unchanged) ---
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
          <b>Code of Conduct:</b><br />
          • Be respectful to all participants<br />
          • Run safely and look out for others<br />
          • No harassment, discrimination, or unsportsmanlike behavior<br />
          <br />
          <b>Liability Waiver:</b><br />
          • You acknowledge you are participating at your own risk.<br />
          • The organizers are not responsible for any injury, loss, or damage.<br />
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
  // Initialize state with localStorage values if available
  const [email, setEmail] = useState(() => localStorage.getItem("3run4_email") || "");
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [initialStampsInput, setInitialStampsInput] = useState("");
  const [firstTime, setFirstTime] = useState(false);
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem("3run4_loggedIn") === "true");
  const [displayName, setDisplayName] = useState(() => localStorage.getItem("3run4_displayName") || "");
  const [stampCount, setStampCount] = useState(() => parseInt(localStorage.getItem("3run4_stampCount")) || 0);
  const [prizesClaimed, setPrizesClaimed] = useState(() => {
    const saved = localStorage.getItem("3run4_prizesClaimed");
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Prizes
  const [prizes, setPrizes] = useState([]);
  // Waiver
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [showWaiver, setShowWaiver] = useState(false);
  // Announcement
  const [announcement, setAnnouncement] = useState("");
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showPrizesModal, setShowPrizesModal] = useState(false);
  const [lastAnimatedIdx, setLastAnimatedIdx] = useState(-1); // For confetti animation

  // Load user data on app start if already logged in
  useEffect(() => {
    getPrizes().then(setPrizes).catch(() => setPrizes([]));
    getAnnouncement().then(a => setAnnouncement(a.text || ""));
    
    // If user is logged in from localStorage, refresh their data
    const savedEmail = localStorage.getItem("3run4_email");
    const savedLoggedIn = localStorage.getItem("3run4_loggedIn") === "true";
    if (savedEmail && savedLoggedIn) {
      // Refresh user data from server
      getUserCard(savedEmail)
        .then(data => {
          if (data && !data.error && (data.display_name || data.stamp_count !== undefined)) {
            setDisplayName(data.display_name || "");
            setStampCount(data.stamp_count || 0);
            setPrizesClaimed(data.prizes_claimed || []);
            
            // Update localStorage with fresh data
            localStorage.setItem("3run4_displayName", data.display_name || "");
            localStorage.setItem("3run4_stampCount", data.stamp_count || 0);
            localStorage.setItem("3run4_prizesClaimed", JSON.stringify(data.prizes_claimed || []));
          }
        })
        .catch(() => {
          // If refresh fails, keep the cached data but user stays logged in
          console.log("Could not refresh user data, using cached data");
        });
    }
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
        
        // Save to localStorage
        localStorage.setItem("3run4_email", emailTrimmed);
        localStorage.setItem("3run4_loggedIn", "true");
        localStorage.setItem("3run4_displayName", data.display_name || "");
        localStorage.setItem("3run4_stampCount", data.stamp_count || 0);
        localStorage.setItem("3run4_prizesClaimed", JSON.stringify(data.prizes_claimed || []));
      } else {
        setFirstTime(true);
        setWaiverAccepted(false);
        setShowWaiver(true);
        setDisplayName("");
        setStampCount(0);
        setPrizesClaimed([]);
        setLoggedIn(true);
        setError("");
        
        // Save to localStorage for new users
        localStorage.setItem("3run4_email", emailTrimmed);
        localStorage.setItem("3run4_loggedIn", "true");
        localStorage.setItem("3run4_displayName", "");
        localStorage.setItem("3run4_stampCount", "0");
        localStorage.setItem("3run4_prizesClaimed", "[]");
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
      
      // Save to localStorage even for new users (in case of network error)
      localStorage.setItem("3run4_email", emailTrimmed);
      localStorage.setItem("3run4_loggedIn", "true");
      localStorage.setItem("3run4_displayName", "");
      localStorage.setItem("3run4_stampCount", "0");
      localStorage.setItem("3run4_prizesClaimed", "[]");
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
      // Add waiver_accepted: true for new users, and newsletter flag
      const data = await createOrUpdateUser(email, displayNameInput, count, waiverAccepted, newsletterOptIn);
      setDisplayName(data.display_name || "");
      setStampCount(data.stamp_count || 0);
      setPrizesClaimed(data.prizes_claimed || []);
      setFirstTime(false);
      setError("");
      
      // Update localStorage
      localStorage.setItem("3run4_displayName", data.display_name || "");
      localStorage.setItem("3run4_stampCount", data.stamp_count || 0);
      localStorage.setItem("3run4_prizesClaimed", JSON.stringify(data.prizes_claimed || []));
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
        setLastAnimatedIdx(data.stamp_count - 1); // Set for confetti animation
        setStampCount(data.stamp_count);
        localStorage.setItem("3run4_stampCount", data.stamp_count);
      }
      if (data.prizes_claimed) {
        setPrizesClaimed(data.prizes_claimed);
        localStorage.setItem("3run4_prizesClaimed", JSON.stringify(data.prizes_claimed));
      }
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
    setNewsletterOptIn(false);
    
    // Clear localStorage
    localStorage.removeItem("3run4_email");
    localStorage.removeItem("3run4_loggedIn");
    localStorage.removeItem("3run4_displayName");
    localStorage.removeItem("3run4_stampCount");
    localStorage.removeItem("3run4_prizesClaimed");
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

  // Helper to get first two lines of announcement
  function getFirstTwoLines(text) {
    if (!text) return "";
    const lines = text.split("\n");
    return lines.slice(0, 2).join(" ") + (lines.length > 2 ? "..." : "");
  }

  // ----- Login/Sign up form -----
  if (!loggedIn) {
    return (
      <>
        <div style={{
          maxWidth: 380,
          margin: "3rem auto",
          padding: "2.3rem 1.7rem 1.5rem 1.7rem",
          textAlign: "center",
          background: CARD_BG,
          borderRadius: 16,
          boxShadow: "0 4px 16px rgba(20,62,142,0.10)"
        }}>
          <img src={logo} alt="3run4 logo" style={{ height: 60, marginBottom: 14 }} />
          <h2 style={{ color: PRIMARY_BLUE, marginBottom: 8 }}>3run4 Stamp Card</h2>
          <LoginInfoBlock />
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: "80%",
                padding: 12,
                fontSize: 16,
                border: `2px solid ${PRIMARY_BLUE}`,
                borderRadius: 8,
                marginBottom: 12
              }}
              required
            />
            <div style={{
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <input
                type="checkbox"
                id="newsletter"
                checked={newsletterOptIn}
                onChange={e => setNewsletterOptIn(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              <label htmlFor="newsletter" style={{
                fontSize: 14,
                color: "#163e8e",
                cursor: "pointer"
              }}>
                Yes, sign me up for the 3run4 newsletter!
              </label>
            </div>
            <button
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
            >
              {loading ? "Signing in..." : "Sign In / Sign Up"}
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

  // In your main return (when logged in and displayName is set)
  if (loggedIn && displayName) {
    return (
      <>
        <div style={{ maxWidth: 400, margin: "3rem auto", padding: "2rem", textAlign: "center", background: CARD_BG, borderRadius: 16, boxShadow: "0 4px 16px rgba(20,62,142,0.10)" }}>
          <img src={logo} alt="3run4 logo" style={{ height: 60, marginBottom: 12 }} />
          <h2 style={{ color: PRIMARY_BLUE, marginBottom: 10 }}>Welcome, {displayName}!</h2>
          {announcement && (
            <>
              <div
                style={{
                  background: "#fffbe6",
                  color: "#b36b00",
                  border: "1.5px solid #ffe58f",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 18,
                  fontSize: 15,
                  cursor: "pointer",
                  textAlign: "left"
                }}
                title="Click to read full announcement"
                onClick={() => setShowAnnouncementModal(true)}
              >
                <b>Announcement:</b> {getFirstTwoLines(announcement)}
                <span style={{ color: "#b36b00", fontWeight: 400, marginLeft: 6, fontSize: 13 }}>(click to read more)</span>
              </div>
              {showAnnouncementModal && (
                <div style={{
                  position: "fixed",
                  top: 0, left: 0, width: "100vw", height: "100vh",
                  background: "rgba(0,0,0,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000
                }}>
                  <div style={{
                    background: "#fff",
                    padding: 28,
                    borderRadius: 12,
                    minWidth: 320,
                    maxWidth: 400,
                    boxShadow: "0 4px 16px rgba(20,62,142,0.14)",
                    textAlign: "left"
                  }}>
                    <h3 style={{ color: "#143E8E", marginBottom: 12 }}>Announcement</h3>
                    <div style={{ whiteSpace: "pre-line", fontSize: 15, color: "#222", marginBottom: 18 }}>
                      {announcement}
                    </div>
                    <button
                      onClick={() => setShowAnnouncementModal(false)}
                      style={{
                        background: "#143E8E",
                        color: "#fff",
                        border: "none",
                        borderRadius: 7,
                        padding: "7px 18px",
                        fontWeight: 600,
                        fontSize: 15,
                        cursor: "pointer"
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          <div style={{ color: PRIMARY_BLUE, fontWeight: 600, marginBottom: 18, fontSize: 16 }}>{stampCount} stamps</div>
          <StampCard stampCount={stampCount} lastAnimatedIdx={lastAnimatedIdx} />
          
          {/* Centered View Prizes button */}
          <div style={{ margin: "18px 0", textAlign: "center" }}>
            <button
              onClick={() => setShowPrizesModal(true)}
              style={{
                background: "transparent",
                color: PRIMARY_BLUE,
                border: `2px solid ${PRIMARY_BLUE}`,
                borderRadius: 7,
                padding: "8px 16px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              View Prizes
            </button>
          </div>

          {/* Prizes Modal */}
          {showPrizesModal && (
            <div style={{
              position: "fixed",
              top: 0, left: 0, width: "100vw", height: "100vh",
              background: "rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000
            }}>
              <div style={{
                background: "#fff",
                padding: 28,
                borderRadius: 12,
                minWidth: 320,
                maxWidth: 400,
                boxShadow: "0 4px 16px rgba(20,62,142,0.14)",
                textAlign: "left"
              }}>
                <h3 style={{ color: PRIMARY_BLUE, marginBottom: 16, textAlign: "center" }}>Prizes</h3>
                <div style={{ fontSize: 15, marginBottom: 18 }}>
                  {prizes.length === 0
                    ? "No prizes set yet."
                    : prizes.map((p, i) => (
                      <div key={i} style={{ marginBottom: 8, padding: "8px 12px", background: "#f8f9fa", borderRadius: 6 }}>
                        <b>{p.stamps} stamps:</b> {p.prize}
                      </div>
                    ))
                  }
                </div>
                <button
                  onClick={() => setShowPrizesModal(false)}
                  style={{
                    background: PRIMARY_BLUE,
                    color: "#fff",
                    border: "none",
                    borderRadius: 7,
                    padding: "8px 20px",
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: "pointer",
                    width: "100%"
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleAddStamp}
            style={{
              background: PRIMARY_BLUE,
              color: "#fff",
              fontWeight: "bold",
              borderRadius: 7,
              fontSize: 18,
              border: "none",
              padding: "12px 0",
              width: "70%",
              margin: "0 auto 18px auto",
              display: "block",
              cursor: "pointer"
            }}
          >
            Add Stamp
          </button>
          {error && <p style={{ color: PRIMARY_RED, marginTop: 14, textAlign: "center" }}>{error}</p>}
          <button onClick={handleLogout} style={{ marginTop: 10, background: "none", color: PRIMARY_RED, border: "none", textDecoration: "underline", fontSize: 15, cursor: "pointer" }}>
            Log out
          </button>
          <Footer />
        </div>
        <AboutButton />
      </>
    );
  }
}
